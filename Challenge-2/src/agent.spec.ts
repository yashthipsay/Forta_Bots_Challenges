import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Finding, FindingSeverity, FindingType, getEthersProvider, HandleTransaction } from "forta-agent";
import { provideSwapHandler } from "./agent";
import { COMPUTED_INIT_CODE_HASH, UNISWAP_PAIR_ABI } from "./constants";
import Helper from "./helper";
import { createAddress } from "forta-agent-tools";
import { ethers } from "forta-agent";

let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(UNISWAP_PAIR_ABI);

describe("Uniswap test suite", () => {
  const mockProvider = new MockEthersProvider();

  let txEvent: TestTransactionEvent;
  const mockFactoryAddress = createAddress("0x284");
  const mockToken0 = createAddress("0x765");
  const mockToken1 = createAddress("0x987");
  const mockFee = 99206;
  let mockPoolAddress: string;

  const helper = new Helper(mockProvider as any);
  mockPoolAddress = helper.getUniswapPairCreate2Address(
    mockFactoryAddress,
    mockToken0,
    mockToken1,
    99206,
    COMPUTED_INIT_CODE_HASH
  );

  const nonUniswapV3PoolAddress = createAddress("0x123");

  const mockSender1 = createAddress("0x234");
  const mockRecipient1 = createAddress("0x345");
  const mockAmount0 = ethers.BigNumber.from("5378335736229591174395");
  const mockAmount1 = ethers.BigNumber.from("266508884993980604");
  const mockSqrtPriceX96 = ethers.BigNumber.from("555620238891309147094159455");
  const mockLiquidity = ethers.BigNumber.from("14900188386820019615173");
  const mockTick = 99206;
  const mockSwapEventArgs = [
    mockSender1,
    mockRecipient1,
    mockAmount0,
    mockAmount1,
    mockSqrtPriceX96,
    mockLiquidity,
    mockTick,
  ];

  const mockSender2 = createAddress("0x284");
  const mockRecipient2 = createAddress("0x567");
  const mockSwapEventArgs2 = [
    mockSender2,
    mockRecipient2,
    mockAmount0,
    mockAmount1,
    mockSqrtPriceX96,
    mockLiquidity,
    mockTick,
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

  // It returns zero findings for non valid Uniswap V3 pool
  it("returns zero findings for non valid Uniswap V3 pool", async() => {
    createUniswapPairCalls(nonUniswapV3PoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(nonUniswapV3PoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(nonUniswapV3PoolAddress, "fee", mockFee, 0);

    txEvent = new TestTransactionEvent();

    txEvent
      .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        nonUniswapV3PoolAddress,
        [
          ...mockSwapEventArgs
        ]
      );

    const findings = await handleTransaction(txEvent).then((findings) => {
      expect(findings.length).toStrictEqual(0);
    })
  })

  // It returns a single finding if there is a single valid swap event from Uniswap
  it("returns a finding if there is a single valid swap event from Uniswap", async () => {
    createUniswapPairCalls(mockPoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);

    txEvent = new TestTransactionEvent();

    txEvent
      .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [
          ...mockSwapEventArgs2
        ]
      );

    const findings = await handleTransaction(txEvent).then((findings) => {
      expect(findings.length).toStrictEqual(1);
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Uniswap V3 Swap Detector",
          description: "This Bot detects the Swaps executed on Uniswap V3",
          alertId: "NETHERMIND-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "UniswapV3",

          metadata: {
            token0: mockToken0,
            token1: mockToken1,
            fee: mockFee.toString(),
            amount1: mockSwapEventArgs[3].toString(),
            amount0: mockSwapEventArgs[2].toString(),
            severity: FindingSeverity.Info.toString(),
            type: FindingType.Info.toString(),
          },
        }),
      ]);
    });
  });

  // It returns multiple findings for multiple valid swap events from Uniswap
  it("returns multiple findings for multiple valid swap events from Uniswap", async () => {
    // Mock additional swap event arguments for a second swap event

    // Add calls for the second swap event's pair
    const mockPoolAddress2 = helper.getUniswapPairCreate2Address(
      createAddress("0x999"),
      createAddress("0x888"),
      createAddress("0x456"),
      99206,
      COMPUTED_INIT_CODE_HASH
    );

    createUniswapPairCalls(mockPoolAddress2, "token0", createAddress("0x888"), 0);
    createUniswapPairCalls(mockPoolAddress2, "token1", createAddress("0x456"), 0);
    createUniswapPairCalls(mockPoolAddress2, "fee", mockFee, 0);

    // Add the second swap event to the transaction event
    txEvent
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress2,
        [
          ...mockSwapEventArgs2
        ]
      )
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [
          ...mockSwapEventArgs
        ]
      );

    // Execute handleTransaction and verify multiple findings are returned
    const findings = await handleTransaction(txEvent).then((findings) => {
      expect(findings.length).toStrictEqual(2); // Expecting two findings now
      expect(findings).toEqual([
        Finding.fromObject({
          name: "Uniswap V3 Swap Detector",
          description: "This Bot detects the Swaps executed on Uniswap V3",
          alertId: "NETHERMIND-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "UniswapV3",
          metadata: {
            token0: mockToken0,
            token1: mockToken1,
            fee: mockFee.toString(),
            amount1: mockSwapEventArgs[3].toString(),
            amount0: mockSwapEventArgs[2].toString(),
            severity: FindingSeverity.Info.toString(),
            type: FindingType.Info.toString(),
          },
        }),
        Finding.fromObject({
          name: "Uniswap V3 Swap Detector",
          description: "This Bot detects the Swaps executed on Uniswap V3",
          alertId: "NETHERMIND-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "UniswapV3",
          metadata: {
            token0: mockToken0,
            token1: mockToken1,
            fee: mockFee.toString(),
            amount1: mockSwapEventArgs2[3].toString(),
            amount0: mockSwapEventArgs2[2].toString(),
            severity: FindingSeverity.Info.toString(),
            type: FindingType.Info.toString(),
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
      expect(findings.length).toStrictEqual(0); // Expecting zero findings for both non-swap events
    });
  });
});
