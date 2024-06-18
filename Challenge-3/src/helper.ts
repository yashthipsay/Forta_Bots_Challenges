import { Contract } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";

import {
  ABT_ESCROW_ADDRESS,
  OPT_ESCROW_ADDRESS,
  DAI_ADDRESS,
  L2_ABI,
  ESCROW_ABI,
  DAI_L2_ADDRESS,
} from "./constants";
import { BigNumber } from "@ethersproject/bignumber";

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

  public async getL2Supply(blockNumber: number, chainId: number): Promise<string> {
    const l2ChainContract = new Contract(DAI_L2_ADDRESS, L2_ABI, this.provider);
    const totalSupply = await l2ChainContract.totalSupply({blockTag: blockNumber});

    let l1Balance: string;
    let l2Network: string;

    if(chainId == 10) {
      l1Balance = await this.getL1Balance(ABT_ESCROW_ADDRESS, blockNumber);
      l2Network = "Arbitrum";
    }
    else{
      l1Balance = await this.getL1Balance(OPT_ESCROW_ADDRESS, blockNumber);
      l2Network = "Optimism";
    }

    return totalSupply;
  }
}
