import { Finding, FindingSeverity, HandleTransaction, TransactionEvent, ethers, getEthersProvider } from "forta-agent";
import {CONFIGURATOR_PROXY, ASSET_INFO, RESERVES, LIQUIDATE_CF, BORROW_CF, SET_GOVERNOR, BORROW_PYIR, USDC_TOKEN, SUPPLY_KINK, COMET_FACTORY, BORROW_KINK, CONFIGURATOR, UTILIZATION, CONFIGURATION_ABI} from "./constants";
import { abiJson } from "./configuratorAbi";
import { createFinding } from "./findings";
import { getCollateralAsset } from "./helper";

export function provideHandleGovernanceTransaction(configuratorProxyAddress: string, provider: ethers.providers.Provider): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent){
    const finding: Finding[] = [];

    const cometContract = new ethers.Contract(USDC_TOKEN, [UTILIZATION], provider)
    // console.log(cometContract);
    const getUtilization = await cometContract.getUtilization(
    );
    
    // try {
    //   const configurationContract = new ethers.Contract(CONFIGURATOR_PROXY, CONFIGURATION_ABI, provider);
    //   const configuration = await configurationContract.getConfiguration(CONFIGURATOR);
    //   console.log(configuration);
    // } catch (error) {
    //   console.error("Error fetching configuration:", error);
    // }

  //   const struct = new ethers.Contract(USDC_TOKEN, abiJson, provider);
  //   const reserves = await struct.getReserves()
  // console.log(reserves);

  // const reserves = new ethers.Contract(USDC_TOKEN, [RESERVES], provider);

  // const getReserves = await reserves.getReserves();

  //   console.log(getReserves.toString());

  // const assetInfoByAddress = new ethers.Contract(USDC_TOKEN, ["function getAssetInfoByAddress(address asset) public view returns (uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap)"], provider)
  // const getAssetInfoByAddress = await assetInfoByAddress.getAssetInfoByAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");


  // const assetInfo = new ethers.Contract(USDC_TOKEN, ASSET_INFO, provider);

  // for(let i = 0; i<=4; i++){
  //   const infoObject = await assetInfo.callStatic.getAssetInfo(i);
  //   console.log(infoObject)


  // }

  // let infoObject;
  // let index = 0;
  // let flag = 0;
  // infoObject = await assetInfo.callStatic.getAssetInfo(index)
  // while(flag == 0){
  //   console.log(infoObject);
  // infoObject = await assetInfo.callStatic.getAssetInfo(index).catch(()=> {
  //   console.log("Done");
  //   flag = 1
  // })
  // index++;
  // }

  const obj = await getCollateralAsset(USDC_TOKEN, ASSET_INFO, provider);

  console.log(obj);

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

  // finding.push(createFinding(USDC_TOKEN, infoObject, tx.network.toString()));
  
  

  // const assetInfo = new ethers.Contract("0x343715FA797B8e9fe48b9eFaB4b54f01CA860e78", ["function getAssetInfoByAddress(address asset) public view returns (AssetInfo)"], provider);
//  console.log(assetInfo);
// Assuming you meant to call a method that exists and is named correctly
// Correct the method call (assuming getAssetInfo exists and accepts an index or identifier)
// Here, replace `USDC_TOKEN` with the appropriate argument, such as an index if `getAssetInfo` expects one
// try {
//   const assetInfoResult = await assetInfo.getAssetInfoByAddress("0xe07C4e685E1f760f944c676C21E736a7664f4D22"); // Example: passing 0 as an argument, adjust as needed
//   // Use assetInfoResult here
//   console.log(assetInfoResult);
// } catch (error) {
//   console.error("Error fetching asset info:", error);
// }
  // console.log(eventFilterMapping);

    return finding;
  }
}

export default {
  handleTransaction: provideHandleGovernanceTransaction(CONFIGURATOR_PROXY, getEthersProvider() as any),
};