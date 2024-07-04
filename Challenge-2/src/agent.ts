import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} from "forta-agent";
import { UNISWAP_FACTORY_ADDRESS, COMPUTED_INIT_CODE_HASH, SWAP_EVENT } from "./constants";
import Helper from "./helper";

let helper: Helper;
// Function to provide a handler for swap events

export function provideInitialize(provider: ethers.providers.Provider) {
  helper = new Helper(provider);
}

export function provideHandleTransaction(
  uniswapFactoryAddress: string,
  initcode: string,
  provider: ethers.providers.Provider
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];


    // Filter swap events from the transaction
    const swapEvents = txEvent.filterLog(SWAP_EVENT);

    // Process each swap event asynchronously
    await Promise.all(
      swapEvents.map(async (event) => {
        const pairAddress = event.address;
        const params = event.args;
        // Validate the Uniswap pair address

        const [isValid, token0Address, token1Address, fee] = await helper.isValidUniswapPair(
          uniswapFactoryAddress,
          pairAddress,
          initcode,
          provider,
          txEvent.blockNumber
        );
        if (isValid) {
          // If the pair address is valid, create a finding
          findings.push(
            Finding.fromObject({
              name: "Uniswap V3 Swap Detector",
              description: "This Bot detects the Swaps executed on Uniswap V3",
              alertId: "NETHERMIND-1",
              severity: FindingSeverity.Info,
              protocol: "UniswapV3",
              type: FindingType.Info,
              metadata: {
                token0: token0Address,
                token1: token1Address,
                fee: fee.toString(),
                amount1: params[3].toString(),
                amount0: params[2].toString(),
                severity: FindingSeverity.Info.toString(),
                type: FindingType.Info.toString(),
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
  initialize: provideInitialize(getEthersProvider()),
  handleTransaction: provideHandleTransaction(UNISWAP_FACTORY_ADDRESS, COMPUTED_INIT_CODE_HASH, getEthersProvider()),
};
