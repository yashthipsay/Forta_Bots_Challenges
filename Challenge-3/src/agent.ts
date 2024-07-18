import {
  BlockEvent,
  Finding,
  HandleBlock,
  getEthersProvider,
  ethers,
} from "forta-agent";
import { createL2Finding } from "./findings";
import Helper from "./helper";
import { ABT_ESCROW_ADDRESS, OPT_ESCROW_ADDRESS } from "./constants";

let chainId: number;

export function provideInitialize(provider: ethers.providers.Provider) {
  return async function initialize() {
    const network = await provider.getNetwork();
    chainId = network.chainId;
  };
}

// Factory function to provide a block handler with custom dependencies
export function provideHandleBlock(
  provider: ethers.providers.Provider,
): HandleBlock {
  return async function handleBlock(
    blockEvent: BlockEvent,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];
    const helperInstance = new Helper(provider);

    if (chainId === 1) {
      // Concurrently fetch balances for specified escrow addresses
      const [optBalance, abtBalance] = await Promise.all([
        helperInstance.getL1Balance(OPT_ESCROW_ADDRESS, blockEvent.blockNumber),
        helperInstance.getL1Balance(ABT_ESCROW_ADDRESS, blockEvent.blockNumber),
      ]);

      findings.push(createL2Finding(optBalance, abtBalance));
    } else {
      // For non-mainnet chains, fetch L2 supply details
      await helperInstance.getL2Supply(
        blockEvent.blockNumber,
        chainId,
        findings,
      );
    }

    return findings;
  };
}

export default {
  initialize: provideInitialize(getEthersProvider()),
  handleBlock: provideHandleBlock(getEthersProvider()),
};
