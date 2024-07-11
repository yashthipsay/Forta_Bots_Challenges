import {
  BlockEvent,
  Finding,
  HandleBlock,
  AlertsResponse,
  getEthersProvider,
  ethers,
  Alert,
  AlertQueryOptions,
} from "forta-agent";
import { createL2Finding } from "./findings";
import Helper from "./helper";
import { ABT_ESCROW_ADDRESS, OPT_ESCROW_ADDRESS } from "./constants";

// Predefined alert structure for L1 Escrow monitoring
const alert: Alert = {
  alertId: "L1_ESCROW",
  chainId: 1,
  hasAddress: () => true,
  metadata: {
    optEscBal: Number,
    abtEscBal: Number,
    network: "Ethereum",
  },
};

// Default response structure for alert queries
const emptyAlertResponse: AlertsResponse = {
  alerts: [alert],
  pageInfo: { hasNextPage: false },
};

// Factory function to provide a block handler with custom dependencies
export function provideHandleBlock(
  provider: ethers.providers.Provider,
  getAlerts: (alertQuery: AlertQueryOptions) => Promise<AlertsResponse>,
): HandleBlock {
  return async function handleBlock(
    blockEvent: BlockEvent,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];
    const helperInstance = new Helper(provider);

    const { chainId } = await provider.getNetwork();

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
        getAlerts,
      );
    }

    return findings;
  };
}

export default {
  handleBlock: provideHandleBlock(
    getEthersProvider(),
    emptyAlertResponse as any,
  ),
};
