import { Provider, Contract, ContractRunner } from "ethers";

import  {ABT_ESCROW_ADDRESS, OPT_ESCROW_ADDRESS, DAI_ADDRESS, L2_ABI, ESCROW_ABI, DAI_L2_ADDRESS} from "./constants";
import { ethers } from "forta-agent";

export default class Helper {

    private provider: ContractRunner;

    constructor(provider: ContractRunner) {
        this.provider = provider;
    }

    public async getL1Balance(address: string): Promise<string> {

        const L1Contract = new Contract(DAI_ADDRESS, address, this.provider)
        const balance = await L1Contract.balanceOf(DAI_ADDRESS);
        return balance;
    } 
   
    
    public async getL2Supply(address: string): Promise<string> {
        const l2ChainContract = new Contract(DAI_L2_ADDRESS, L2_ABI, this.provider);
        const totalSupply = await l2ChainContract.totalSupply();
        return totalSupply;
    }
}