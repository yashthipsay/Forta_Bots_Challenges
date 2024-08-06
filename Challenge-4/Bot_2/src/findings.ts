import { Finding, FindingSeverity, FindingType} from "forta-agent";

export const supplyFinding = (
  supplyAPR: string,
  utilizationRate: string,
  network: any,
): Finding => {
  const utilization = parseFloat(utilizationRate) / 1e16;
  const formattedSupplyAPR = parseFloat(supplyAPR).toFixed(2);
  return Finding.fromObject({
    name: `Lender's incentivized to supply`,
    description: `The Supply APR is ${parseFloat(formattedSupplyAPR).toFixed(2)}, which is favourable for lenders, as the utlization rate is ${utilization}`,
    alertId: "SUPPLY-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Compound",
    metadata: {
      SupplyRate: formattedSupplyAPR,
      Utilization: utilization.toString(),
    },
  });
};

export const borrowFinding = (
  borrowAPR: string,
  optimalUtilization: string,
  network: any,
): Finding => {
  const utilization = parseFloat(optimalUtilization) / 1e16;
  const formattedBorrowAPR = parseFloat(borrowAPR).toFixed(2);
  return Finding.fromObject({
    name: `Borrower's incentivized to borrow`,
    description: `The Borrow APR is ${formattedBorrowAPR}, which is favourable for borrowers, as the optimal utilization rate is ${utilization}`,
    alertId: "BORROW-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Compound",
    metadata: {
      BorrowRate: formattedBorrowAPR,
      Utilization: `${utilization}`,
    },
  });
};
