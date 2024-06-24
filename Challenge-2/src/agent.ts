import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
} from "forta-agent";
import { UNISWAP_FACTORY_ADDRESS, UNISWAP_FACTORY_ABI, COMPUTED_INIT_CODE_HASH, SWAP_EVENT } from "./utils";
import Retrieval from "./retrieval";

// Function to provide a handler for swap events

export function provideSwapHandler(
  uniswapFactoryAddress: string,
  initcode: string
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];
    const retrieval = new Retrieval(getEthersProvider());
    // Destructure necessary ABI and event signatures

    const [swapEvent] = SWAP_EVENT;

    // Filter swap events from the transaction

    const swapEvents = txEvent.filterLog([swapEvent]);

    // Process each swap event asynchronously

    await Promise.all(
      swapEvents.map(async (event) => {
        const pairAddress = event.address;

        // Validate the Uniswap pair address

        const [isValid] = await retrieval.isValidUniswapPair(
          pairAddress,
          txEvent.blockNumber,
          uniswapFactoryAddress,
          initcode
        );
        if (isValid) {
          // If the pair address is valid, create a finding
          findings.push(
            Finding.fromObject({
              name: "Swap Event",
              description: "Swap event detected",
              alertId: "UNISWAP_SWAP_EVENT",
              severity: FindingSeverity.Low,
              type: FindingType.Info,
              metadata: {
                isValid: isValid.toString(),
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
  handleTransaction: provideSwapHandler(
    UNISWAP_FACTORY_ADDRESS,
    COMPUTED_INIT_CODE_HASH
  ),
};
