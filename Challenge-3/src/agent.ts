import {
  BlockEvent,
  Finding,
  HandleBlock,
  HealthCheck,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  AlertsResponse,
  getEthersProvider,
  ethers,
} from "forta-agent";
// import { JsonRpcProvider } from "ethers";
import {
  createFinding,
  createL1AbtFinding,
  createL1OptFinding,
} from "./findings";
import { JsonRpcProvider, Provider } from "ethers";
// import { getL1Alerts } from "./botAlerts";
import Helper from "./helper";
import { ABT_ESCROW_ADDRESS, OPT_ESCROW_ADDRESS } from "./constants";

export function provideMakerInvariant(
  provider: ethers.providers.Provider,
  botId: string,
): HandleTransaction {
  return async function handleTransaction(tx: TransactionEvent) {
    let balance: string;
    const findings: Finding[] = [];
    const HelperInstance = new Helper(new JsonRpcProvider());
    const BOT_ID_1 =
      "0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612";
    const { chainId } = await provider.getNetwork();
    // const l1Alerts: AlertsResponse = await getL1Alerts(BOT_ID_1);
    const l1Alerts: AlertsResponse = {
      alerts: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: undefined,
      },
    };

    if (chainId != 1) {
      // const balance = chainId === 42161 ? l1Alerts.alerts[0].metadata.l1Escrow : l1Alerts.alerts[0].metadata.optEscBal;
      const balance =
        (await chainId) === 42161
          ? await HelperInstance.getL1Balance(ABT_ESCROW_ADDRESS)
          : await HelperInstance.getL1Balance(OPT_ESCROW_ADDRESS);
      const totalL2Supply = await HelperInstance.getL2Supply();
      console.log(balance);

      if (balance < totalL2Supply) {
        findings.push(
          createFinding(balance, totalL2Supply, chainId.toString()),
        );
      }
    } else if (chainId == 1) {
      const optBalance = await HelperInstance.getL1Balance(OPT_ESCROW_ADDRESS);
      const abtBalance = await HelperInstance.getL1Balance(ABT_ESCROW_ADDRESS);
      findings.push(createL1OptFinding(optBalance));
      findings.push(createL1AbtFinding(abtBalance));
    } else if (l1Alerts.alerts.length == 0) {
      return findings;
    }

    return findings;
  };
}

//   return findings;
// };

// // const initialize: Initialize = async () => {
// //   // do some initialization on startup e.g. fetch data
// // }

// // const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
// //   const findings: Finding[] = [];
// //   // detect some block condition
// //   return findings;
// // }

// // const handleAlert: HandleAlert = async (alertEvent: AlertEvent) => {
// //   const findings: Finding[] = [];
// //   // detect some alert condition
// //   return findings;
// // }

// // const healthCheck: HealthCheck = async () => {
// //   const errors: string[] = [];
//   // detect some health check condition
//   // errors.push("not healthy due to some condition")
//   // return errors;
// // }

export default {
  // initialize,
  // handleTransaction,
  // healthCheck,
  // handleBlock,
  handleTransaction: provideMakerInvariant(
    getEthersProvider(),
    "0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612",
  ),
};
