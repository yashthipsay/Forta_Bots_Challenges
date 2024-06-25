import { Finding, FindingSeverity, FindingType } from "forta-agent";
import { poolValues } from "./retrieval";

export const createFinding = (poolVal: poolValues, newAddress: string) => {
  return Finding.fromObject({
    name: "UniswapV3 Swap Event Emission",
    description: `UniswapV3 Swap event detected for pool contract: ${newAddress}`,
    alertId: "UNISWAP-SWAP-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Uniswap",
    metadata: {
      pool: newAddress,
     
    },
  });
};