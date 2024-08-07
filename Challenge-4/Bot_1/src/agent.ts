import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  ethers,
  getEthersProvider,
} from "forta-agent";
import {
  ASSET_INFO,
  USDC_TOKEN_ETH,
  USDC_TOKEN_ARB,
  EVENTS_ARRAY,
  CONFIGURATOR_PROXY,
  CONFIGURATOR_PROXY_ARB,
} from "./constants";
import { createFinding } from "./findings";
import Helper from "./helper";
import { NetworkManager } from "forta-agent-tools";

let configuratorProxy: string | undefined;
let networkManager: NetworkManager<NetworkData>;
let network: ethers.providers.Network;
let helper: Helper;
interface NetworkData {
  usdc: string;
  configurationproxy: string;
}
const networkData: Record<number, NetworkData> = {
  1: {
    usdc: USDC_TOKEN_ETH,
    configurationproxy: CONFIGURATOR_PROXY,
  },
  42161: {
    usdc: USDC_TOKEN_ARB,
    configurationproxy: CONFIGURATOR_PROXY_ARB,
  },
};

export function provideInitialize(provider: ethers.providers.Provider) {
  return async function initialize() {
    network = await provider.getNetwork();
    networkManager = new NetworkManager(networkData);
    await networkManager.init(provider);
    helper = new Helper(provider);
  };
}

export function provideHandleTransaction(
  provider: ethers.providers.Provider,
  assetAbi: string[],
): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];
    configuratorProxy = await helper.getConfigurator(network.chainId);

    const usdc = networkManager.get("usdc");
    const changedValues: { [key: string]: any } = {};
    tx.filterLog(EVENTS_ARRAY, configuratorProxy).forEach((log) => {
      const name = log.name;
      if (
        name != "UpdateAssetBorrowCollateralFactor" &&
        name != "UpdateAssetLiquidateCollateralFactor"
      ) {
        changedValues[name] = {
          Old_value: log.args[1].toString(),
          New_value: log.args[2].toString(),
        };
      } else {
        changedValues[name] = {
          Old_value: log.args[2].toString(),
          New_value: log.args[3].toString(),
        };
      }
    });

    // Additional feature - Fetch collateral asset for the most transacted token in the pool i.e. USDC
    const collateralAssets = await helper.getCollateralAssets(
      usdc,
      assetAbi,
      tx.blockNumber,
    );

    // Create findind only if there is a change of events
    if (Object.keys(changedValues).length > 0) {
      finding.push(createFinding(usdc, collateralAssets, changedValues));
    }

    return finding;
  };
}

export default {
  initialize: provideInitialize(getEthersProvider()),
  handleTransaction: provideHandleTransaction(
    getEthersProvider() as any,
    ASSET_INFO,
  ),
};
