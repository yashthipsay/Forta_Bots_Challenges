import {
  MockEthersProvider,
  TestTransactionEvent,
} from "forta-agent-tools/lib/test";

import {
  ethers,
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  Initialize,
} from "forta-agent";

import { provideInitialize, provideHandleTransaction } from "./agent";
import { createAddress } from "forta-agent-tools";
import Helper from "./helper";
import { NetworkManager } from "forta-agent-tools";
import { NetworkData } from "./types";

describe("Compound test suite for lending and borrowing", () => {
  let mockProvider = new MockEthersProvider();
  let handleTransaction: HandleTransaction;
  let txEvent: TestTransactionEvent;
  let initialize: Initialize;
  let helper: Helper;

  let mockEthUsdcTokenAddress = createAddress("0x1423"); 
  let mockEthConfiguratorProxy = createAddress("0x1524");
  let mockPolygonmockEthUsdcTokenAddress = createAddress("0x2938");
  let mockPolygonConfiguratorProxy = createAddress("0x9182");

  let setupMockProvider: (
    supplyKink: ethers.BigNumber,
    borrowKink: ethers.BigNumber,
    utilization: ethers.BigNumber
  ) => Promise<void>;

  let mockConfig = {
    1: {
      usdc: mockEthUsdcTokenAddress,
      configurationProxy: mockEthConfiguratorProxy,
    },
    137: {
      usdc: mockPolygonmockEthUsdcTokenAddress,
      configurationProxy: mockPolygonConfiguratorProxy,
    },
  };

  const mockNetworkManager = new NetworkManager<NetworkData>(mockConfig);

  const functions = [
    `function getConfiguration(address cometProxy) view returns (tuple(address governor, address pauseGuardian, address baseToken, address baseTokenPriceFeed, address extensionDelegate, uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, uint64 storeFrontPriceFactor, uint64 trackingIndexScale, uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves, tuple(address asset, uint8 decimals, uint256 conversionFactor)[] assetConfigs) configuration)`,
    `function getUtilization() public view returns (uint)`,
    `function getSupplyRate(uint utilization) public view returns (uint64)`,
    `function getBorrowRate(uint utilization) public view returns (uint64)`,
  ];

  const OTHER_FUNCTION = "function otherFunction(address asset, uint amount)";

  const Iface = new ethers.utils.Interface(functions);

  const provideInterface = new ethers.utils.Interface([
    "function supply(address asset, uint amount)",
    "function withdraw(address asset, uint amount)",
    OTHER_FUNCTION,
  ]);

  const mockConfigurationContract = new ethers.Contract(
    mockEthConfiguratorProxy,
    Iface,
    mockProvider as any,
  );

  const mockProtocolInfoContract = new ethers.Contract(
    mockEthUsdcTokenAddress,
    Iface,
    mockProvider as any,
  );

  const supplyRateValue = 986453221;
  const borrowRateValue = 1064532211;

  beforeEach(async () => {
    handleTransaction = provideHandleTransaction();
    initialize = provideInitialize(mockProvider as any, mockNetworkManager);

    helper = new Helper(mockConfigurationContract, mockProtocolInfoContract);
    txEvent = new TestTransactionEvent().setBlock(0);

    mockProvider.setNetwork(1);
    await initialize();
  });

  setupMockProvider = async (
    supplyKink: ethers.BigNumber,
    borrowKink: ethers.BigNumber,
    utilization: ethers.BigNumber,
  ) => {
    mockProvider.addCallTo(
      mockEthConfiguratorProxy,
      0,
      Iface,
      "getConfiguration",
      {
        inputs: [mockEthUsdcTokenAddress],
        outputs: [
          {
            governor: createAddress("0x123"),
            pauseGuardian: createAddress("0x2375"),
            baseToken: createAddress("0x98235"),
            baseTokenPriceFeed: createAddress("0x1274"),
            extensionDelegate: createAddress("0x5124"),
            supplyKink: supplyKink,
            supplyPerYearInterestRateSlopeLow: 60,
            supplyPerYearInterestRateSlopeHigh: 100,
            supplyPerYearInterestRateBase: 900,
            borrowKink: borrowKink,
            borrowPerYearInterestRateSlopeLow: 100,
            borrowPerYearInterestRateSlopeHigh: 200,
            borrowPerYearInterestRateBase: 300,
            storeFrontPriceFactor: 50,
            trackingIndexScale: 50,
            baseTrackingSupplySpeed: 50,
            baseTrackingBorrowSpeed: 50,
            baseMinForRewards: 50,
            baseBorrowMin: 50,
            targetReserves: 50,
            assetConfigs: [
              {
                asset: mockEthUsdcTokenAddress,
                decimals: 18,
                conversionFactor: 1,
              },
            ],
          },
        ],
      },
    );

    mockProvider.addCallTo(
      mockEthUsdcTokenAddress,
      0,
      Iface,
      "getUtilization",
      {
        inputs: [],
        outputs: [utilization],
      },
    );

    mockProvider.addCallTo(mockEthUsdcTokenAddress, 0, Iface, "getSupplyRate", {
      inputs: [utilization],
      outputs: [supplyRateValue],
    });

    mockProvider.addCallTo(mockEthUsdcTokenAddress, 0, Iface, "getBorrowRate", {
      inputs: [utilization],
      outputs: [borrowRateValue],
    });
  };

  it("returns findings if supplier liquidates when supply kink is higher than upper limit", async () => {
    setupMockProvider(
      ethers.BigNumber.from("860000000000000000"),
      ethers.BigNumber.from("5000000000000000000"),
      ethers.BigNumber.from("860000000000000000"),
    );

    txEvent.addTraces({
      function: provideInterface.getFunction("supply"),
      to: mockEthUsdcTokenAddress,
      from: createAddress("0x123"),
      arguments: [mockEthUsdcTokenAddress, 20],
    });

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: `Lender's incentivized to supply`,
        description: `The Supply APR is 3.11, which is favourable for lenders, as the utlization rate is 86`,
        alertId: "SUPPLY-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          SupplyRate: "3.11",
          Utilization: "86",
        },
      }),
    ]);
  });

  // Test for borrower incentive and if it is below the lower limit

  it("returns findings if borrower borrows when borrow kink is less than lower limit", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("9600000000000000000"),
      ethers.BigNumber.from("300000000000000000"),
    );

    txEvent.addTraces({
      function: provideInterface.getFunction("withdraw"),
      to: mockEthUsdcTokenAddress,
      from: createAddress("0x123"),
      arguments: [mockEthUsdcTokenAddress, 10],
    });

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: `Borrower's incentivized to borrow`,
        description: `The Borrow APR is 3.36, which is favourable for borrowers, as the optimal utilization rate is 30`,
        alertId: "BORROW-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          BorrowRate: "3.36",
          Utilization: "30",
        },
      }),
    ]);
  });

  it("returns a finding among multiple function calls that are not supply, if the utilization is above the upper limit of supply kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("860000000000000000"),
      ethers.BigNumber.from("5000000000000000000"),
      ethers.BigNumber.from("860000000000000000"),
    );

    txEvent
      .addTraces({
        function: provideInterface.getFunction("supply"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 20],
      })
      .addTraces({
        function: provideInterface.getFunction("otherFunction"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      });

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: `Lender's incentivized to supply`,
        description: `The Supply APR is 3.11, which is favourable for lenders, as the utlization rate is 86`,
        alertId: "SUPPLY-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          SupplyRate: "3.11",
          Utilization: "86",
        },
      }),
    ]);
  });

  // Test to check if there is no finding above lower limit and below upper limit

  it("return 0 findings if utilization is less than upper limit of supply link and more than lower limit of borrow kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("500000000000000000"),
    );

    txEvent
      .addTraces({
        function: provideInterface.getFunction("withdraw"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      })
      .addTraces({
        function: provideInterface.getFunction("supply"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      });

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  // Test to check if there is a finding between multiple transactions that are within the desired range and transactions that are outside the desired range

  it("returns a finding among multiple transactions that are not withdraw, if the utilization is below the borrow kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("9600000000000000000"),
      ethers.BigNumber.from("300000000000000000"),
    );

    txEvent.addTraces(
      {
        function: provideInterface.getFunction("withdraw"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
    );

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: `Borrower's incentivized to borrow`,
        description: `The Borrow APR is 3.36, which is favourable for borrowers, as the optimal utilization rate is 30`,
        alertId: "BORROW-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          BorrowRate: "3.36",
          Utilization: "30",
        },
      }),
    ]);
  });

  // Test to check if there are multiple findings for the same case above

  it("returns multiple findings among multiple transactions that are not withdraw, if the utilization is below the borrow kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("9600000000000000000"),
      ethers.BigNumber.from("300000000000000000"),
    );

    txEvent.addTraces(
      {
        function: provideInterface.getFunction("withdraw"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
      {
        function: provideInterface.getFunction("withdraw"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 20],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
    );

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: `Borrower's incentivized to borrow`,
        description: `The Borrow APR is 3.36, which is favourable for borrowers, as the optimal utilization rate is 30`,
        alertId: "BORROW-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          BorrowRate: "3.36",
          Utilization: "30",
        },
      }),
      Finding.fromObject({
        name: `Borrower's incentivized to borrow`,
        description: `The Borrow APR is 3.36, which is favourable for borrowers, as the optimal utilization rate is 30`,
        alertId: "BORROW-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          BorrowRate: "3.36",
          Utilization: "30",
        },
      }),
    ]);
  });

  // Test to check if there are no findings for the same case above, for a transaction which is outside the desired range

  it("return 0 findings if utilization is less than upper limit of supply link and more than lower limit of borrow kink, among multiple functions that are not withdraw or supply", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("500000000000000000"),
    );

    txEvent.addTraces(
      {
        function: provideInterface.getFunction("withdraw"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
      {
        function: provideInterface.getFunction("supply"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: mockEthUsdcTokenAddress,
        from: createAddress("0x123"),
        arguments: [mockEthUsdcTokenAddress, 10],
      },
    );

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("should return finding if utilization is more than supply kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("860000000000000000"),
      ethers.BigNumber.from("5000000000000000000"),
      ethers.BigNumber.from("870000000000000000"),
    );

    txEvent.addTraces({
      function: provideInterface.getFunction("supply"),
      to: mockEthUsdcTokenAddress,
      from: createAddress("0x123"),
      arguments: [mockEthUsdcTokenAddress, 20],
    });

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: `Utilization is above the optimal value. APR for lenders are at the highest!`,
        description: `The Supply APR is at the highest, and the Supply Interest Rate slope is higher, which is favourable for lenders`,
        alertId: "SUPPLY-2",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          SupplyRate: "3.11",
          Utilization: "87",
        },
      }),
    ]);
  });

  it("should return a finding if utilization is more than borrow kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("860000000000000000"),
      ethers.BigNumber.from("500000000000000000"),
      ethers.BigNumber.from("870000000000000000"),
    );

    txEvent.addTraces({
      function: provideInterface.getFunction("withdraw"),
      to: mockEthUsdcTokenAddress,
      from: createAddress("0x123"),
      arguments: [mockEthUsdcTokenAddress, 20],
    });

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: `Utilization is above the optimal value. APR for borrowers is not favourable!`,
        description: `The Borrow APR is at the highest, and the Borrow Interest Rate slope is higher, which is unfavourable for borrowers`,
        alertId: "BORROW-2",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Compound",
        metadata: {
          BorrowRate: "3.36",
          Utilization: "87",
        },
      }),
    ]);
  });
});
