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

// Identify bot creation emissions

// export const ERC20_TRANSFER_EVENT =
//   "event Transfer(address indexed from, address indexed to, uint256 value)";
// export const TETHER_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
// export const TETHER_DECIMALS = 6;
// let findingsCount = 0;

export function provideTransaction(
  botCreation: string,
  botUpdate: string,
  botDeployedAddress: string,
  botUpdateEvent: string,
  nethermindDeployerAddress: string,
): HandleTransaction {
  return async function handleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];

    const botCreationAlert = tx.filterFunction(botCreation, botDeployedAddress);

    const botUpdateAlert = tx.filterFunction(botUpdate, botDeployedAddress);

    for (let creationAlert of botCreationAlert) {
      const address = tx.from;
      const botDeployedChecksumAddress = ethers.utils.getAddress(
        nethermindDeployerAddress,
      );
      const type = tx.type;
      const network = tx.network;

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
          }),
        );
      }
    }

    for (let updateAlert of botUpdateAlert) {
      const address = tx.from;
      const botDeployedChecksumAddress = ethers.utils.getAddress(
        nethermindDeployerAddress,
      );
      const type = tx.type;
      const network = tx.network;

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
              botDeployedAddress
            },
          }),
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
    NETHERMIND_DEPLOYER_ADDRESS,
  ),
  // healthCheck,
  // handleBlock,
  // handleAlert
};
