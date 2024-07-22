import { Finding, HandleTransaction, TransactionEvent, ethers, getEthersProvider } from "forta-agent";

import {CONFIGURATOR_PROXY, ASSET_INFO, LIQUIDATE_CF, BORROW_CF, SET_GOVERNOR, BORROW_PYIR, USDC_TOKEN, SUPPLY_KINK, COMET_FACTORY, BORROW_KINK, CONFIGURATOR, UTILIZATION} from "./constants";

export function provideHandleGovernanceTransaction(configuratorProxyAddress: string, provider: ethers.providers.Provider): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent){
    const finding: Finding[] = [];

    const cometContract = new ethers.Contract(USDC_TOKEN, [UTILIZATION], provider)
    // console.log(cometContract);
    const getUtilization = await cometContract.getUtilization(
    );
 
  

  try{
    const borrowRate = new ethers.Contract(USDC_TOKEN, ["function getBorrowRate(uint utilization) public view returns (uint64)"], provider)
    const getBorrowRate = await borrowRate.getBorrowRate(getUtilization);
    console.log(getBorrowRate.toString());
  }catch (error){
    console.log(error);
  }

  const eventFilterMapping: { [key: string]: ReturnType<typeof tx.filterLog> } = {
    "BORROW_KINK": tx.filterLog(BORROW_KINK, configuratorProxyAddress),
    "SUPPLY_KINK": tx.filterLog(SUPPLY_KINK, configuratorProxyAddress),
    "SET_GOVERNOR": tx.filterLog(SET_GOVERNOR, configuratorProxyAddress),
    "BORROW_PYIR": tx.filterLog(BORROW_PYIR, configuratorProxyAddress),
    "BORROW_CF": tx.filterLog(BORROW_CF, configuratorProxyAddress),
    "LIQUIDATE_CF": tx.filterLog(LIQUIDATE_CF, configuratorProxyAddress),
  };

  const assetInfo = new ethers.Contract("0x343715FA797B8e9fe48b9eFaB4b54f01CA860e78", ["function getAssetInfoByAddress(address asset) public view returns (AssetInfo)"], provider);
//  console.log(assetInfo);
// Assuming you meant to call a method that exists and is named correctly
// Correct the method call (assuming getAssetInfo exists and accepts an index or identifier)
// Here, replace `USDC_TOKEN` with the appropriate argument, such as an index if `getAssetInfo` expects one
try {
  const assetInfoResult = await assetInfo.getAssetInfoByAddress(USDC_TOKEN, {blockTag: tx.blockNumber}); // Example: passing 0 as an argument, adjust as needed
  // Use assetInfoResult here
  console.log(assetInfoResult);
} catch (error) {
  console.error("Error fetching asset info:", error);
}
  // console.log(eventFilterMapping);

    return finding;
  }
}

export default {
  handleTransaction: provideHandleGovernanceTransaction(CONFIGURATOR_PROXY, getEthersProvider()),
};