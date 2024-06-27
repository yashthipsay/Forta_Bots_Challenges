import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Finding, FindingSeverity, FindingType, getEthersProvider, HandleTransaction } from "forta-agent";
import { provideSwapHandler } from "./agent";
import { COMPUTED_INIT_CODE_HASH, SWAP_EVENT, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";
import Retrieval from "./retrieval";
import { createAddress } from "forta-agent-tools";
import { ethers } from "forta-agent";

let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(UNISWAP_PAIR_ABI);

describe("Uniswap test suite", () => {
  const mockProvider = new MockEthersProvider();

  let txEvent: TestTransactionEvent;

  const mockToken1 = createAddress("0x987");
  const mockFee = 99206;
  let mockPoolAddress: string;

  const retrieval = new Retrieval(mockProvider as any);
  mockPoolAddress = retrieval.getUniswapPairCreate2Address(
    createAddress("0x284"),
    createAddress("0x765"),
    mockToken1,
    99206,
    COMPUTED_INIT_CODE_HASH
  );
  console.log(mockPoolAddress);

  const mockSwapEventArgs = [
    createAddress("0x234"),
    createAddress("0x345"),
    ethers.BigNumber.from("5378335736229591174395"),
    ethers.BigNumber.from("266508884993980604"),
    ethers.BigNumber.from("555620238891309147094159455"),
    ethers.BigNumber.from("14900188386820019615173"),
    99206,
  ];

  const mockSwapEventArgs2 = [
    createAddress("0x284"),
    createAddress("0x567"),
    ethers.BigNumber.from("1000000000000000000"),
    ethers.BigNumber.from("500000000000000000"),
    ethers.BigNumber.from("600000000000000000000000000"),
    ethers.BigNumber.from("20000000000000000000000"),
    99206,
  ];

  // Describe block groups test cases together
  beforeAll(() => {
    handleTransaction = provideSwapHandler(createAddress("0x284"), COMPUTED_INIT_CODE_HASH, mockProvider as any);
  });
  const createUniswapPairCalls = (
    pairAddress: string,
    functionName: string,
    output: string | number,
    blockNumber: number
  ) => {
    mockProvider.addCallTo(pairAddress, blockNumber, Iface, functionName, {
      inputs: [],
      outputs: [output],
    });
  };

  // It returns a single finding if there is a single valid swap event from Uniswap
  it("returns a finding if there is a single valid swap event from Uniswap", async () => {
    createUniswapPairCalls(mockPoolAddress, "token0", createAddress("0x765"), 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);

    txEvent = new TestTransactionEvent();

    txEvent
      .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [
          mockSwapEventArgs[0],
          mockSwapEventArgs[1],
          mockSwapEventArgs[2],
          mockSwapEventArgs[3],
          mockSwapEventArgs[4],
          mockSwapEventArgs[5],
          mockSwapEventArgs[6],
        ]
      );

    const findings = await handleTransaction(txEvent).then((findings) => {
      console.log(findings);
      expect(findings.length).toStrictEqual(1);
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Uniswap V3 Swap Detector",
          description: "This Bot detects the Swaps executed on Uniswap V3",
          alertId: "UNISWAP_SWAP_EVENT",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "UniswapV3",

          metadata: {
            token0: createAddress("0x765"),
            token1: mockToken1,
            fee: mockFee.toString(),
          },
        }),
      ]);
    });
  });

  // It returns multiple findings for multiple valid swap events from Uniswap
  it("returns multiple findings for multiple valid swap events from Uniswap", async () => {
    // Mock additional swap event arguments for a second swap event

    // Add calls for the second swap event's pair
    const mockPoolAddress2 = retrieval.getUniswapPairCreate2Address(
      createAddress("0x999"),
      createAddress("0x888"),
      createAddress("0x456"),
      99206,
      COMPUTED_INIT_CODE_HASH
    );
    console.log(mockPoolAddress2);

    createUniswapPairCalls(mockPoolAddress2, "token0", createAddress("0x888"), 0);
    createUniswapPairCalls(mockPoolAddress2, "token1", createAddress("0x456"), 0);
    createUniswapPairCalls(mockPoolAddress2, "fee", mockFee, 0);

    // Add the second swap event to the transaction event
    txEvent
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress2,
        [
          mockSwapEventArgs2[0],
          mockSwapEventArgs2[1],
          mockSwapEventArgs2[2],
          mockSwapEventArgs2[3],
          mockSwapEventArgs2[4],
          mockSwapEventArgs2[5],
          mockSwapEventArgs2[6],
        ]
      )
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [
          mockSwapEventArgs[0],
          mockSwapEventArgs[1],
          mockSwapEventArgs[2],
          mockSwapEventArgs[3],
          mockSwapEventArgs[4],
          mockSwapEventArgs[5],
          mockSwapEventArgs[6],
        ]
      );

    // Execute handleTransaction and verify multiple findings are returned
    const findings = await handleTransaction(txEvent).then((findings) => {
      console.log(findings);
      expect(findings.length).toStrictEqual(2); // Expecting two findings now
      expect(findings).toEqual([
        Finding.fromObject({
          name: "Uniswap V3 Swap Detector",
          description: "This Bot detects the Swaps executed on Uniswap V3",
          alertId: "UNISWAP_SWAP_EVENT",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "UniswapV3",
          metadata: {
            token0: createAddress("0x765"),
            token1: mockToken1,
            fee: mockFee.toString(),
          },
        }),
        Finding.fromObject({
          name: "Uniswap V3 Swap Detector",
          description: "This Bot detects the Swaps executed on Uniswap V3",
          alertId: "UNISWAP_SWAP_EVENT",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "UniswapV3",
          metadata: {
            token0: createAddress("0x765"),
            token1: createAddress("0x987"),
            fee: mockFee.toString(),
          },
        }),
      ]);
    });
  });

  it("returns zero findings for events other than swap events from Uniswap", async () => {
    // Create a mock event that is not a swap event

    // Use a different event signature to simulate a non-swap event
    txEvent = new TestTransactionEvent()
      .setBlock(0)
      .addEventLog("event Transfer(address indexed from, address indexed to, uint256 value)", mockPoolAddress, [
        mockSwapEventArgs[0],
        mockSwapEventArgs[1],
        mockSwapEventArgs[2],
      ]);

    // Execute handleTransaction and verify that no findings are returned
    const findings = await handleTransaction(txEvent).then((findings) => {
      console.log(findings);
      expect(findings.length).toStrictEqual(0); // Expecting zero findings
    });
  });

  it("returns zero findings for multiple non-swap events", async () => {
    // Create mock arguments for a second non-swap event
    const mockNonSwapEventArgs2 = [createAddress("0x789"), createAddress("0x890"), ethers.BigNumber.from("2000")];

    // Add a second non-swap event to the transaction event
    txEvent
      .setBlock(0)
      .addEventLog(
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        createAddress("0xdef"),
        [mockNonSwapEventArgs2[0], mockNonSwapEventArgs2[1], mockNonSwapEventArgs2[2]]
      )
      .addEventLog("event Transfer(address indexed from, address indexed to, uint256 value)", mockPoolAddress, [
        mockSwapEventArgs[0],
        mockSwapEventArgs[1],
        mockSwapEventArgs[2],
      ]);

    // Execute handleTransaction and verify that no findings are returned for both events
    const findings = await handleTransaction(txEvent).then((findings) => {
      console.log(findings);
      expect(findings.length).toStrictEqual(0); // Expecting zero findings for both non-swap events
    });
  });
});
