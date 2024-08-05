import { ethers } from "forta-agent";
import { LRUCache } from "lru-cache";
import { CONFIGURATOR_PROXY, CONFIGURATOR_PROXY_ARB, ERC20_ABI } from "./constants";

export default class Helper {
  private provider: ethers.providers.Provider;
  private cache: LRUCache<string, { [name: string]: string }>;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.cache = new LRUCache<string, { [name: string]: string }>({
      max: 1000,
    });
  }

  public async getCollateralAssets(
    assetToken: string,
    abi: string[],
    blockNumber: number,
  ): Promise<{ [name: string]: string }> {
    const assetContract = new ethers.Contract(assetToken, abi, this.provider);
    const key = `${assetToken}-${blockNumber}`;
    if (this.cache.has(key)) {
      return this.cache.get(key) as { [name: string]: string };
    }
    let collateralAssets: { [name: string]: string } = {};
    let index = 0; // Start from 0, increment before fetching next

    while (true) {
      try {
    let collateralAssetInfo: any;

        collateralAssetInfo = await assetContract.getAssetInfo(index, {
          blockTag: blockNumber,
        });

        const collateralName =
          "Collateral Asset - " +
          (await this.getCollateralName(collateralAssetInfo.asset, blockNumber));
          collateralAssets[collateralName] = collateralAssetInfo.asset;
        index++; // Increment after successful fetch
      } catch (error) {
        break; // Exit loop on error
      }
    }

    this.cache.set(key, collateralAssets);
    return collateralAssets;
  }

  // Fetching names of the collteral assets for specifying in metadata
  private async getCollateralName(
    tokenAddress: string,
    blockNumber: number,
  ): Promise<string> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      this.provider,
    );

    const tokenName = await tokenContract.name({ blockTag: blockNumber });
    return tokenName;
  }

  public async getConfigurator(chainId: number) {
    if (chainId == 1) {
      return CONFIGURATOR_PROXY;
    } else if (chainId == 42161) {
      return CONFIGURATOR_PROXY_ARB;
    }
  }
}
