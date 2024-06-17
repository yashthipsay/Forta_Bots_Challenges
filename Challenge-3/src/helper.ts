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

export default class Helper {
  private provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }

  public async getL1Balance(address: string): Promise<string> {
    const L1Contract = new Contract(DAI_ADDRESS, [ESCROW_ABI], this.provider);
    const balance = await L1Contract.balanceOf(address);
    return balance;
  }

  public async getL2Supply(): Promise<string> {
    const l2ChainContract = new Contract(DAI_L2_ADDRESS, L2_ABI, this.provider);
    const totalSupply = await l2ChainContract.totalSupply();
    return totalSupply;
  }
}
