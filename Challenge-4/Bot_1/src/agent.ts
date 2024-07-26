import {
  Finding,
  FindingSeverity,
  HandleTransaction,
  LogDescription,
  TransactionEvent,
  TxEventBlock,
  ethers,
  getEthersProvider,
} from "forta-agent";
import {
  CONFIGURATOR_PROXY,
  ASSET_INFO,
  RESERVES,
  LIQUIDATE_CF,
  BORROW_CF,
  SET_GOVERNOR,
  BORROW_PYIR,
  USDC_TOKEN,
  SUPPLY_KINK,
  COMET_FACTORY,
  BORROW_KINK,
  CONFIGURATOR,
  UTILIZATION,
  CONFIGURATION_ABI,
} from "./constants";
import { createFinding } from "./findings";
import { getCollateralAsset } from "./helper";

export function provideHandleGovernanceTransaction(
  assetToken: string,
  configuratorProxyAddress: string,
  provider: ethers.providers.Provider,
  assetAbi: string[],
): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];

    const eventFilterMapping: {
      [key: string]: ReturnType<typeof tx.filterLog>;
    } = {
      BORROW_KINK: tx.filterLog(BORROW_KINK, configuratorProxyAddress),
      SUPPLY_KINK: tx.filterLog(SUPPLY_KINK, configuratorProxyAddress),
      SET_GOVERNOR: tx.filterLog(SET_GOVERNOR, configuratorProxyAddress),
      BORROW_PYIR: tx.filterLog(BORROW_PYIR, configuratorProxyAddress),
      BORROW_CF: tx.filterLog(BORROW_CF, configuratorProxyAddress),
      LIQUIDATE_CF: tx.filterLog(LIQUIDATE_CF, configuratorProxyAddress),
    };

    const changedEvents: { [key: string]: any } = {};

    Object.entries(eventFilterMapping).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        changedEvents[key] = {
          Old_value: value[0].args[1].toString(),
          New_value: value[0].args[2].toString(),
        };
      }
    });

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
    USDC_TOKEN,
    CONFIGURATOR_PROXY,
    getEthersProvider(),
    ASSET_INFO,
  ),
};
