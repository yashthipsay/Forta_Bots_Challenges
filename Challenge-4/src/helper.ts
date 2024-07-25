import { ethers } from "forta-agent";
import { USDC_TOKEN } from "./constants";

export async function getCollateralAsset(assetToken: string, abi: string[], provider: ethers.providers.Provider, blockNumber: number): Promise<{[name: string]: string}> {
    const assetInfo = new ethers.Contract(assetToken, abi, provider);
    let infoArray: {[name: string]: string} = {};
    let infoObject: any;
    let index = 0; // Start from 0, increment before fetching next
    await assetInfo.getAssetInfo(index, {blockTag: blockNumber});
    while (true) {
        try {
            infoObject = await assetInfo.callStatic.getAssetInfo(index, {blockTag: blockNumber});
            const collateralName ="Collateral Asset - " +  await getCollateralName(provider, infoObject.asset, blockNumber);
            
            infoArray[collateralName] = infoObject.asset;
            index++; // Increment after successful fetch
        } catch (error) {
            console.log("Done");
            break; // Exit loop on error
        }
    }

    return infoArray;
}

async function getCollateralName(provider: ethers.providers.Provider, tokenAddress: string, blockNumber: number): Promise<string> { 
    const erc20Abi = ["function name() view returns (string)"];
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
   
        const tokenName = await tokenContract.name({blockTag: blockNumber});
        return tokenName;
}