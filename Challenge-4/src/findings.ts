import { Finding, FindingSeverity, FindingType } from 'forta-agent';

export const createFinding = (
    tokenAddress: string,
    assetData: string,
    network: string,
    valuesChanged: string[]
): Finding => {
    return Finding.fromObject({
        name: `Change of asset values due to governance proposal: \n${assetData}`,
        description: `The asset ${tokenAddress} has been modified by a governance proposal`,
        alertId: "GOV-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: network,
        metadata: {
            valuesChanged: valuesChanged.join(","),
        }

    })
}