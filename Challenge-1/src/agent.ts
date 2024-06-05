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



import {
  CREATE_BOT_FUNCTION,
  UPDATE_BOT_FUNCTION,
  BOT_CREATION_HOOK,
  BOT_DEPLOYED_ADDRESS,
  NETHERMIND_DEPLOYER_ADDRESS,
} from "./constants";

// Identify bot creation emissions

// export const ERC20_TRANSFER_EVENT =
//   "event Transfer(address indexed from, address indexed to, uint256 value)";
// export const TETHER_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
// export const TETHER_DECIMALS = 6;
// let findingsCount = 0;

const botCreation: string = CREATE_BOT_FUNCTION;
const botUpdate: string = UPDATE_BOT_FUNCTION;
const botCreationHook: string = BOT_CREATION_HOOK;
const botDeployedAddress: string = BOT_DEPLOYED_ADDRESS;
const nethermindDeployerAddress: string = NETHERMIND_DEPLOYER_ADDRESS;

const handleTransaction: HandleTransaction = async (tx: TransactionEvent) => {
  const findings: Finding[] = [];

  // const botCreationEvents = tx.filterLog(botCreationHook, botDeployedAddress);
  // console.log(botCreationEvents.length);

  const botCreationAlert = tx.filterFunction(botCreation, botDeployedAddress);
  console.log(`Bot created Alert`);

  const botUpdateAlert = tx.filterFunction(botUpdate, botDeployedAddress);
  console.log(`Bot updated`);

  // for (let i = 0; i < botCreationEvents.length; i++) {
  //   const address = tx.from;
  //   const type = tx.type;
  //   const network = tx.network;

  //   if (botCreationEvents.length > 0 && address === nethermindDeployerAddress) {
  //     findings.push(
  //       Finding.fromObject({
  //         name: "Bot Creation",
  //         description: `Bot created`,
  //         alertId: "BOT-1",
  //         severity: FindingSeverity.Low,
  //         type: FindingType.Info,
  //         metadata: {
  //           type: type.toString(),
  //           network: network.toString(),
  //         },
  //       }),
  //     );
  //   }
  // }

  for (let creationAlert of botCreationAlert) {
    const address = tx.from;
    const type = tx.type;
    const network = tx.network;

    if (address === nethermindDeployerAddress) {
      findings.push(
        Finding.fromObject({
          name: "Bot Creation",
          description: `Bot created`,
          alertId: "BOT-2",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            address,
            botDeployedAddress
          },
        }),
      );
    }
  }

  for (let updateAlert of botUpdateAlert) {
    const address = tx.from;
    const type = tx.type;
    const network = tx.network;

    if (address === nethermindDeployerAddress) {
      findings.push(
        Finding.fromObject({
          name: "Bot Updating",
          description: `Bot updated`,
          alertId: "BOT-3",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            address,
            botDeployedAddress
          },
        }),
      );
    }
  }

  return findings;
};

// const initialize: Initialize = async () => {
//   // do some initialization on startup e.g. fetch data
// }

// const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
//   const findings: Finding[] = [];
//   // detect some block condition
//   return findings;
// }

// const handleAlert: HandleAlert = async (alertEvent: AlertEvent) => {
//   const findings: Finding[] = [];
//   // detect some alert condition
//   return findings;
// }

// const healthCheck: HealthCheck = async () => {
//   const errors: string[] = [];
// detect some health check condition
// errors.push("not healthy due to some condition")
// return errors;
// }

export default {
  // initialize,
  handleTransaction,
  // healthCheck,
  // handleBlock,
  // handleAlert
};
