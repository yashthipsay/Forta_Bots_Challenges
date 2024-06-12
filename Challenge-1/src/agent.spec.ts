import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
  TransactionEvent,
} from "forta-agent";
import { Interface } from "@ethersproject/abi";
import { provideTransaction } from "./agent";
import { createAddress } from "forta-agent-tools";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import {
  CREATE_BOT_FUNCTION,
  UPDATE_BOT_FUNCTION,
  BOT_DEPLOYED_ADDRESS,
  BOT_UPDATE_EVENT,
  NETHERMIND_DEPLOYER_ADDRESS,
} from "./constants";

// Test suite for the bot creation agent
describe("bot creation agent", () => {
  let handleTransaction: HandleTransaction;

  const args = [1, createAddress("0x02"), "Mock tx 2", [137]];
  const mockUpdateAgentEventData2 = [1, "Mock tx 2", [137]];

  const mockBotDeployedAddress: string = BOT_DEPLOYED_ADDRESS;
  const mockNethermindAddress: string = NETHERMIND_DEPLOYER_ADDRESS;
  const mockCreateBotFunction: string = CREATE_BOT_FUNCTION;
  const mockUpdateBotFunction: string = UPDATE_BOT_FUNCTION;
  const OTHER_FUNCTION_ABI =
    "function otherFunction(uint256 agentId, address, string metadata, uint256[] chainIds)";

  // Setup for the tests
  beforeAll(() => {
    handleTransaction = provideTransaction(
      CREATE_BOT_FUNCTION,
      UPDATE_BOT_FUNCTION,
      BOT_DEPLOYED_ADDRESS,
      BOT_UPDATE_EVENT,
      NETHERMIND_DEPLOYER_ADDRESS,
    );
  });

  // Test suite for the handleTransaction function
  describe("handleTransaction", () => {
    const provideInterface = new Interface([
      CREATE_BOT_FUNCTION,
      UPDATE_BOT_FUNCTION,
      OTHER_FUNCTION_ABI,
    ]);

    // Test for bot creation
    it("should find created bot", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(BOT_DEPLOYED_ADDRESS)
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
          description: `Bot created`,
          alertId: "BOT-1",
          severity: FindingSeverity.Low,
          // timestamp: new Date(),
          // toString: [Function],
          type: FindingType.Info,
          metadata: {
            // address: mockNethermindAddress,
            botDeployedAddress: mockBotDeployedAddress,
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
        .setTo(BOT_DEPLOYED_ADDRESS)
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
          description: `Bot updated`,
          alertId: "BOT-2",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            botDeployedAddress: mockBotDeployedAddress,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
      ]);
    });

    // Test for no findings for bot creation
    it("should not have any findings for bot creation", async () => {
      const tx: TransactionEvent = new TestTransactionEvent()
        .setTo(BOT_DEPLOYED_ADDRESS)
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
  });
});
