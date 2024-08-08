import { Finding, FindingSeverity, FindingType } from "forta-agent";

export const createFinding = (
  tokenAddress: string,
  assetData: { [name: string]: string },
  changedEvents: { [key: string]: any },
): Finding => {
  return Finding.fromObject({
    name: `Change of asset values due to governance proposal`,
    description: `The asset ${tokenAddress} has been modified by a governance proposal`,
    alertId: "GOV-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Compound",
    metadata: {
      ...changedEvents,
      ...assetData,
    },
  });
};
