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
  GetAlerts,
  getAlerts,
  Alert,
  AlertQueryOptions
} from "forta-agent";
// import { JsonRpcProvider } from "ethers";
import {
  createFinding,
  createL1OptFinding,
} from "./findings";
import { Provider } from "@ethersproject/providers";
import { getL1Alerts } from "./mockAlerts";

// import { getL1Alerts } from "./botAlerts";
import Helper from "./helper";
import { ABT_ESCROW_ADDRESS, OPT_ESCROW_ADDRESS } from "./constants";
const emptyAlertResponse: AlertsResponse = {
  alerts: [],
  pageInfo: {
    hasNextPage: false,
  },
};
const critAlerts: AlertQueryOptions = {
  
 botIds: ["0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612"]

}
export function provideHandleBlock(
  provider: ethers.providers.Provider,
  getL1Alerts: (alertQuery: AlertQueryOptions) => Promise<AlertsResponse>
): HandleBlock {
  return async function handleBlock(blockEvent: BlockEvent): Promise<Finding[]> {
    let balance: string;
    const findings: Finding[] = [];
    const HelperInstance = new Helper(provider);
    // const BOT_ID_1 =
    //   "0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612";
    const { chainId } = await provider.getNetwork();
 
    
    // const l1Alerts: AlertsResponse = await getL1Alerts(BOT_ID_1);
    if (chainId == 1) {
      const optBalance = await HelperInstance.getL1Balance(OPT_ESCROW_ADDRESS, blockEvent.blockNumber);
      const abtBalance = await HelperInstance.getL1Balance(ABT_ESCROW_ADDRESS, blockEvent.blockNumber);
      findings.push(createL1OptFinding(optBalance, abtBalance));
    }
    console.log("test-4")
    if (chainId != 1) {
      console.log("test-5");
      try{
        const l2Cond = await HelperInstance.getL2Supply(blockEvent.blockNumber, chainId, findings, getAlerts);
      } catch {
        return findings;
      }
      const {alerts} = await getL1Alerts({
        
      });
    }
    // else if (l1Alerts.alerts.length == 0) {
    //   return findings;
    // }

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
  // initialize, //Wrap with provideInitialize
  // handleTransaction,
  // healthCheck,
  // handleBlock,
  handleBlock: provideHandleBlock(
    getEthersProvider(), getAlerts
  ),

};



// const l1Alerts: AlertsResponse = await getMockAlerts(blockEvent.blockNumber);

// if (chainId != 1) {
//   const balance = chainId === 42161 ? l1Alerts.alerts[0].metadata.l1Escrow : l1Alerts.alerts[0].metadata.optEscBal;
//   // const balance =
//   //   (chainId == 10)
//   //     ? await HelperInstance.getL1Balance(ABT_ESCROW_ADDRESS, blockEvent.blockNumber)
//   //     : await HelperInstance.getL1Balance(OPT_ESCROW_ADDRESS, blockEvent.blockNumber);
//   const totalL2Supply = await HelperInstance.getL2Supply(blockEvent.blockNumber, chainId);
//   console.log(balance);

//   if (balance < totalL2Supply) {
//     findings.push(
//       createFinding(balance, totalL2Supply, chainId.toString()),
//     );
//   }
// } else