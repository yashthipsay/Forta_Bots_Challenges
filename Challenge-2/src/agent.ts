// import {
//   Finding,
//   HandleTransaction,
//   TransactionEvent,
//   FindingSeverity,
//   FindingType,
//   getEthersProvider,
//   ethers,
// } from "forta-agent";
// import { UNISWAP_FACTORY_ADDRESS, UNISWAP_FACTORY_ABI, COMPUTED_INIT_CODE_HASH, SWAP_EVENT } from "./utils";
// import Retrieval from "./retrieval";
// import { Provider } from "@ethersproject/providers";
// import { EtherscanProvider } from "ethers";

// // Function to provide a handler for swap events

// export function provideSwapHandler(
//   uniswapFactoryAddress: string,
//   initcode: string,
//   provider: ethers.providers.Provider
// ): HandleTransaction {
//   return async function handleTransaction(txEvent: TransactionEvent) {
//     const findings: Finding[] = [];
//     const retrieval = new Retrieval(provider);
//     // Destructure necessary ABI and event signatures

//     const [swapEvent] = SWAP_EVENT;

//     // Filter swap events from the transaction

//     const swapEvents = txEvent.filterLog([swapEvent]);

//     // Process each swap event asynchronously

//     await Promise.all(
//       swapEvents.map(async (event) => {
//         const pairAddress = event.address;

//         // Validate the Uniswap pair address

//         const [isValid] = await retrieval.isValidUniswapPair(
//           pairAddress,
//           txEvent.blockNumber,
//           uniswapFactoryAddress,
//           initcode
//         );
//         if (isValid) {
//           // If the pair address is valid, create a finding
//           findings.push(
//             Finding.fromObject({
//               name: "Swap Event",
//               description: "Swap event detected",
//               alertId: "UNISWAP_SWAP_EVENT",
//               severity: FindingSeverity.Low,
//               type: FindingType.Info,
//               metadata: {
//                 isValid: isValid.toString(),
//               },
//             })
//           );
//         }
//       })
//     );

//     return findings;
//   };
// }

// export default {
//   handleTransaction: provideSwapHandler(
//     UNISWAP_FACTORY_ADDRESS,
//     COMPUTED_INIT_CODE_HASH,
//     getEthersProvider()
//   ),
// };


import { Finding, HandleTransaction, TransactionEvent, getEthersProvider, ethers } from "forta-agent";
import { createFinding } from "./finding";
import { UNISWAP_PAIR_ABI, SWAP_EVENT, UNISWAPV3FACTORY_ADDRESS, IUNISWAPV3FACTORY } from "./utils";
import { getUniswapPoolValues, getUniswapCreate2Address } from "./retrieval";

export function provideHandleTransaction(
  provider: ethers.providers.Provider,
  SWAP_EVENT: string[],
  UNISWAP_PAIR_ABI: string[]
): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    //Get the factory contract to use later when we call getPool func to verify pool address
    const factoryContract = new ethers.Contract(UNISWAPV3FACTORY_ADDRESS, IUNISWAPV3FACTORY, provider);
    const bn = txEvent.blockNumber;

    // Filter out any swap logs from the blockchain that match our SWAP_EVENT
    const swapEvents = txEvent.filterLog(SWAP_EVENT);
    for (const swapLog of swapEvents) {
      //We wrap this in a try/catch as any invalid uniswap pools will error out
      try {
        //Call getPoolValues to get the token addresses and fee from the pool contract
        //if this is a valid pool contract it will return the vals
        const poolVal = await getUniswapPoolValues(swapLog.address, UNISWAP_PAIR_ABI, provider, bn);

        //once we receive the poolVals we use create2 to get the pool address
        //if the pool address from the event log matches this pool address we have a valid uniswap pool
        //We can then create a finding and push it to our findings array
        const poolAddress = getUniswapCreate2Address(poolVal, factoryContract);
        if (poolAddress.toLowerCase() === swapLog.address.toLowerCase()) {
          findings.push(createFinding(poolVal, poolAddress));
        }
      } catch {
        return findings;
      }
    }
    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(getEthersProvider(), SWAP_EVENT, UNISWAP_PAIR_ABI),
};
