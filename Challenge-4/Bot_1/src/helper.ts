import { ethers } from "forta-agent";
import { LRUCache } from "lru-cache";
import {
  CONFIGURATOR_PROXY,
  CONFIGURATOR_PROXY_ARB,
  ERC20_ABI,
} from "./constants";

export default class Helper {
  private provider: ethers.providers.Provider;
  private collateralAssetsCache: LRUCache<string, { [name: string]: string }>;
  private collateralNamesCache: LRUCache<string, string>;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.collateralAssetsCache = new LRUCache<
      string,
      { [name: string]: string }
    >({
      max: 1000,
    });
    this.collateralNamesCache = new LRUCache<string, string>({
      max: 1000,
    });
  }

  public async getCollateralAssets(
    usdcAddress: string,
    usdcAbi: string[],
    blockNumber: number,
  ): Promise<{ [name: string]: string }> {
    const assetContract = new ethers.Contract(
      usdcAddress,
      usdcAbi,
      this.provider,
    );
    const key = `${usdcAddress}`;
    if (this.collateralAssetsCache.has(key)) {
      return this.collateralAssetsCache.get(key) as { [name: string]: string };
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
          (await this.getCollateralName(
            collateralAssetInfo.asset,
            blockNumber,
          ));
        collateralAssets[collateralName] = collateralAssetInfo.asset;
        index++; // Increment after successful fetch
      } catch (error) {
        break; // Exit loop on error
      }
    }

    this.collateralAssetsCache.set(key, collateralAssets);
    return collateralAssets;
  }

  // Fetching names of the collteral assets for specifying in metadata
  private async getCollateralName(
    tokenAddress: string,
    blockNumber: number,
  ): Promise<string | undefined> {
    const key = `${tokenAddress}`;
    if (this.collateralNamesCache.has(key)) {
      return this.collateralNamesCache.get(key);
    }
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      this.provider,
    );

    const tokenName = await tokenContract.name({ blockTag: blockNumber });
    this.collateralNamesCache.set(key, tokenName);
    return tokenName;
  }
}
