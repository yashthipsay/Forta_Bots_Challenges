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
} from "forta-agent";
import { provideInitialize, provideUtilization } from "./agent";
import { createAddress } from "forta-agent-tools";
import {
  CONFIGURATOR_PROXY,
  SUPPLY,
  USDC_TOKEN_ETH,
  WITHDRAW,
} from "./constants";
import Helper from "./helper";
import { getAlerts } from "forta-agent";
jest.mock("forta-agent", () => ({
  ...jest.requireActual("forta-agent"),
  getAlerts: jest.fn(),
}));

describe("Compound test suite for lending and borrowing", () => {
  let mockProvider = new MockEthersProvider();
  let handleTransaction: HandleTransaction;
  let txEvent: TestTransactionEvent;
  let initialize: any;
  let helper: Helper;
  let mockAssetTokenAddress = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";
  let mockConfiguratorProxy = "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3";
  const functions = [
    `function getConfiguration(address cometProxy) view returns (tuple(address governor, address pauseGuardian, address baseToken, address baseTokenPriceFeed, address extensionDelegate, uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, uint64 storeFrontPriceFactor, uint64 trackingIndexScale, uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves, tuple(address asset, uint8 decimals, uint256 conversionFactor)[] assetConfigs) configuration)`,
    `function getUtilization() public view returns (uint)`,
    `function getSupplyRate(uint utilization) public view returns (uint64)`,
    `function getBorrowRate(uint utilization) public view returns (uint64)`,
  ];
  const OTHER_FUNCTION = "function otherFunction(address asset, uint amount)";
  const Iface = new ethers.utils.Interface(functions);
  const provideInterface = new ethers.utils.Interface([
    SUPPLY,
    WITHDRAW,
    OTHER_FUNCTION,
  ]);

  const mockAlerts = (alertId: string, kink: any, utilization: any) => {
    (getAlerts as jest.Mock).mockResolvedValue({
      alerts: [
        {
          alertId: alertId,
          hasAddress: jest.fn().mockReturnValue(false),
          metadata: {
            kink: kink,
            utilization: utilization,
          },
        },
      ],
      pageInfo: {hasNextPage: false},
    })
  }

  beforeEach(() => {
    handleTransaction = provideUtilization(mockProvider as any);
    initialize = provideInitialize(mockProvider as any);
    helper = new Helper(mockProvider as any);
    txEvent = new TestTransactionEvent().setBlock(0);
    jest.spyOn(helper, "getConfigurator").mockResolvedValue(CONFIGURATOR_PROXY);
  });

  let setupMockProvider = async (
    supplyKink: ethers.BigNumber,
    borrowKink: ethers.BigNumber,
    utilization: ethers.BigNumber,
  ) => {
    mockProvider.setNetwork(1);
    mockProvider.addCallTo(mockConfiguratorProxy, 0, Iface, "getConfiguration", {
      inputs: [USDC_TOKEN_ETH],
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
              asset: mockAssetTokenAddress,
              decimals: 18,
              conversionFactor: 1,
            },
          ],
        },
      ],
    });
    mockProvider.addCallTo(USDC_TOKEN_ETH, 0, Iface, "getUtilization", {
      inputs: [],
      outputs: [utilization],
    });
    mockProvider.addCallTo(USDC_TOKEN_ETH, 0, Iface, "getSupplyRate", {
      inputs: [utilization],
      outputs: [986453221],
    });
    mockProvider.addCallTo(USDC_TOKEN_ETH, 0, Iface, "getBorrowRate", {
      inputs: [utilization],
      outputs: [1064532211],
    });
  };

  it("returns findings if supplier liquidates when supply kink is higher that upper limit", async () => {
    setupMockProvider(
      ethers.BigNumber.from("860000000000000000"),
      ethers.BigNumber.from("5000000000000000000"),
      ethers.BigNumber.from("860000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent.addTraces({
      function: provideInterface.getFunction("supply"),
      to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
      from: createAddress("0x123"),
      arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 20],
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

  it("returns findings if borrower borrows when borrow kink is less that lower limit", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("9600000000000000000"),
      ethers.BigNumber.from("300000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent.addTraces({
      function: provideInterface.getFunction("withdraw"),
      to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
      from: createAddress("0x123"),
      arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
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

  it("returns a finding among multiple transactions that are not supply, if the utlization is above the upper limit of supply kink ", async () => {
    setupMockProvider(
      ethers.BigNumber.from("860000000000000000"),
      ethers.BigNumber.from("5000000000000000000"),
      ethers.BigNumber.from("860000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent
      .addTraces({
        function: provideInterface.getFunction("supply"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: [mockAssetTokenAddress, 20],
      })
      .addTraces({
        function: provideInterface.getFunction("otherFunction"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: [mockAssetTokenAddress, 10],
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

  // Test to check if the there is no finding above lower limit and below upper limit

  it("return 0 findings if utilization is less than upper limit of supply link and more that lower limit of borrow kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("500000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent
      .addTraces({
        function: provideInterface.getFunction("withdraw"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      })
      .addTraces({
        function: provideInterface.getFunction("supply"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      });

    const findings = await handleTransaction(txEvent);

    expect(findings).toHaveLength(0);
  });
  // Test to check if there is a finding between multiple transactions that are within the desired range and transactions that are outside the desired range
  it("returns a finding among multiple transactions that are not withdraw, if the utlization is below the borrow kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("9600000000000000000"),
      ethers.BigNumber.from("300000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent.addTraces(
      {
        function: provideInterface.getFunction("withdraw"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
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

  it("returns multiple findings among multiple transactions that are not withdraw, if the utlization is below the borrow kink", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("9600000000000000000"),
      ethers.BigNumber.from("300000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent.addTraces(
      {
        function: provideInterface.getFunction("withdraw"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      },
      {
        function: provideInterface.getFunction("withdraw"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 20],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      },
    );

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toBe(2);
  });

  // Test to check if there are no findings for the same case above, for a transaction which is outside the desired range
  it("return 0 findings if utilization is less than upper limit of supply link and more that lower limit of borrow kink, among multiple functions that are not withdraw or supply", async () => {
    setupMockProvider(
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("900000000000000000"),
      ethers.BigNumber.from("500000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent.addTraces(
      {
        function: provideInterface.getFunction("withdraw"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      },
      {
        function: provideInterface.getFunction("supply"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      },
      {
        function: provideInterface.getFunction("otherFunction"),
        to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
        from: createAddress("0x123"),
        arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 10],
      },
    );

    const findings = await handleTransaction(txEvent);

    expect(findings).toHaveLength(0);
  });

  it("should return finding if utilization is more that supply kink", async() => {
    setupMockProvider(
      ethers.BigNumber.from("860000000000000000"),
      ethers.BigNumber.from("5000000000000000000"),
      ethers.BigNumber.from("870000000000000000"),
    );

    mockProvider.setNetwork(1);
    await initialize();
    txEvent.addTraces({
      function: provideInterface.getFunction("supply"),
      to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
      from: createAddress("0x123"),
      arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 20],
    });

    mockAlerts("SUPPLY-2", "860000000000000000", "870000000000000000");

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
  })
});
