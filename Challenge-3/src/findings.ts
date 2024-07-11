import { Finding, FindingSeverity, FindingType } from "forta-agent";

export const createFinding = (
  l1Escrow: string,
  l2Supply: string,
  network: string,
): Finding => {
  return Finding.fromObject({
    name: `L1 Escrow has less balance than L2 supply on ${network}`,
    description: `balance of ${l1Escrow}, ${network} l2Supply-> ${l2Supply}`,
    alertId: "FORTA-2",
    severity: FindingSeverity.High,
    type: FindingType.Exploit,
    protocol: `${network}`,
    metadata: {
      l1Escrow: `${l1Escrow}`,
      l2Supply: `${l2Supply}`,
    },
  });
};

export const createL2Finding = (
  optEscBal: string,
  abtEscBal: string,
): Finding => {
  return Finding.fromObject({
    name: `Total supply of Optimism escrow in L1 DAI`,
    description: `Optimism L1 escrow balance: ${optEscBal}`,
    alertId: "FORTA-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Ethereum",
    metadata: {
      optEscBal: `${optEscBal}`,
      abtEscBal: `${abtEscBal}`,
    },
  });
};
