import { FindingType, FindingSeverity, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import { Interface } from "@ethersproject/abi";
import { provideTransaction } from "./agent";
import { createAddress } from "forta-agent-tools";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import {
  CREATE_BOT_FUNCTION,
  UPDATE_BOT_FUNCTION,
  FORTA_BOT_REGISTRY,
  BOT_UPDATE_EVENT,
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
      BOT_UPDATE_EVENT,
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
          description: `Detects Bot created by a Nethermind address`,
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
  });
});
