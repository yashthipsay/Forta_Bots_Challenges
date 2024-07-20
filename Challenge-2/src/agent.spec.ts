import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Finding, FindingSeverity, FindingType, HandleTransaction } from "forta-agent";
import { provideHandleTransaction } from "./agent";
import { COMPUTED_INIT_CODE_HASH, UNISWAP_PAIR_ABI } from "./constants";
import Helper from "./helper";
import { createAddress } from "forta-agent-tools";
import { ethers } from "forta-agent";

let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(UNISWAP_PAIR_ABI);

describe("Uniswap test suite", () => {
  const mockProvider = new MockEthersProvider();

  let txEvent: TestTransactionEvent;
  const mockUniswapV3Factory = createAddress("0x284");
  const mockToken0 = createAddress("0x765");
  const mockToken1 = createAddress("0x987");
  const mockFee = 99206;
  let mockPoolAddress: string;

  const helper = new Helper();
  mockPoolAddress = helper.getUniswapPairCreate2Address(
    mockUniswapV3Factory,
    mockToken0,
    mockToken1,
    99206,
    COMPUTED_INIT_CODE_HASH
  );

  const mockNonUniswapV3PoolAddress = createAddress("0x123");

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

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(createAddress("0x284"), COMPUTED_INIT_CODE_HASH, mockProvider as any);
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

  it("returns zero findings for non valid Uniswap V3 pool", async () => {
    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "fee", mockFee, 0);

    txEvent = new TestTransactionEvent();

    txEvent
      .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockNonUniswapV3PoolAddress,
        [...mockSwapEventArgs]
      );

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(0);
  });

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
        [...mockSwapEventArgs2]
      );

    const findings = await handleTransaction(txEvent);
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

  it("returns findings for multiple swaps among several events, for valid swap events", async () => {
    createUniswapPairCalls(mockPoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);
    // Add swap events for mockPoolAddress and mockPoolAddress2
    txEvent = new TestTransactionEvent()
      .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [...mockSwapEventArgs]
      )
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [...mockSwapEventArgs2]
      );

    // Execute handleTransaction and verify that findings are returned only for swap events
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(2); // Expecting two findings for the swap events, ignoring non-swap events
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

  it("returns zero findings for events other than swap events from Uniswap", async () => {
    // Use a different event signature to simulate a non-swap event
    txEvent = new TestTransactionEvent()
      .setBlock(0)
      .addEventLog("event Transfer(address indexed from, address indexed to, uint256 value)", mockPoolAddress, [
        mockSwapEventArgs[0],
        mockSwapEventArgs[1],
        mockSwapEventArgs[2],
      ]);

    // Execute handleTransaction and verify that no findings are returned
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(0); // Expecting zero findings
  });

  it("returns zero findings for multiple non-swap events", async () => {
    const mockTransferEventArgs2 = [createAddress("0x789"), createAddress("0x890"), ethers.BigNumber.from("2000")];

    txEvent = new TestTransactionEvent();
    // Add a second non-swap event to the transaction event
    txEvent
      .setBlock(0)
      .addEventLog(
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        createAddress("0xdef"),
        [mockTransferEventArgs2[0], mockTransferEventArgs2[1], mockTransferEventArgs2[2]]
      )
      .addEventLog("event Transfer(address indexed from, address indexed to, uint256 value)", mockPoolAddress, [
        mockTransferEventArgs2[0],
        mockTransferEventArgs2[1],
        mockTransferEventArgs2[2],
      ]);

    // Execute handleTransaction and verify that no findings are returned for both events
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(0); // Expecting zero findings for both non-swap events
  });

  it("returns findings for multiple swaps among several events, ignoring non-swap events", async () => {
    createUniswapPairCalls(mockPoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);

    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "fee", mockFee, 0);
    // Setup multiple swap and non-swap events in the same transaction
    const mockTransferEventAddress = createAddress("0x212");
    const mockTransferEventArgs = [createAddress("0x323"), createAddress("0x868"), ethers.BigNumber.from("1000")];

    txEvent = new TestTransactionEvent()
      .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [...mockSwapEventArgs]
      )
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [...mockSwapEventArgs2]
      )
      // Add non-swap events
      .addEventLog(
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        mockTransferEventAddress,
        [mockTransferEventArgs[0], mockTransferEventArgs[1], mockTransferEventArgs[2]]
      )
      .addEventLog(
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        mockTransferEventAddress,
        [mockTransferEventArgs[0], mockTransferEventArgs[1], mockTransferEventArgs[2]]
      );

    // Execute handleTransaction and verify that findings are returned only for swap events
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(2); // Expecting two findings for the swap events, ignoring non-swap events
  });


  it("returns findings for multiple swaps among several events, ignoring non-swap events", async () => {
    createUniswapPairCalls(mockPoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);

    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "token0", mockToken0, 0);
    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockNonUniswapV3PoolAddress, "fee", mockFee, 0);
    // Setup multiple swap and non-swap events in the same transaction
    const mockTransferEventAddress = createAddress("0x212");
    const mockTransferEventArgs = [createAddress("0x323"), createAddress("0x868"), ethers.BigNumber.from("1000")];

    txEvent = new TestTransactionEvent()
      .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [...mockSwapEventArgs]
      )
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [...mockSwapEventArgs2]
      )
      // Add non-swap events
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockNonUniswapV3PoolAddress,
        [...mockSwapEventArgs]
      )
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockNonUniswapV3PoolAddress,
        [...mockSwapEventArgs2]
      );

    // Execute handleTransaction and verify that findings are returned only for swap events
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toStrictEqual(2); // Expecting two findings for the swap events, ignoring non-swap events
  });

  
});
