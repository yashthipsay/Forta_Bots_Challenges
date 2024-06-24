<<<<<<< HEAD:Challenge-2/src/agent.spec.ts
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
    severity: FindingSeverity.Low,
    type: FindingType.Info,
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
=======
import { FindingType, FindingSeverity, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import { Interface } from "@ethersproject/abi";
import { provideTransaction } from "./agent";
import { createAddress } from "forta-agent-tools";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import {
  CREATE_BOT_FUNCTION,
  UPDATE_BOT_FUNCTION,
  FORTA_BOT_REGISTRY,
  NETHERMIND_DEPLOYER_ADDRESS,
} from "./constants";

// Test suite for the bot creation agent
describe("bot creation agent", () => {
  let handleTransaction: HandleTransaction;

  const args = [1, createAddress("0x02"), "Mock tx 2", [137]];
  const mockUpdateAgentEventData2 = [1, "Mock tx 2", [137]];

  const mockBotDeployedAddress: string = FORTA_BOT_REGISTRY;
  const mockNethermindAddress: string = NETHERMIND_DEPLOYER_ADDRESS;
  const OTHER_FUNCTION_ABI = "function otherFunction(uint256 agentId, address, string metadata, uint256[] chainIds)";

  // Setup for the tests
  beforeAll(() => {
    handleTransaction = provideTransaction(
      CREATE_BOT_FUNCTION,
      UPDATE_BOT_FUNCTION,
      FORTA_BOT_REGISTRY,
      NETHERMIND_DEPLOYER_ADDRESS
    );
  });

  // Test suite for the handleTransaction function
  describe("handleTransaction", () => {
    const provideInterface = new Interface([CREATE_BOT_FUNCTION, UPDATE_BOT_FUNCTION, OTHER_FUNCTION_ABI]);

    // Test for bot creation
    it("should find created bot", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(FORTA_BOT_REGISTRY)
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: mockBotDeployedAddress,
          from: mockNethermindAddress,
          arguments: args,
        });

      // Call the handleTransaction function with the mock transaction event
      const expectedFinding = await handleTransaction(tx);

      expect(expectedFinding).toEqual([
        Finding.fromObject({
          name: "Bot Creation",
          protocol: "ethereum",
          description: "Detects Bot created by a Nethermind address",
          alertId: "BOT-1",
          severity: FindingSeverity.Low,
          // timestamp: new Date(),
          // toString: [Function],
          type: FindingType.Info,
          metadata: {
            // address: mockNethermindAddress,
            botDeployedAddress: mockBotDeployedAddress,
            agentId: "1",
            chainId: "137",
            metadata: "Mock tx 2",
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
      ]);
    });

    // Test for bot update
    it("should find updated bot", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(FORTA_BOT_REGISTRY)
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("updateAgent"),
          to: mockBotDeployedAddress,
          from: mockNethermindAddress,
          arguments: mockUpdateAgentEventData2,
        });

      const expectedFinding = await handleTransaction(tx);

      expect(expectedFinding).toEqual([
        Finding.fromObject({
          name: "Bot Updating",
          protocol: "ethereum",
          description: "Detects Bot updated by a Nethermind address",
          alertId: "BOT-2",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            botDeployedAddress: mockBotDeployedAddress,
            agentId: "1",
            chainId: "137",
            metadata: "Mock tx 2",
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
      ]);
    });

    // Test for no findings for bot creation
    it("should not emit findings for function calls other than bot creation and bot update", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(FORTA_BOT_REGISTRY)
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("otherFunction"),
          to: mockBotDeployedAddress,
          from: mockNethermindAddress,
          arguments: args,
        });

      const findings = await handleTransaction(tx);

      expect(findings).toEqual([]);
    });

    // Test for no findings when there's a creation but the deployer is not Nethermind
    it("should not emit findings for bot creation by non-Nethermind deployer", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(FORTA_BOT_REGISTRY)
        .setFrom(createAddress("0x03")) // Non-Nethermind address
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: mockBotDeployedAddress,
          from: createAddress("0x03"), // Non-Nethermind address
          arguments: args,
        });

      const findings = await handleTransaction(tx);

      expect(findings).toEqual([]);
    });

    // Test for no findings when there's a creation by Nethermind but not on Forta Bot Registry
    it("should not emit findings for bot creation not on Forta Bot Registry", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(createAddress("0x04")) // Non-Forta Bot Registry address
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: createAddress("0x04"), // Non-Forta Bot Registry address
          from: NETHERMIND_DEPLOYER_ADDRESS,
          arguments: args,
        });

      const findings = await handleTransaction(tx);

      expect(findings).toEqual([]);
    });

    // Test for multiple findings when there are multiple bot creations in the same tx
    it("should return multiple findings when there are multiple bot creations in the same tx", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(FORTA_BOT_REGISTRY)
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces(
          {
            function: provideInterface.getFunction("createAgent"),
            to: mockBotDeployedAddress,
            from: NETHERMIND_DEPLOYER_ADDRESS,
            arguments: args,
          },
          {
            function: provideInterface.getFunction("createAgent"),
            to: mockBotDeployedAddress,
            from: NETHERMIND_DEPLOYER_ADDRESS,
            arguments: args,
          }
        );

      const findings = await handleTransaction(tx);

      expect(findings.length).toEqual(2);
    });
>>>>>>> 92fdc59b22fda219a2d7bd505fa7125b142871f5:Challenge-1/src/agent.spec.ts
  });
});
