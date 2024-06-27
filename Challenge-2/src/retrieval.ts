import { ethers } from "forta-agent";

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
    initcode: string
  ): string {
    return ethers.utils.getCreate2Address(
      factoryAddress,
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
      ),
      initcode
    );
  }

  // Validates if a given Uniswap pair address is correct by recomputing its CREATE2 address

  public async isValidUniswapPair(
    factoryAddress: string,
    pairAddress: string,
    token0Address: string,
    token1Address: string,
    fee: number,
    initcode: string
  ): Promise<[boolean, string, string]> {
    const tokenPair = this.getUniswapPairCreate2Address(factoryAddress, token0Address, token1Address, fee, initcode);

    const isValid = tokenPair.toLowerCase() === pairAddress.toLowerCase();
    console.log(isValid, tokenPair, pairAddress);
    return [isValid, token0Address.toLowerCase(), token1Address.toLowerCase()];
  }
}
