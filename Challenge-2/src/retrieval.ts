import { Contract, ContractRunner, Provider } from "ethers";
import { ethers } from "forta-agent";

import { COMPUTED_INIT_CODE_HASH, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";

export default class Retrieval {
  private provider: ethers.providers.Provider;

  // Constructor to initialize with an ethers provider
  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }

  // Computes the CREATE2 address for a Uniswap pair

  public getUniswapPairCreate2Address(
    factoryAddress: string,
    token0: string,
    token1: string,
    fee: number,
    initCodeHash: string
  ): string {
    return ethers.utils.getCreate2Address(
      factoryAddress,
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
      ),
      initCodeHash
    );
  }

  // Validates if a given Uniswap pair address is correct by recomputing its CREATE2 address

  public async isValidUniswapPair(
    pairAddress: string,
    block: number,
    uniswapFactoryAddr: string,
    init: string
  ): Promise<[boolean, string, string]> {
    // Create a contract instance for the pair

    const pairContract = new ethers.Contract(pairAddress, UNISWAP_PAIR_ABI, this.provider);
    let token0Address: string, token1Address: string, fee: "string";
    // Fetch token addresses and fee from the contract

    [token0Address, token1Address, fee] = await Promise.all([
      pairContract.token0(),
      pairContract.token1(),
      pairContract.fee(),
    ]);

    // Compute the expected pair address using CREATE2

    const tokenPair = this.getUniswapPairCreate2Address(
      UNISWAP_FACTORY_ADDRESS,
      token0Address,
      token1Address,
      Number(fee),
      COMPUTED_INIT_CODE_HASH
    );
    // Compare computed address with the provided pair address

    const isValid = tokenPair.toLowerCase() === pairAddress.toLowerCase() ? true : false;

    return [isValid, token0Address.toLowerCase(), token1Address.toLowerCase()];
  }
}
