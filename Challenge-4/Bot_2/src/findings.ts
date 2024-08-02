import {Finding, FindingSeverity, FindingType, Network} from 'forta-agent';

export const supplyFinding = (supplyAPR: string, utilizationRate: string, network: any): Finding => {
    const utilization = parseFloat(utilizationRate)/1e16;
    return Finding.fromObject({
        name: `Lender's incentivized to supply`,
        description: `The Supply APR is ${supplyAPR}, which is favourable for lenders, as the utlization rate is ${utilization}`,
        alertId: "SUP-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Ethereum",
        metadata: {
            SupplyRate: supplyAPR,
            Utilization: utilization.toString()
        }
    })
}

export const borrowFinding = (borrowAPR: string, optimalUtilization: string, network: any): Finding => {
    return Finding.fromObject({
        name: `Borrower's incentivized to borrow`,
        description: `The Borrow APR is ${borrowAPR}, which is favourable for borrowers, as the optimal utilization rate is ${optimalUtilization}`,
        alertId: "BOR-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Ethereum",
        metadata: {
            BorrowRate: borrowAPR,
            OptimalUtilization: optimalUtilization
        }
    });
}