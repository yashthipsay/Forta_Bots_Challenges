import { ethers } from "forta-agent";
import { USDC_TOKEN } from "./constants";
import { LRUCache } from "lru-cache";

let cache = new LRUCache<string, { [name: string]: string }>({ max: 1000 });
export async function getCollateralAsset(
  assetToken: string,
  abi: string[],
  provider: ethers.providers.Provider,
  blockNumber: number,
): Promise<{ [name: string]: string }> {
  const assetInfo = new ethers.Contract(assetToken, abi, provider);
  const key = `${assetToken}-${blockNumber}`;
  if (cache.has(key)) {
    return cache.get(key) as { [name: string]: string };
  }
  let infoArray: { [name: string]: string } = {};
  let infoObject: any;
  let index = 0; // Start from 0, increment before fetching next

  while (true) {
    try {
      infoObject = await assetInfo.getAssetInfo(index, {
        blockTag: blockNumber,
      });

      const collateralName =
        "Collateral Asset - " +
        (await getCollateralName(provider, infoObject.asset, blockNumber));
      infoArray[collateralName] = infoObject.asset;
      index++; // Increment after successful fetch
    } catch (error) {
      break; // Exit loop on error
    }
  }
  cache.set(key, infoArray);
  return infoArray;
}

async function getCollateralName(
  provider: ethers.providers.Provider,
  tokenAddress: string,
  blockNumber: number,
): Promise<string> {
  const erc20Abi = ["function name() view returns (string)"];
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  const tokenName = await tokenContract.name({ blockTag: blockNumber });
  return tokenName;
}
