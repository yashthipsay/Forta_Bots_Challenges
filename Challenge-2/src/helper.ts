import { ethers } from "forta-agent";
import { UNISWAP_PAIR_ABI } from "./constants";
import { LRUCache } from "lru-cache";

export default class Helper {
  private cache: LRUCache<string, [boolean, string, string, string]>;
  private externalCallCount: number;

  // Constructor to initialize with an ethers provider
  constructor() {
    this.cache = new LRUCache<string, [boolean, string, string, string]>({ max: 1000 });
    this.externalCallCount = 0;
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
    initcode: string,
    provider: ethers.providers.Provider,
    block: number
  ): Promise<[boolean, string, string, string]> {
    const key = `${factoryAddress}-${pairAddress}-${initcode}-${block}`;
    if (this.cache.has(key)) {
      return this.cache.get(key) as [boolean, string, string, string];
    }

    this.externalCallCount++;
    const pairContract = new ethers.Contract(pairAddress, UNISWAP_PAIR_ABI, provider);
    const [token0Address, token1Address, fee] = await Promise.all([
      pairContract.token0({ blockTag: block }),
      pairContract.token1({ blockTag: block }),
      pairContract.fee({ blockTag: block }),
    ]);
    const tokenPair = this.getUniswapPairCreate2Address(factoryAddress, token0Address, token1Address, fee, initcode);

    const isValid = tokenPair.toLowerCase() === pairAddress.toLowerCase();
    this.cache.set(key, [isValid, token0Address, token1Address, fee.toString()]);
    return [isValid, token0Address, token1Address, fee];
  }
}
