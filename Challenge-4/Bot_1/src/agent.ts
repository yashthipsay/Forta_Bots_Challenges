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
  RESULTS_ARRAY,
} from "./constants";
import { createFinding } from "./findings";
import Helper from "./helper";
import { NetworkManager } from "forta-agent-tools";

let configuratorProxy: string | undefined;
let networkManager: any;
let network: ethers.providers.Network;
interface NetworkData {
  usdc: string;
  configurationproxy: number;
}
const networkData: Record<number, NetworkData> = {
  1: {
    usdc: USDC_TOKEN_ETH,
    configurationproxy: 1,
  },
  42161: {
    usdc: USDC_TOKEN_ARB,
    configurationproxy: 2,
  },
};

export function provideInitialize(provider: ethers.providers.Provider) {
  return async function initialize() {
    network = await provider.getNetwork();
    networkManager = new NetworkManager(networkData);
    await networkManager.init(provider);
  };
}

export function provideHandleGovernanceTransaction(
  provider: ethers.providers.Provider,
  assetAbi: string[],
): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];
    const helper = new Helper(provider);
    configuratorProxy = await helper.getConfigurator(network.chainId);

    const logs = tx.filterLog(RESULTS_ARRAY, configuratorProxy);

    const usdc = networkManager.get("usdc");
    const changedValues: { [key: string]: any } = {};
    logs.forEach((log) => {
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
      finding.push(
        createFinding(
          usdc,
          collateralAssets,
          changedValues,
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
