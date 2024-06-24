import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Finding, FindingSeverity, FindingType, getEthersProvider, HandleTransaction } from "forta-agent";
import { provideSwapHandler } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import { COMPUTED_INIT_CODE_HASH, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";
import Retrieval from "./retrieval";

// Test values setup for mock events

const TEST_VALUE_1 = {
  TOKEN0_ADDRESS: "0x74993dD14475b25986B6ed8d12d3a0dFf92248f4",
  TOKEN0_VALUE: BigNumber.from("500"),
  TOKEN1_ADDRESS: "0x08d16B72dad2c52FD94835FF49f51514aFcBfBfC",
  TOKEN1_VALUE: BigNumber.from("400"),
  POOL_ADDRESS: "0x61D3f523cd7e93d8deF89bb5d5c4eC178f7CfE76",
  FEE: BigNumber.from("3000"),
};

const SQRT_PRICE = BigNumber.from("10");
const LIQUIDITY = BigNumber.from("1000");
const TICK = BigNumber.from("1");

// Function to create a mock finding for testing

const createFinding = (token0Address: string, token1Address: string): Finding => {
  return Finding.fromObject({
    name: "Swap Event",
    description: "Swap event detected",
    alertId: "UNISWAP_SWAP_EVENT",
    severity: FindingSeverity.Medium,
    type: FindingType.Suspicious,
    metadata: {
      isValid: "true",
    },
  });
};

// Describe block groups test cases together

describe("Uniswap test suite", () => {
  let handleTransaction: HandleTransaction;
  let txEvent: TestTransactionEvent;

  beforeEach(() => {
    const retrieval = new Retrieval(getEthersProvider());
    handleTransaction = provideSwapHandler(UNISWAP_FACTORY_ADDRESS, retrieval, COMPUTED_INIT_CODE_HASH);
  });

  // Test case for no swap events

  it("returns an empty finding if there are no swap events", async () => {
    const txEvent = new TestTransactionEvent();

    const findings = await handleTransaction(txEvent);

    expect(findings.length).toEqual(0);
    expect(findings).toStrictEqual([]);
  });

  // Test case for a single valid swap event

  it("returns a finding if there is a single valid swap event from Uniswap", async () => {
    txEvent = new TestTransactionEvent().addEventLog(
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
    const mockFinding = createFinding(TEST_VALUE_1.TOKEN0_ADDRESS, TEST_VALUE_1.TOKEN1_ADDRESS);

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(1);
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
    const mockFinding = createFinding(TEST_VALUE_1.TOKEN0_ADDRESS, TEST_VALUE_1.TOKEN1_ADDRESS);

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(2);
    expect(findings).toEqual([mockFinding, mockFinding]);
  });

  it("returns no findings if a non-swap event is used", async () => {
    txEvent = new TestTransactionEvent().addEventLog(
      "event NonSwapEvent(address indexed sender, address indexed recipient, int256 amount0, int256 amount1)",
      TEST_VALUE_1.POOL_ADDRESS.toLowerCase(),
      [TEST_VALUE_1.TOKEN1_ADDRESS, TEST_VALUE_1.TOKEN0_ADDRESS, TEST_VALUE_1.TOKEN0_VALUE, TEST_VALUE_1.TOKEN1_VALUE]
    );

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(0);
  });
});
