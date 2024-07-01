import { BigNumber } from "@ethersproject/bignumber";

import { Finding, FindingSeverity, FindingType } from "forta-agent";

export const createFinding = (
  l1Escrow: string,
  l2Supply: string,
  network: string,
): Finding => {
  return Finding.fromObject({
    name: `L1 Escrow has less balance than L2 supply on ${network}`,
    description: `balance of ${l1Escrow}, ${network} l2Supply-> ${l2Supply}`,
    alertId: "L1_ESCROW",
    severity: FindingSeverity.High,
    type: FindingType.Exploit,
    protocol: `${network}`,
    metadata: {
      l1Escrow: `${l1Escrow}`,
      l2Supply: `${l2Supply}`,
    },
  });
};

export const createL1OptFinding = (
  optEscBal: string,
  abtEscBal: string,
): Finding => {
  return Finding.fromObject({
    name: `Total supply of Optimism escrow in L1 DAI`,
    description: `Optimism L1 escrow balance: ${optEscBal}`,
    alertId: "L2_Alert",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Ethereum",
    metadata: {
      optEscBal: `${optEscBal}`,
      abtEscBal: `${abtEscBal}`,
    },
  });
};

// export const createL1AbtFinding = (abtEscBal: string): Finding => {
//   return Finding.fromObject({
//     name: `Total supply of Optimism escrow in L1 DAI`,
//     description: `Optimism L1 escrow balance: ${abtEscBal}`,
//     alertId: "l1-escrow-supply",
//     severity: FindingSeverity.Info,
//     type: FindingType.Info,
//     protocol: "Ethereum",
//     metadata: {
//       abtEscBal: `${abtEscBal}`,
//     },
//   });
// };
