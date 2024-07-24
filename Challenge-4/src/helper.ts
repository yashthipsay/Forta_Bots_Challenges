import { ethers } from "forta-agent";
import { USDC_TOKEN } from "./constants";

export async function getCollateralAsset(assetToken: string, abi: string[], provider: ethers.providers.Provider): Promise<{[name: string]: string}> {
    const assetInfo = new ethers.Contract(assetToken, abi, provider);
    let infoArray: {[name: string]: string} = {};
    let infoObject;
    let index = 0; // Start from 0, increment before fetching next

    while (true) {
        try {
            infoObject = await assetInfo.callStatic.getAssetInfo(index);
            const collateralName ="Collateral Asset - " +  await getCollateralName(provider, infoObject.asset);
            infoArray[collateralName] = infoObject.asset;
            index++; // Increment after successful fetch
        } catch (error) {
            console.log("Done");
            break; // Exit loop on error
        }
    }

    return infoArray;
}

async function getCollateralName(provider: ethers.providers.Provider, tokenAddress: string): Promise<string> { 
    const erc20Abi = ["function name() view returns (string)"];
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    try {
        const tokenName = await tokenContract.name();
        return tokenName;
    } catch (error) {
        console.error("Error fetching token name:", error);
        throw error; // Rethrow to be caught by caller
    }
}