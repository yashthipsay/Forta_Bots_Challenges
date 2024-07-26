import { Finding, FindingSeverity, FindingType } from "forta-agent";
import { PoolValues } from "./retrieval";

export const createFinding = (poolVal: PoolValues, newAddress: string) => {
  return Finding.fromObject({
    name: "Uniswap Swap Detection",
    description: `Uniswap swap detected in pool ${poolVal} at address ${newAddress}`,
    alertId: "UNISWAP_SWAP_DETECTED",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Uniswap",
    metadata: {
      pool: newAddress,
    },
  });
};
