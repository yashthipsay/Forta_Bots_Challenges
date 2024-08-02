import { CONFIGURATOR_PROXY, CONFIGURATOR_PROXY_ARB } from "./constants";
import { NetworkData } from './agent.config';
import CONFIG from './agent.config';
import { ethers } from "forta-agent";

const secondsPerYear = 31536000;
export const getConfigurator = async (chainId: number) => {
    if (chainId == 1) {
      return CONFIGURATOR_PROXY;
    } else if (chainId == 42161) {
      return CONFIGURATOR_PROXY_ARB;
    }
  };

  export const getAddress = async(networkManager: any) => {
    console.log(networkManager.get("usdc"));
    return networkManager.get("usdc");
    
  }

  
export async function gettConfiguration(configuratorProxy: string | undefined, abi: any, provider: ethers.providers.Provider, tokenAddress: string, blockNumber: number): Promise<any> {
  try{
  const configuration = new ethers.Contract(CONFIGURATOR_PROXY, abi, provider);
  return await configuration.callStatic.getConfiguration(configuratorProxy, {blockTag: blockNumber});
  } catch (error) {
    console.log(error);
  }

}
  
  // // .borrowPerYearInterestSlopeLow

  export async function getUtilization(tokenAddress: string, abi: any, provider: ethers.providers.Provider, blockNumber: number) {
    try{
    const utilizationContract = new ethers.Contract(tokenAddress, [abi], provider);
    return await utilizationContract.callStatic.getUtilization({blockTag: blockNumber});

    } catch (error) {
      console.log(error);
    }
  }
    
  export async function getSupplyAPR(tokenAddress: string, abi: any, provider: ethers.providers.Provider, utilization: ethers.BigNumber, blockNumber: number) {
    const supplyRateContract = new ethers.Contract(tokenAddress, [abi], provider);
    const getSupplyRate = await supplyRateContract.callStatic.getSupplyRate(utilization, {blockTag: blockNumber});
    const supplyAPR = getSupplyRate/1e18 * 100 * secondsPerYear;
    return supplyAPR
  }
  //   console.log(getUtilization.toString());

 
  //   console.log("Supply APR", supplyApr);

  export async function getBorrowAPR(tokenAddress: string, abi: any, provider: ethers.providers.Provider, utilization: ethers.BigNumber, blockNumber: number) {
    const borrowRateContract = new ethers.Contract(tokenAddress, [abi], provider);
    const getBorrowRate = await borrowRateContract.callStatic.getBorrowRate(utilization, {blockTag: blockNumber});
    const borrowAPR = getBorrowRate/1e18 * 100 * secondsPerYear;
    return borrowAPR
  }

  // console.log("Borrow APR", borrowApr);