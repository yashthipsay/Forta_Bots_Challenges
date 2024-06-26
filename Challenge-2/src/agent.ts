import { Finding, HandleTransaction, TransactionEvent, getEthersProvider, ethers } from "forta-agent";
import { createFinding } from "./finding";
import { UNISWAP_PAIR_ABI, SWAP_EVENT, UNISWAP_FACTORY_ADDRESS, GET_POOL_ABI } from "./utils";
import { getUniswapPoolValues, getUniswapCreate2Address } from "./retrieval";

export function provideSwapHandler(
  provider: ethers.providers.Provider,
  SWAP_EVENT: string[],
  UNISWAP_PAIR_ABI: string[]
): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    // Get the factory contract to use later when we call getPool func to verify pool address
    const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, GET_POOL_ABI, provider);
    const bn = txEvent.blockNumber;

    // Filter out any swap logs from the blockchain that match our SWAP_EVENT
    const swapEvents = txEvent.filterLog(SWAP_EVENT);
    for (const swapLog of swapEvents) {
      try {
        // Retrieve the pool values for the swap log address
        const poolVal = await getUniswapPoolValues(swapLog.address, UNISWAP_PAIR_ABI, provider, bn);

        // Get the pool address using the pool values and factory contract
        const poolAddress = getUniswapCreate2Address(poolVal, factoryContract);

        // Check if the pool address matches the swap log address
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
  handleTransaction: provideSwapHandler(getEthersProvider(), SWAP_EVENT, UNISWAP_PAIR_ABI),
};
