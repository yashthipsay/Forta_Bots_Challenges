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
  getEthersProvider,
} from "forta-agent";
import Web3Provider from "@ethersproject/providers";
import { ethers, JsonRpcProvider } from "ethers";
import { UNISWAP_FACTORY_ADDRESS, UNISWAP_FACTORY_ABI, COMPUTED_INIT_CODE_HASH } from "./utils";
import Retrieval from "./retrieval";
// import {} from "forta-agent-tools";

export function provideSwapHandler(uniswapFactoryAddress: string, retrieval: Retrieval, initcode: string): HandleTransaction {
 
return async function handleTransaction  (
  txEvent: TransactionEvent
)  {
  const findings: Finding[] = [];

 
 
  const [getPoolAbi, swapEvent] = UNISWAP_FACTORY_ABI;

  const swapEvents = txEvent.filterLog(swapEvent);

  await Promise.all(
    swapEvents.map(async (event) => {
      const pairAddress = event.address;
      const [isValid, token0Address, token1Address] = await retrieval.isValidUniswapPair(
        pairAddress,
        txEvent.blockNumber,
        uniswapFactoryAddress,
        initcode
      );
      if(isValid){
        findings.push(
          Finding.fromObject({
            name: "Swap Event",
            description: "Swap event detected",
            alertId: "UNISWAP_SWAP_EVENT",
            severity: FindingSeverity.Medium,
            type: FindingType.Suspicious,
            metadata: {
              
            },
          })
        )
      }
    })
  )
 
    
      
  

  return findings;
};

}

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
  handleTransaction: provideSwapHandler(UNISWAP_FACTORY_ADDRESS, new Retrieval(new JsonRpcProvider()), COMPUTED_INIT_CODE_HASH)
  // healthCheck,
  // handleBlock,
  // handleAlert
};
