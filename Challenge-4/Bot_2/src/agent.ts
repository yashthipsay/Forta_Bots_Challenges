import {
  HandleTransaction,
  TransactionEvent,
  ethers,
  Finding,
  getEthersProvider,
} from "forta-agent";
import {
  BORROW_RATE,
  SUPPLY,
  SUPPLY_RATE,
  upperLimitByPercentage,
  USDC_TOKEN_ETH,
  UTILIZATION,
  WITHDRAW,
} from "./constants";
import Helper from "./helper";
import { CONFIG, lowerLimitByPercentage } from './constants';
import { NetworkData } from "./types";
import { NetworkManager } from "forta-agent-tools";
import {
  supplyFinding,
  borrowFinding,
  alertSupplyFinding,
  alertBorrowFinding,
} from "./findings";
import { calculatePercentage } from "./utils";

let configuratorProxy: string;
let tokenAddress: string;
let helper: Helper;
const networkManager = new NetworkManager<NetworkData>(CONFIG);

export function provideInitialize(provider: ethers.providers.Provider) {
  return async function initialize() {
    await networkManager.init(provider);
    helper = new Helper(provider);
    configuratorProxy = networkManager.get("configurationProxy");
    tokenAddress = networkManager.get("usdc");

  };
}

export function provideHandleTransaction(
): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];


    const transaction = tx.filterFunction([WITHDRAW, SUPPLY], tokenAddress);

  


    // get configuration values from the configurator contract for USDC token
    const {configurationData, utilizationData, supplyAPR, borrowAPR} = await helper.getAllCompoundData(tokenAddress, configuratorProxy, tx.blockNumber)

    // calculate lower limit for a withdraw transaction 
    const lowerLimit = calculatePercentage(lowerLimitByPercentage, configurationData[9])

    // calculate upper limit for a supply transaction
    const upperLimit = calculatePercentage(upperLimitByPercentage, configurationData[5])

    /*
    Will show findings only for a transaction that is a supply transaction or a withdraw transaction. 
    If the transaction is more than the supply or the borrowkink limit, it will trigger an alert
    */
if(transaction.length > 0) {
  transaction.forEach((log) => {
    const name = log.name;
    if(name == "supply" && utilizationData.gt(upperLimit)){
      if (utilizationData.gt(configurationData[5])) {
        finding.push(
          alertSupplyFinding(supplyAPR.toString(), utilizationData.toString()),
        );
      } else {
          finding.push(
            supplyFinding(supplyAPR.toString(), utilizationData.toString()),
          );
      }
    }
    else if(name == "withdraw" && utilizationData.lt(lowerLimit)){
      finding.push(
        borrowFinding(borrowAPR.toString(), utilizationData.toString()),
      );
    } 
    else if(name == "withdraw" && utilizationData.gt(configurationData[9])){
      finding.push(
        alertBorrowFinding(borrowAPR.toString(), utilizationData.toString()),
      );
    }

  })
}
    return finding;
  };
}

export default {
  initialize: provideInitialize(getEthersProvider()),
  handleTransaction: provideHandleTransaction(),
};
