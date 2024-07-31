import {
  TestTransactionEvent,
  MockEthersProvider,
} from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { provideHandleGovernanceTransaction } from "./agent";
import {
  ethers,
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
} from "forta-agent";
import { CONFIGURATOR_PROXY } from "./constants";
import * as helper from "./helper";

describe("Compound test suite", () => {
  let handleTransaction: HandleTransaction;
  let mockProvider: MockEthersProvider;
  let txEvent: TestTransactionEvent;
  const mockAssetTokenAddress = createAddress("0x10957");
  const mockArgs = [
    createAddress("0x1421"),
    createAddress("0x123"),
    createAddress("0x234"),
  ];
  const assetInfo = [
    `function getAssetInfo(uint8 i) public view returns (uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap)`,
  ];
  const Iface = new ethers.utils.Interface(assetInfo);
  const getCollateralName = new ethers.utils.Interface([
    "function name() view returns (string)",
  ]);
  const mockConfigurator = "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3"
 

  const setupMockProvider = (collateralAddresses: string[]) => {
    mockProvider.setNetwork(1);
    collateralAddresses.forEach((address, index) => {
      mockProvider.addCallTo(mockAssetTokenAddress, 0, Iface, "getAssetInfo", {
        inputs: [index],
        outputs: [
          index,
          address,
          createAddress("0x234"),
          4,
          12,
          134,
          1245,
          1265,
        ],
      });
      mockProvider.addCallTo(address, 0, getCollateralName, "name", {
        inputs: [],
        outputs: [`Collateral-${index + 1}`],
      });
    });
  };

  beforeEach(() => {
    mockProvider = new MockEthersProvider() as any;
    const provider = mockProvider as unknown as ethers.providers.Provider;
    handleTransaction = provideHandleGovernanceTransaction(
      provider,
      assetInfo,
    );
    txEvent = new TestTransactionEvent().setBlock(0);
    jest.spyOn(helper, "getAddress").mockResolvedValue(mockAssetTokenAddress);
    jest.spyOn(helper, "getConfigurator").mockResolvedValue(mockConfigurator);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return single finding for single event occurence", async () => {
    const collateralAddresses = [
      createAddress("0x1247"),
      createAddress("0x12567"),
      createAddress("0x1289"),
      createAddress("0x1290"),
    ];
    setupMockProvider(collateralAddresses);

    txEvent.addEventLog(
      "event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)",
      mockConfigurator,
      [...mockArgs],
    );

    const metadata1: { [key: string]: any } = {
      SetGovernor: {
        Old_value: createAddress("0x123"),
        New_value: createAddress("0x234"),
      },
    };
    const metadata = {
      "Collateral Asset - Collateral-1":
        "0x0000000000000000000000000000000000001247",
      "Collateral Asset - Collateral-2":
        "0x0000000000000000000000000000000000012567",
      "Collateral Asset - Collateral-3":
        "0x0000000000000000000000000000000000001289",
      "Collateral Asset - Collateral-4":
        "0x0000000000000000000000000000000000001290",
    };

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(1);
    expect(findings).toEqual([
      Finding.fromObject({
        name: `Change of asset values due to governance proposal`,
        description: `The asset ${mockAssetTokenAddress} has been modified by a governance proposal`,
        alertId: "GOV-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: txEvent.network.toString(),
        metadata: {
          ...metadata1,
          ...metadata,
        },
      }),
    ]);

    mockProvider.clear();
    expect(findings.length).toStrictEqual(1);
  });

  it("should return 0 findings for event other than proposal change", async () => {
    mockProvider.setNetwork(1);
    txEvent.addEventLog(
      "event mockEvent(address value1, uint8 value2)",
      mockConfigurator,
      [createAddress("0x9467"), 2],
    );

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(0);
  });

  it("should return 0 findings for multiple non-governance events", async () => {
    mockProvider.setNetwork(1);
    const nonGovEvents = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Deposit(address indexed user, address reciepient, uint256 amount)",
    ];

    nonGovEvents.forEach((eventSignature) => {
      txEvent.addEventLog(eventSignature, CONFIGURATOR_PROXY, [
        createAddress("0x12345"),
        createAddress("0x67890"),
        1000,
      ]);
    });

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(0);
  });

  it("should return a finding for a governance event out of multiple non-governance events", async () => {
    const metadata = {
      "Collateral Asset - Collateral-1":
        "0x0000000000000000000000000000000000001247",
      "Collateral Asset - Collateral-2":
        "0x0000000000000000000000000000000000012567",
      "Collateral Asset - Collateral-3":
        "0x0000000000000000000000000000000000001289",
      "Collateral Asset - Collateral-4":
        "0x0000000000000000000000000000000000001290",
    };

    const metadata1: { [key: string]: any } = {
      SetGovernor: {
        Old_value: createAddress("0x123"),
        New_value: createAddress("0x234"),
      },
    };
    mockProvider.setNetwork(1);
    const nonGovEvents = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Deposit(address indexed user, address reciepient, uint256 amount)",
    ];
    nonGovEvents.forEach((eventSignature) => {
      txEvent.addEventLog(eventSignature, mockConfigurator, [
        createAddress("0x12345"),
        createAddress("0x67890"),
        1000,
      ]);
    });

    txEvent.addEventLog(
      "event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)",
      mockConfigurator,
      [...mockArgs],
    );
    const findings = await handleTransaction(txEvent);
    expect(findings).toEqual([
      Finding.fromObject({
        name: `Change of asset values due to governance proposal`,
        description: `The asset ${mockAssetTokenAddress} has been modified by a governance proposal`,
        alertId: "GOV-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: txEvent.network.toString(),
        metadata: {
          ...metadata1,
          ...metadata,
        },
      }),
    ]);
  });

  it("should return multiple findings for multiple valid governance events out of multiple invalid and valid governance events", async () => {
    const metadata1: { [key: string]: any } = {
      SetGovernor: {
        Old_value: createAddress("0x123"),
        New_value: createAddress("0x234"),
      },
      UpdateAssetBorrowCollateralFactor: {
        Old_value: "100",
        New_value: "200",
      },
      UpdateAssetLiquidateCollateralFactor: {
        Old_value: "100",
        New_value: "200",
      },
      SetBorrowKink: {
        Old_value: "100",
        New_value: "200",
      },
      SetSupplyKink: {
        Old_value: "100",
        New_value: "250",
      },
    };

    const metadata = {
      "Collateral Asset - Collateral-1":
        "0x0000000000000000000000000000000000001247",
      "Collateral Asset - Collateral-2":
        "0x0000000000000000000000000000000000012567",
      "Collateral Asset - Collateral-3":
        "0x0000000000000000000000000000000000001289",
      "Collateral Asset - Collateral-4":
        "0x0000000000000000000000000000000000001290",
    };

    const collateralAddresses = [
      createAddress("0x1247"),
      createAddress("0x12567"),
      createAddress("0x1289"),
      createAddress("0x1290"),
    ];
    setupMockProvider(collateralAddresses);

    const nonGovEvents = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Deposit(address indexed user, address reciepient, uint256 amount)",
    ];

    nonGovEvents.forEach((eventSignature) => {
      txEvent.addEventLog(eventSignature, createAddress("0xABCDEF"), [
        createAddress("0x12345"),
        createAddress("0x67890"),
        1000,
      ]);
    });

    txEvent.addEventLog(
      "event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)",
      mockConfigurator,
      [...mockArgs],
    );
    txEvent.addEventLog(
      "event SetBorrowKink(address indexed cometProxy,uint64 oldKink, uint64 newKink)",
      mockConfigurator,
      [mockArgs[1], 100, 200],
    );
    txEvent.addEventLog(
      "event SetSupplyKink(address indexed cometProxy,uint64 oldKink, uint64 newKink)",
      mockConfigurator,
      [mockArgs[1], 100, 250],
    );
    txEvent.addEventLog(
      "event UpdateAssetBorrowCollateralFactor(address indexed cometProxy, address indexed asset, uint64 oldBorrowCF, uint64 newBorrowCF)",
      mockConfigurator,
      [mockArgs[1], createAddress("0x123"), 100, 200],
    );
    txEvent.addEventLog(
      "event UpdateAssetLiquidateCollateralFactor(address indexed cometProxy, address indexed asset, uint64 oldLiquidateCF, uint64 newLiquidateCF)",
      mockConfigurator,
      [mockArgs[1], createAddress("0x123"), 100, 200],
    );
    const findings = await handleTransaction(txEvent);
    expect(findings).toEqual([
      Finding.fromObject({
        name: `Change of asset values due to governance proposal`,
        description: `The asset ${mockAssetTokenAddress} has been modified by a governance proposal`,
        alertId: "GOV-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: txEvent.network.toString(),
        metadata: {
          ...metadata1,
          ...metadata,
        },
      }),
    ]);
    mockProvider.clear();
    expect(findings.length).toStrictEqual(1);
  });
});
