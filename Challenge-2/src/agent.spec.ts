import { TestTransactionEvent, MockEthersProvider } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { ethers, Finding, FindingSeverity, FindingType, getEthersProvider, HandleTransaction } from "forta-agent";
import { provideSwapHandler } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import { Interface } from "@ethersproject/abi";
import { COMPUTED_INIT_CODE_HASH, SWAP_EVENT, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";
import Retrieval from "./retrieval";
import { JsonRpcApiProvider, JsonRpcProvider, Provider } from "ethers";


const TEST_VALUE_1 = {
  TOKEN0_ADDRESS: "0x74993dD14475b25986B6ed8d12d3a0dFf92248f4",
  TOKEN0_VALUE: BigNumber.from("500"),
  TOKEN1_ADDRESS: "0x08d16B72dad2c52FD94835FF49f51514aFcBfBfC",
  TOKEN1_VALUE: BigNumber.from("400"),
  POOL_ADDRESS: "0x61D3f523cd7e93d8deF89bb5d5c4eC178f7CfE76",
  FEE: BigNumber.from("3000"),
};

const TEST_VALUE_2 = {
  TOKEN2_ADDRESS: createAddress("0x3"),
  TOKEN2_VALUE: BigNumber.from("100"),
  TOKEN3_ADDRESS: createAddress("0x4"),
  TOKEN3_VALUE: BigNumber.from("400"),
  POOL_ADDRESS2: createAddress("0x5"),
  FEE: 500,
};

const SQRT_PRICE = BigNumber.from("10");
const LIQUIDITY = BigNumber.from("1000");
const TICK = BigNumber.from("1");

const POOL_INTERFACE = new ethers.utils.Interface(UNISWAP_PAIR_ABI);

const createFinding = (
      poolVal: Object,
      newAddress: string
  ): Finding => {
      return Finding.fromObject({
          name: "Swap Event",
          description: "Swap event detected",
          alertId: "UNISWAP_SWAP_EVENT",
          severity: FindingSeverity.Medium,
          type: FindingType.Suspicious,
          metadata: {
            
          },
      })
  }


describe("Uniswap test suite", () => {
  let handleTransaction: HandleTransaction;
  let txEvent: TestTransactionEvent;
  let mockProvider: MockEthersProvider;
  let provider: ethers.providers.Provider;
 


  beforeEach(() => {
    
    const retrieval = new Retrieval(getEthersProvider());
    console.log(retrieval);
    handleTransaction = provideSwapHandler(UNISWAP_FACTORY_ADDRESS, retrieval, COMPUTED_INIT_CODE_HASH);
    
});

it("returns an empty finding if there are no swap events", async () => {
  const txEvent = new TestTransactionEvent();
  
  const findings = await handleTransaction(txEvent);
  console.log(findings);
  
  expect(findings.length).toEqual(0);
  expect(findings).toStrictEqual([]);
});

it("returns a finding if there is a single valid swap event from Uniswap", async () => {

  // makeMockCall( new MockEthersProvider, "token0", [], [TEST_VALUE_1.TOKEN0_ADDRESS]);
  // console.log("test1");
  // makeMockCall(mockProvider, "token1", [], [TEST_VALUE_1.TOKEN1_ADDRESS]);
  // console.log("test2");

  txEvent = new TestTransactionEvent()
      .addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", TEST_VALUE_1.POOL_ADDRESS.toLowerCase(), [
          TEST_VALUE_1.TOKEN1_ADDRESS,
          TEST_VALUE_1.TOKEN0_ADDRESS,
          TEST_VALUE_1.TOKEN0_VALUE,
          TEST_VALUE_1.TOKEN1_VALUE,
          SQRT_PRICE,
          LIQUIDITY,
          TICK,
      ]);

      console.log(txEvent);

  const poolVal = {
      token0: TEST_VALUE_1.TOKEN0_ADDRESS,
      token1: TEST_VALUE_1.TOKEN1_ADDRESS,
      fee: TEST_VALUE_1.FEE,
  };
  const mockFinding = createFinding(poolVal, TEST_VALUE_1.POOL_ADDRESS);
  console.log(mockFinding);
 
  const findings = await handleTransaction(txEvent);
  expect(findings.length).toEqual(1);
  // expect(findings[0]).toStrictEqual(mockFinding);



});

it("returns multiple findings if there are multiple valid swap events from Uniswap", async () => {
  txEvent = new TestTransactionEvent()
    .addEventLog(
      "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
      TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
      [
        TEST_VALUE_1.TOKEN1_ADDRESS,
        TEST_VALUE_1.TOKEN0_ADDRESS,
        TEST_VALUE_1.TOKEN0_VALUE,
        TEST_VALUE_1.TOKEN1_VALUE,
        SQRT_PRICE,
        LIQUIDITY,
        TICK,
      ]
    )
    .addEventLog(
      "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
      TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
      [
        TEST_VALUE_1.TOKEN1_ADDRESS,
        TEST_VALUE_1.TOKEN0_ADDRESS,
        TEST_VALUE_1.TOKEN0_VALUE,
        TEST_VALUE_1.TOKEN1_VALUE,
        SQRT_PRICE,
        LIQUIDITY,
        TICK,
      ]
    );

  const poolVal = {
    token0: TEST_VALUE_1.TOKEN0_ADDRESS,
    token1: TEST_VALUE_1.TOKEN1_ADDRESS,
    fee: TEST_VALUE_1.FEE,
  };
  const mockFinding = createFinding(poolVal, TEST_VALUE_1.POOL_ADDRESS);

  const findings = await handleTransaction(txEvent);
  expect(findings.length).toEqual(2);
  expect(findings).toEqual(expect.arrayContaining([mockFinding, mockFinding]));
});

it("returns no findings if a non-swap event is used", async () => {
  txEvent = new TestTransactionEvent()
    .addEventLog(
      "event NonSwapEvent(address indexed sender, address indexed recipient, int256 amount0, int256 amount1)",
      TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
      [
        TEST_VALUE_1.TOKEN1_ADDRESS,
        TEST_VALUE_1.TOKEN0_ADDRESS,
        TEST_VALUE_1.TOKEN0_VALUE,
        TEST_VALUE_1.TOKEN1_VALUE,
      ]
    );

  const findings = await handleTransaction(txEvent);
  expect(findings.length).toEqual(0);
});
});