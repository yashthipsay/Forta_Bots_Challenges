import {
  TestTransactionEvent,
  MockEthersProvider,
} from "forta-agent-tools/lib/test";
import { provideHandleGovernanceTransaction } from "./agent";
import {
  ethers,
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
} from "forta-agent";
import {
  ASSET_INFO,
  CONFIGURATOR_PROXY,
  SET_GOVERNOR,
  USDC_TOKEN,
} from "./constants";
import { createAddress } from "forta-agent-tools";

let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(ASSET_INFO);
let getCollateralName = new ethers.utils.Interface([
  "function name() view returns (string)",
]);

describe("Compound test suite", () => {
  let txEvent: TestTransactionEvent;

  const mockArgs = [
    createAddress("0x1421"),
    createAddress("0x123"),
    createAddress("0x234"),
  ];

  let mockProvider: MockEthersProvider;
  let provider: ethers.providers.Provider;
  const mockAssetTokenAddress = createAddress("0x10957");
  beforeAll(() => {});

  beforeEach(async () => {
    mockProvider = new MockEthersProvider() as any;
    provider = mockProvider as unknown as ethers.providers.Provider;
    handleTransaction = provideHandleGovernanceTransaction(
      mockAssetTokenAddress,
      CONFIGURATOR_PROXY,
      provider,
      ASSET_INFO,
    );
  });

  it("should return single finding for single event occurence", async () => {
    let collateralAddresses = [
      createAddress("0x1247"),
      createAddress("0x12567"),
      createAddress("0x1289"),
      createAddress("0x1290"),
    ];
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

    // Use the mockImplementation or mockResolvedValue to mock the function
    txEvent = new TestTransactionEvent();

    txEvent
      .setBlock(0)
      .addEventLog(
        "event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)",
        CONFIGURATOR_PROXY,
        [...mockArgs],
      );

    const metadata1: { [key: string]: any } = {
      SET_GOVERNOR: {
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
    const nonProposalEvent = "event mockEvent(address value1, uint8 value2)";
    txEvent = new TestTransactionEvent();

    txEvent
      .setBlock(0)
      .addEventLog(nonProposalEvent, CONFIGURATOR_PROXY, [
        createAddress("0x9467"),
        2,
      ]);

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(0);
  });

  it("should return 0 findings for multiple non-governance events", async () => {
    mockProvider.setNetwork(1);
    txEvent = new TestTransactionEvent();

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

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(0);
  });

  it("should a finding for a governance event out of multiple non-governance events", async () => {
    mockProvider.setNetwork(1);
    txEvent = new TestTransactionEvent();

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
      CONFIGURATOR_PROXY,
      [...mockArgs],
    );
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(1);
  });
  it("should return multiple findings for multiple valid governance events out of multiple invalid and valid governance events", async () => {
    const metadata1: { [key: string]: any } = {
      SET_GOVERNOR: {
        Old_value: createAddress("0x123"),
        New_value: createAddress("0x234"),
      },
      BORROW_KINK: {
        Old_value: "100",
        New_value: "200",
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

    let collateralAddresses = [
      createAddress("0x1247"),
      createAddress("0x12567"),
      createAddress("0x1289"),
      createAddress("0x1290"),
    ];
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
    txEvent = new TestTransactionEvent();

    const nonGovEvents = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Deposit(address indexed user, address reciepient, uint256 amount)",
    ];

    nonGovEvents.forEach((eventSignature) => {
      txEvent.setBlock(0);
      txEvent.addEventLog(eventSignature, createAddress("0xABCDEF"), [
        createAddress("0x12345"),
        createAddress("0x67890"),
        1000,
      ]);
    });

    txEvent.addEventLog(
      "event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)",
      CONFIGURATOR_PROXY,
      [...mockArgs],
    );
    txEvent.addEventLog(
      "event SetBorrowKink(address indexed cometProxy,uint64 oldKink, uint64 newKink)",
      CONFIGURATOR_PROXY,
      [mockArgs[1], 100, 200],
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
