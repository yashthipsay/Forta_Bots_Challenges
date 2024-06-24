import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Finding, FindingSeverity, FindingType, getEthersProvider, HandleTransaction } from "forta-agent";
import { provideSwapHandler } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import { COMPUTED_INIT_CODE_HASH, SWAP_EVENT, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";
import Retrieval from "./retrieval";
import { createAddress } from "forta-agent-tools";
import { Interface } from "@ethersproject/abi";

// Test values setup for mock events

// const TEST_VALUE_1 = {
//   TOKEN0_ADDRESS: "0x74993dD14475b25986B6ed8d12d3a0dFf92248f4",
//   TOKEN0_VALUE: BigNumber.from("500"),
//   TOKEN1_ADDRESS: "0x08d16B72dad2c52FD94835FF49f51514aFcBfBfC",
//   TOKEN1_VALUE: BigNumber.from("400"),
//   POOL_ADDRESS: "0x61D3f523cd7e93d8deF89bb5d5c4eC178f7CfE76",
//   FEE: BigNumber.from("3000"),
// };

const SQRT_PRICE = BigNumber.from("10");
const LIQUIDITY = BigNumber.from("1000");
const TICK = BigNumber.from("1");

// Function to create a mock finding for testing

const createFinding = (token0Address: string, token1Address: string): Finding => {
  return Finding.fromObject({
    name: "Swap Event",
    description: "Swap event detected",
    alertId: "UNISWAP_SWAP_EVENT",
    severity: FindingSeverity.Low,
    type: FindingType.Info,
    metadata: {
      isValid: "true",
    },
  });
};

// Describe block groups test cases together

describe("Uniswap test suite", () => {
  const retrieval = new Retrieval(new MockEthersProvider() as any);
  let handleTransaction: HandleTransaction;
  let txEvent: TestTransactionEvent;
  const mockFactoryAddress = createAddress('0x4');
  const mockToken0 = createAddress('0x765');
  const mockToken1 = createAddress('0x987');
  const mockFee = 10000;
  const mockPoolValues = [mockToken0, mockToken1, mockFee];
  const mockPoolAddress = retrieval.getUniswapPairCreate2Address(mockFactoryAddress, mockToken0, mockToken1, mockFee, COMPUTED_INIT_CODE_HASH);
  console.log(mockPoolAddress);
  let mockProvider: MockEthersProvider;
  let Iface : Interface;
  const mockRandomAddress = createAddress('0x123');

  const mockSwapEventArgs = [
    createAddress('0x123'),
    createAddress('0x456'),
    BigNumber.from('-5378335736229591174395'),
    BigNumber.from('266508884993980604'),
    BigNumber.from('555620238891309147094159455'),
    BigNumber.from('14900188386820019615173'),
    99206,
  ];
  beforeEach(() => {
    const retrieval = new Retrieval(new MockEthersProvider() as any);
    handleTransaction = provideSwapHandler(UNISWAP_FACTORY_ADDRESS, retrieval, COMPUTED_INIT_CODE_HASH);
    Iface = new Interface(UNISWAP_PAIR_ABI);
  });

 
  const configProvider = (contractAddress: string) => {
    mockProvider.addCallTo(contractAddress, 0, Iface, 'token0', { inputs: [], outputs: [mockToken0] });
    mockProvider.addCallTo(contractAddress, 0, Iface, 'token1', { inputs: [], outputs: [mockToken1] });
    mockProvider.addCallTo(contractAddress, 0, Iface, 'fee', { inputs: [], outputs: [mockFee] });

    mockProvider.setLatestBlock(0);
  }


  // Test case for no swap events

  it("returns an empty finding if there are no swap events", async () => {
    // const txEvent = new TestTransactionEvent();

    
    // const findings = await handleTransaction(txEvent);

    // expect(findings.length).toEqual(0);
    // expect(findings).toStrictEqual([]);

    
      txEvent.setFrom(mockRandomAddress).setTo(mockPoolAddress).setValue('123456789');
      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
      console.log("Successful");
    
  });

  // Test case for a single valid swap event

  it("returns a finding if there is a single valid swap event from Uniswap", async () => {
try{
    txEvent.addEventLog(SWAP_EVENT[0], mockPoolAddress, [mockSwapEventArgs]);
} catch (error) {
  console.log(error);
}

    // txEvent = new TestTransactionEvent().addEventLog(
    //   "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
    //   TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
    //   [
    //     TEST_VALUE_1.TOKEN1_ADDRESS,
    //     TEST_VALUE_1.TOKEN0_ADDRESS,
    //     TEST_VALUE_1.TOKEN0_VALUE,
    //     TEST_VALUE_1.TOKEN1_VALUE,
    //     SQRT_PRICE,
    //     LIQUIDITY,
    //     TICK,
    //   ]
    // );

    // const poolVal = {
    //   token0: TEST_VALUE_1.TOKEN0_ADDRESS,
    //   token1: TEST_VALUE_1.TOKEN1_ADDRESS,
    //   fee: TEST_VALUE_1.FEE,
    // };
    // const mockFinding = createFinding(TEST_VALUE_1.TOKEN0_ADDRESS, TEST_VALUE_1.TOKEN1_ADDRESS);

    // const findings = await handleTransaction(txEvent);
    // expect(findings.length).toEqual(1);
  });

  it("returns multiple findings if there are multiple valid swap events from Uniswap", async () => {
    // txEvent = new TestTransactionEvent()
    //   .addEventLog(
    //     "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
    //     TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
    //     [
    //       TEST_VALUE_1.TOKEN1_ADDRESS,
    //       TEST_VALUE_1.TOKEN0_ADDRESS,
    //       TEST_VALUE_1.TOKEN0_VALUE,
    //       TEST_VALUE_1.TOKEN1_VALUE,
    //       SQRT_PRICE,
    //       LIQUIDITY,
    //       TICK,
    //     ]
    //   )
    //   .addEventLog(
    //     "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
    //     TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
    //     [
    //       TEST_VALUE_1.TOKEN1_ADDRESS,
    //       TEST_VALUE_1.TOKEN0_ADDRESS,
    //       TEST_VALUE_1.TOKEN0_VALUE,
    //       TEST_VALUE_1.TOKEN1_VALUE,
    //       SQRT_PRICE,
    //       LIQUIDITY,
    //       TICK,
    //     ]
    //   );

    // const poolVal = {
    //   token0: TEST_VALUE_1.TOKEN0_ADDRESS,
    //   token1: TEST_VALUE_1.TOKEN1_ADDRESS,
    //   fee: TEST_VALUE_1.FEE,
    // };
    // const mockFinding = createFinding(TEST_VALUE_1.TOKEN0_ADDRESS, TEST_VALUE_1.TOKEN1_ADDRESS);

    // const findings = await handleTransaction(txEvent);
    // expect(findings.length).toEqual(2);
    // expect(findings).toEqual([mockFinding, mockFinding]);
  // });

  // it("returns no findings if a non-swap event is used", async () => {
  //   txEvent = new TestTransactionEvent().addEventLog(
  //     "event NonSwapEvent(address indexed sender, address indexed recipient, int256 amount0, int256 amount1)",
  //     TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
  //     [TEST_VALUE_1.TOKEN1_ADDRESS, TEST_VALUE_1.TOKEN0_ADDRESS, TEST_VALUE_1.TOKEN0_VALUE, TEST_VALUE_1.TOKEN1_VALUE]
  //   );

  //   const findings = await handleTransaction(txEvent);
  //   expect(findings.length).toEqual(0);
  // });
// });
  });
});
  
