import {
  Finding,
  HandleTransaction,
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
} from "./constants";
import { createFinding } from "./findings";
import { getCollateralAsset } from "./helper";
import { data, getAddress, getConfigurator } from "./networkManager";

export function provideHandleGovernanceTransaction(
  provider: ethers.providers.Provider,
  assetAbi: string[],
): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {

    const finding: Finding[] = [];
    const network = await provider.getNetwork();
    let configuratorProxy = await getConfigurator(network.chainId);
    const eventFilterMapping: {
      [key: string]: ReturnType<typeof tx.filterLog>;
    } = {
      BORROW_KINK: tx.filterLog(BORROW_KINK, configuratorProxy),
      SUPPLY_KINK: tx.filterLog(SUPPLY_KINK, configuratorProxy),
      SET_GOVERNOR: tx.filterLog(SET_GOVERNOR, configuratorProxy),
      BORROW_PYIR: tx.filterLog(BORROW_PYIR, configuratorProxy),
      SUPPLY_PYIR: tx.filterLog(SUPPLY_PYIR, configuratorProxy),
      BORROW_CF: tx.filterLog(BORROW_CF, configuratorProxy),
      LIQUIDATE_CF: tx.filterLog(LIQUIDATE_CF, configuratorProxy),
    };
    console.log(eventFilterMapping.BORROW_CF);
    const assetToken = await getAddress(provider);
    const changedEvents: { [key: string]: any } = {};

    Object.entries(eventFilterMapping).forEach(([key, value]) => {
      console.log(key)
      if (Array.isArray(value) && value.length > 0) {
        if(key != 'LIQUIDATE_CF' && key != 'BORROW_CF'){
        changedEvents[key] = {
          Old_value: value[0].args[1].toString(),
          New_value: value[0].args[2].toString(),
        }
       
        } else {
          changedEvents[key] = {
            Old_value: value[0].args[2].toString(),
            New_value: value[0].args[3].toString(),
          }
        }
      }
    });

    console.log(changedEvents);

    const obj = await getCollateralAsset(
      assetToken,
      assetAbi,
      provider,
      tx.blockNumber,
    );

    const infoObject = obj;

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
  handleTransaction: provideHandleGovernanceTransaction(
    getEthersProvider() as any,
    ASSET_INFO,
  ),
};
