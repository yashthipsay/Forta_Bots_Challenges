import {
  Finding,
  HandleTransaction,
  LogDescription,
  TransactionEvent,
  ethers,
  getEthersProvider,
} from "forta-agent";
import {
  CONFIGURATOR_PROXY,
  ASSET_INFO,
  LIQUIDATE_CF,
  BORROW_CF,
  SET_GOVERNOR,
  BORROW_PYIR,
  SUPPLY_KINK,
  BORROW_KINK,
  SUPPLY_PYIR,
  eventInterface,
  USDC_TOKEN_ETH
} from "./constants";
import { createFinding } from "./findings";
import { getCollateralAsset } from "./helper";
import { data, getAddress, getConfigurator } from "./networkManager";

let configuratorProxy: string | undefined;
export function provideInitialize(provider: ethers.providers.Provider){
  return async function initialize() {
    const network = await provider.getNetwork();
    configuratorProxy = await getConfigurator(network.chainId);
  }
}

export function provideHandleGovernanceTransaction(
  provider: ethers.providers.Provider,
  assetAbi: string[],
): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];
   

   const result = tx.filterLog([BORROW_KINK, SUPPLY_KINK, SET_GOVERNOR, BORROW_PYIR, SUPPLY_PYIR, BORROW_CF, LIQUIDATE_CF], configuratorProxy)
   
   const assetToken = await getAddress(provider);
   const changedEvents: { [key: string]: any } = {};
   result.forEach((log) => {
    const name = log.name
    if(name != "UpdateAssetBorrowCollateralFactor" && name != "UpdateAssetLiquidateCollateralFactor"){
      changedEvents[name] = {
        Old_value: log.args[1].toString(),
        New_value: log.args[2].toString(),
      }

    }
    else{
      changedEvents[name] = {
        Old_value: log.args[2].toString(),
        New_value: log.args[3].toString(),
      }
    }
   })

   


    // Additional feature - Fetch collateral asset for the most transacted token in the pool i.e. USDC
    const obj = await getCollateralAsset(
      assetToken,
      assetAbi,
      provider,
      tx.blockNumber,
    );

    const infoObject = obj;

    // Create findind only if there is a change of events
    if (Object.keys(changedEvents).length > 0) {
      finding.push(
        createFinding(
          assetToken,
          infoObject,
          tx.network.toString(),
          changedEvents,
        ),
      );
    }

    return finding;
  };
}

export default {
  initialize: provideInitialize(getEthersProvider()),
  handleTransaction: provideHandleGovernanceTransaction(
    getEthersProvider() as any,
    ASSET_INFO,
  ),
};
