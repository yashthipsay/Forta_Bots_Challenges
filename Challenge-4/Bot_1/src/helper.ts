import { ethers } from "forta-agent";
import { LRUCache } from "lru-cache";
import { ERC20_ABI } from "./constants";

export default class Helper {
  private provider: ethers.providers.Provider;
  private collateralAssetsCache: LRUCache<string, { [name: string]: string }>;
  private collateralNamesCacheObject: { [address: string]: string };

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.collateralAssetsCache = new LRUCache<
      string,
      { [name: string]: string }
    >({
      max: 1000,
    });
    this.collateralNamesCacheObject = {};
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
    const key = `${usdcAddress}-${blockNumber}`;
    if (this.collateralAssetsCache.has(key)) {
      return this.collateralAssetsCache.get(key) as { [name: string]: string };
    }
    let collateralAssets: { [name: string]: string } = {};
    let index = 0; // Start from 0, increment before fetching next
    let collateralName: string | undefined;

    while (true) {
      try {
        let collateralAssetInfo: any;

        collateralAssetInfo = await assetContract.getAssetInfo(index, {
          blockTag: blockNumber,
        });

        collateralName = await this.getCollateralName(
          collateralAssetInfo.asset,
          blockNumber,
        );

        collateralAssets[collateralName as string] = collateralAssetInfo.asset;
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
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      this.provider,
    );
    let collateralName = this.collateralNamesCacheObject[tokenAddress];

    if (!collateralName) {
      collateralName = await tokenContract.name({ blockTag: blockNumber });
      this.collateralNamesCacheObject[tokenAddress] = collateralName;
    }

    return "Collateral Asset - " + collateralName;
  }
}
