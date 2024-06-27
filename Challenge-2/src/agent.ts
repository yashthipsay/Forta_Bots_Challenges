import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} from "forta-agent";
import {
  UNISWAP_FACTORY_ADDRESS,
  COMPUTED_INIT_CODE_HASH,
  SWAP_EVENT,
  UNISWAP_PAIR_ABI,
} from "./utils";
import Retrieval from "./retrieval";

// Function to provide a handler for swap events

export function provideSwapHandler(
  uniswapFactoryAddress: string,
  initcode: string,
  provider: ethers.providers.Provider
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];
    const retrieval = new Retrieval(provider);
    // Destructure necessary ABI and event signatures

    const [swapEvent] = SWAP_EVENT;

    // Filter swap events from the transaction

    const swapEvents = txEvent.filterLog([swapEvent]);

    // Process each swap event asynchronously

    await Promise.all(
      swapEvents.map(async (event) => {
        const pairAddress = event.address;

        // Validate the Uniswap pair address

        const pairContract = new ethers.Contract(pairAddress, UNISWAP_PAIR_ABI, provider);
        const token0Address = await pairContract.token0({ blockTag: txEvent.blockNumber });
        const token1Address = await pairContract.token1({ blockTag: txEvent.blockNumber });
        const fee = await pairContract.fee({ blockTag: txEvent.blockNumber });
        console.log(token0Address, token1Address, fee);

        const [isValid] = await retrieval.isValidUniswapPair(
          uniswapFactoryAddress,
          pairAddress,
          token0Address,
          token1Address,
          fee,
          initcode
        );
        if (isValid) {
          // If the pair address is valid, create a finding
          findings.push(
            Finding.fromObject({
              name: "Uniswap V3 Swap Detector",
              description: "This Bot detects the Swaps executed on Uniswap V3",
              alertId: "UNISWAP_SWAP_EVENT",
              severity: FindingSeverity.Info,
              protocol: "UniswapV3",
              type: FindingType.Info,
              metadata: {
                token0: token0Address,
                token1: token1Address,
                fee: fee.toString(),
              },
            })
          );
        }
      })
    );

    return findings;
  };
}

export default {
  handleTransaction: provideSwapHandler(UNISWAP_FACTORY_ADDRESS, COMPUTED_INIT_CODE_HASH, getEthersProvider()),
};
