import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { Alert, AlertsResponse, Finding } from "forta-agent";
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

const L2Alert: Alert = {
  alertId: "L1-ESCROW",
  hasAddress: () => false,
  metadata: {
    optEscBal: BigNumber,
    abtEscBal: BigNumber,
  },
};

const l2Alerts: AlertsResponse = {
  alerts: [L2Alert],
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
    l2Alerts.alerts[0].metadata[isOptEscrow ? "optEscBal" : "abtEscBal"] =
      balance;

    return balance.toString();
  }

  public async getL1Alerts(chaindId: number): Promise<AlertsResponse> {
    return await getAlerts({
      alertId: "L1-ESCROW",
      chainId: chaindId,
    });
  }

/**
 * Fetches the L2 supply and creates a high severity finding if L1 balance is less than L2 supply.
 * @param blockNumber The block number to query the L2 supply at.
 * @param chainId The chain ID to determine the network and corresponding L1 balance.
 * @param findings Array to push findings into if a discrepancy is detected.
 */
  public async fetchL2SupplyAndCheckDiscrepancy(
    blockNumber: number,
    chainId: number,
    findings: Finding[],
  ){
    const l2ChainContract = new Contract(
      DAI_L2_ADDRESS,
      [L2_ABI],
      this.provider,
    );
    const totalSupply = await l2ChainContract.totalSupply({
      blockTag: blockNumber,
    });

    const l1Alerts = await this.getL1Alerts(chainId);
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

  }
}
