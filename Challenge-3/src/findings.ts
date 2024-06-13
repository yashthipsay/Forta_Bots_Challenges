import {ethers} from "ethers";
import { Finding, FindingSeverity, FindingType } from "forta-agent";

export const createFinding = (l1Escrow: ethers.BigNumberish, l2Supply: ethers.BigNumberish, network: string): Finding => {
    return Finding.fromObject({
        name: `L1 Escrow has less balance than L2 supply on ${network}`,
        description: `balance of ${l1Escrow}, ${network} l2Supply-> ${l2Supply}`,
        alertId: "L2 INVARIANT",
        severity: FindingSeverity.High,
        type: FindingType.Exploit,
        protocol: `${network}`,
        metadata: {
            l1Escrow: `${l1Escrow}`,
            l2Supply: `${l2Supply}`,
        },
    });
};

export const createL1OptFinding = (optEscBal: ethers.BigNumberish): Finding => {
    return Finding.fromObject({
        name: `Total supply of Optimism escrow in L1 DAI`,
        description: `Optimism L1 escrow balance: ${optEscBal}`,
        alertId: "l1-escrow-supply",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Ethereum",
        metadata: {
            optEscBal: `${optEscBal}`,
        },
    });
};

export const createL1AbtFinding = (abtEscBal: ethers.BigNumberish): Finding => {
    return Finding.fromObject({
        name: `Total supply of Optimism escrow in L1 DAI`,
        description: `Optimism L1 escrow balance: ${abtEscBal}`,
        alertId: "l1-escrow-supply",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Ethereum",
        metadata: {
            optEscBal: `${abtEscBal}`,
        },
    });
};