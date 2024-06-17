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
  };
}

export default {
  // initialize,
  handleTransaction: provideTransaction(
    CREATE_BOT_FUNCTION,
    UPDATE_BOT_FUNCTION,
    FORTA_BOT_REGISTRY,
    NETHERMIND_DEPLOYER_ADDRESS
  ),
};
