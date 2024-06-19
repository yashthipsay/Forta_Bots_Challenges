import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";
import { AlertQueryOptions, ethers } from "forta-agent";
import {
  ABT_ESCROW_ADDRESS,
  OPT_ESCROW_ADDRESS,
  DAI_ADDRESS,
  L2_ABI,
  ESCROW_ABI,
  DAI_L2_ADDRESS,
} from "./constants";
import { BigNumber } from "ethers";
import { AlertsResponse, Finding } from "forta-agent";
import { getL1Alerts } from "./mockAlerts";
import { createL1OptFinding, createFinding } from "./findings";

export default class Helper {
  private provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }

  public async getL1Balance(address: string, blockNumber: number): Promise<string> {
    const L1Contract = new Contract(DAI_ADDRESS, [ESCROW_ABI], this.provider);
    const balance = await L1Contract.balanceOf(address, {blockTag: blockNumber});
    return balance;
  }
  
  public async getL2Supply(blockNumber: number, chainId: number, findings: Finding[], getAlerts: (alertQuery: AlertQueryOptions) => Promise<AlertsResponse>): Promise<string> {
    const l2ChainContract = new Contract(DAI_L2_ADDRESS, L2_ABI, this.provider);
    console.log("test-1");

   
   
    const totalSupply = await l2ChainContract.totalSupply({blockTag: blockNumber});
    console.log("test-2");
    const l1Alerts: AlertsResponse = await getAlerts({
      botIds: ["0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612"],
      alertId: "L1_Escrow",
      first: 1,
      blockNumberRange: {
          startBlockNumber: blockNumber,
          endBlockNumber: blockNumber,
      }
    })
    console.log("test-3");
    let l1Balance: string;
    let l2Network: string;
    let l2BigNumber = ethers.BigNumber.from(totalSupply);
   let l1BigNumber = BigNumber as any; 
    console.log(l2BigNumber.toString() );
    if(chainId == 10) {
      l1Balance = l1Alerts.alerts[0].metadata.optEscBal;

      l2Network = "Optimism";
      l1BigNumber = ethers.BigNumber.from(l1Balance);
      console.log(l1Balance);
      if(l1BigNumber.lt(l2BigNumber)) {
        findings.push(createFinding(l1Balance, l2BigNumber.toString(), l2Network))
      }
    }
    else{
      l1Balance = l1Alerts.alerts[0].metadata.abtEscBal;
      l2Network = "Arbitrum";
      l1BigNumber = BigNumber.from(l1Balance);
      if(l1BigNumber.lt(l2BigNumber)) {
        findings.push(createFinding(l1Balance, l2BigNumber.toString(), "Optimism"));
      }
    }

    
    return totalSupply;
  }
}
