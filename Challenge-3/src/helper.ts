import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { Alert, AlertQueryOptions, AlertsResponse, Finding } from "forta-agent";
import {
  OPT_ESCROW_ADDRESS,
  DAI_ADDRESS,
  L2_ABI,
  ESCROW_ABI,
  DAI_L2_ADDRESS,
} from "./constants";
import { BigNumber } from "ethers";
import { createFinding } from "./findings";
import { getAlerts } from "forta-agent";

const L1Alert: Alert = {
  alertId: "L2_Alert",
  hasAddress: () => false,
  metadata: {
    optEscBal: BigNumber,
    abtEscBal: BigNumber,
  },
};


const l1Alerts: AlertsResponse = {
  alerts: [L1Alert],
  pageInfo: { hasNextPage: false },
};



export default class Helper {
  private provider: Provider;
  constructor(provider: Provider) {
    this.provider = provider;
  }

  /**
   * Retrieves the L1 balance for a given address at a specific block number.
   * @param address - The address for which to retrieve the balance.
   * @param blockNumber - The block number at which to retrieve the balance.
   * @returns A Promise that resolves to a string representing the L1 balance.
   */
  public async getL1Balance(
    address: string,
    blockNumber: number,
  ): Promise<string> {
    const L1Contract = new Contract(DAI_ADDRESS, [ESCROW_ABI], this.provider);
    const balance = await L1Contract.balanceOf(address, {
      blockTag: blockNumber,
    });

    const isOptEscrow =
      address.toLowerCase() === OPT_ESCROW_ADDRESS.toLowerCase();
    l1Alerts.alerts[0].metadata[isOptEscrow ? "optEscBal" : "abtEscBal"] =
      balance;

    return balance.toString();
  }

  public async getL1Alerts(): Promise<AlertsResponse> {
    
    // return l1Alerts;
    return await getAlerts({
      alertId: "L2_Alert"
    })
  }

  /**
   * Retrieves the L2 supply and compares it with the L1 balance.
   * If the L1 balance is less than the L2 supply, a finding is created and added to the findings array.
   * @param blockNumber - The block number to retrieve the L2 supply from.
   * @param chainId - The chain ID of the blockchain.
   * @param findings - An array of findings to store the comparison results.
   * @param getL1Alerts - A function that retrieves L1 alerts.
   * @returns The L2 supply as a string.
   */
  public async getL2Supply(
    blockNumber: number,
    chainId: number,
    findings: Finding[],
  ): Promise<string> {
    const l2ChainContract = new Contract(
      DAI_L2_ADDRESS,
      [L2_ABI],
      this.provider,
    );
    const totalSupply = await l2ChainContract.totalSupply({
      blockTag: blockNumber,
    });

    const l1Alerts = await this.getL1Alerts();
    const metadata = l1Alerts.alerts[0].metadata;

    const isOptimism = chainId === 10;
    const l1Balance = isOptimism ? metadata.optEscBal : metadata.abtEscBal;
    const l2Network = isOptimism ? "Optimism" : "Arbitrum";

    const l1BigNumber = BigNumber.from(l1Balance);
    const l2BigNumber = BigNumber.from(totalSupply);

    if (l1BigNumber.lt(l2BigNumber)) {
      findings.push(
        createFinding(l1Balance, l2BigNumber.toString(), l2Network),
      );
    }

    return totalSupply.toString();
  }
}
