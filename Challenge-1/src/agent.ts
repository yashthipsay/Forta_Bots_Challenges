// Importing necessary modules and constants
import {
  BlockEvent,
  Finding,
  Initialize,
  HandleBlock,
  HealthCheck,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

import { ethers } from "forta-agent";

import {
  CREATE_BOT_FUNCTION,
  UPDATE_BOT_FUNCTION,
  BOT_DEPLOYED_ADDRESS,
  BOT_UPDATE_EVENT,
  NETHERMIND_DEPLOYER_ADDRESS,
} from "./constants";

// Function to handle transactions related to bot creation and update
export function provideTransaction(
  botCreation: string,
  botUpdate: string,
  botDeployedAddress: string,
  botUpdateEvent: string,
  nethermindDeployerAddress: string
): HandleTransaction {
  return async function handleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];

    // Filter transactions related to bot creation and update
    const botCreationAlert = tx.filterFunction(botCreation, botDeployedAddress);

    const botUpdateAlert = tx.filterFunction(botUpdate, botDeployedAddress);

    // Loop through each bot creation alert
    for (let creationAlert of botCreationAlert) {
      // Extract necessary details from the transaction
      const address = tx.from;
      const botDeployedChecksumAddress = ethers.utils.getAddress(nethermindDeployerAddress);
      const type = tx.type;
      const network = tx.network;

      // If the transaction is from the deployer address, add a finding
      if (address.toLowerCase() === nethermindDeployerAddress.toLowerCase()) {
        finding.push(
          Finding.fromObject({
            name: "Bot Creation",
            description: `Bot created`,
            alertId: "BOT-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              // address,
              botDeployedAddress,
            },
          })
        );
      }
    }

    for (let updateAlert of botUpdateAlert) {
      const address = tx.from;
      const botDeployedChecksumAddress = ethers.utils.getAddress(nethermindDeployerAddress);
      const type = tx.type;
      const network = tx.network;

      // If the transaction is from the deployer address, add a finding
      if (address.toLowerCase() === nethermindDeployerAddress.toLowerCase()) {
        finding.push(
          Finding.fromObject({
            name: "Bot Updating",
            description: `Bot updated`,
            alertId: "BOT-2",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              // address,
              botDeployedAddress,
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
    BOT_DEPLOYED_ADDRESS,
    BOT_UPDATE_EVENT,
    NETHERMIND_DEPLOYER_ADDRESS
  ),
};
