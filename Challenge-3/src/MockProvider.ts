import { JsonRpcProvider, Network, JsonRpcSigner } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";

export class MockProvider extends JsonRpcProvider {
    private mockChainId: number;
    private mockL1Balance: string;
    private mockL2Supply: string;

    constructor(chainId: number, l1Balance: string, l2Supply: string) {
        super();
        this.mockChainId = chainId;
        this.mockL1Balance = l1Balance;
        this.mockL2Supply = l2Supply;
    }


    async getNetwork(): Promise<Network> {
        return {chainId: this.mockChainId, name: "mocknet"}
    }

    async getBalance(address: string): Promise<BigNumber> {
        if (this.mockChainId === 1) { // Assuming L1 is Ethereum Mainnet
            return BigNumber.from(this.mockL1Balance);
        }
        throw new Error("Balance check is only for L1");
    }

    async getTotalSupply(): Promise<string> {
        if (this.mockChainId !== 1) { // Assuming L2 is anything other than Mainnet
          return this.mockL2Supply;
        }
        throw new Error("Total supply check is only for L2");
      }
}