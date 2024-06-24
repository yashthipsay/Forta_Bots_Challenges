<<<<<<< HEAD:Challenge-2/src/agent.ts
import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
} from "forta-agent";
import { UNISWAP_FACTORY_ADDRESS, UNISWAP_FACTORY_ABI, COMPUTED_INIT_CODE_HASH, SWAP_EVENT } from "./utils";
import Retrieval from "./retrieval";

// Function to provide a handler for swap events

export function provideSwapHandler(
  uniswapFactoryAddress: string,
  retrieval: Retrieval,
  initcode: string
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    // Destructure necessary ABI and event signatures

    const [swapEvent] = SWAP_EVENT;

    // Filter swap events from the transaction

    const swapEvents = txEvent.filterLog([swapEvent]);

    // Process each swap event asynchronously

    await Promise.all(
      swapEvents.map(async (event) => {
        const pairAddress = event.address;

        // Validate the Uniswap pair address

        const [isValid] = await retrieval.isValidUniswapPair(
          pairAddress,
          txEvent.blockNumber,
          uniswapFactoryAddress,
          initcode
        );
        if (isValid) {
          // If the pair address is valid, create a finding
          findings.push(
            Finding.fromObject({
              name: "Swap Event",
              description: "Swap event detected",
              alertId: "UNISWAP_SWAP_EVENT",
              severity: FindingSeverity.Low,
              type: FindingType.Info,
              metadata: {
                isValid: isValid.toString(),
              },
            })
          );
        }
      })
    );

    return findings;
=======
// Importing necessary modules and constants
import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType } from "forta-agent";

import {
  CREATE_BOT_FUNCTION,
  UPDATE_BOT_FUNCTION,
  FORTA_BOT_REGISTRY,
  NETHERMIND_DEPLOYER_ADDRESS,
} from "./constants";

// Function to handle transactions related to bot creation and update
export function provideTransaction(
  botCreation: string,
  botUpdate: string,
  botDeployedAddress: string,
  nethermindDeployerAddress: string
): HandleTransaction {
  return async function handleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];

    // Filter transactions related to bot creation and update
    const botCreationFunctionCalls = tx.filterFunction(botCreation, botDeployedAddress);

    const botUpdateFunctionCalls = tx.filterFunction(botUpdate, botDeployedAddress);

    // Loop through each bot creation alert
    for (let creationAlert of botCreationFunctionCalls) {
      // Extract necessary details from the transaction
      const agentId = creationAlert.args.agentId.toString();
      const chainId = creationAlert.args.chainIds[0].toString();
      const metadata = creationAlert.args.metadata;
      const address = tx.from;

      // If the transaction is from the deployer address, add a finding
      if (address.toLowerCase() === nethermindDeployerAddress.toLowerCase()) {
        finding.push(
          Finding.fromObject({
            name: "Bot Creation",
            description: "Detects Bot created by a Nethermind address",
            alertId: "BOT-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              agentId,
              chainId,
              metadata,
              botDeployedAddress,
            },
          })
        );
      }
    }

    for (let updateAlert of botUpdateFunctionCalls) {
      const address = tx.from;
      const agentId = updateAlert.args.agentId.toString();
      const chainId = updateAlert.args.chainIds[0].toString();
      const metadata = updateAlert.args.metadata;

      // If the transaction is from the deployer address, add a finding
      if (address.toLowerCase() === nethermindDeployerAddress.toLowerCase()) {
        finding.push(
          Finding.fromObject({
            name: "Bot Updating",
            description: "Detects Bot updated by a Nethermind address",
            alertId: "BOT-2",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              // address,
              botDeployedAddress,
              agentId,
              chainId,
              metadata,
            },
          })
        );
      }
    }

    return finding;
>>>>>>> 92fdc59b22fda219a2d7bd505fa7125b142871f5:Challenge-1/src/agent.ts
  };
}

export default {
<<<<<<< HEAD:Challenge-2/src/agent.ts
  handleTransaction: provideSwapHandler(
    UNISWAP_FACTORY_ADDRESS,
    new Retrieval(getEthersProvider()),
    COMPUTED_INIT_CODE_HASH
=======
  // initialize,
  handleTransaction: provideTransaction(
    CREATE_BOT_FUNCTION,
    UPDATE_BOT_FUNCTION,
    FORTA_BOT_REGISTRY,
    NETHERMIND_DEPLOYER_ADDRESS
>>>>>>> 92fdc59b22fda219a2d7bd505fa7125b142871f5:Challenge-1/src/agent.ts
  ),
};
