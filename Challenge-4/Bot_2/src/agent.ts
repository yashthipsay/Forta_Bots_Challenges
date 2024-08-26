import {
  HandleTransaction,
  TransactionEvent,
  ethers,
  Finding,
  getEthersProvider,
} from "forta-agent";

import {
  BORROW_RATE,
  CONFIGURATION_ABI,
  SUPPLY,
  SUPPLY_RATE,
  upperLimitByPercentage,
  UTILIZATION,
  WITHDRAW,
} from "./constants";

import Helper from "./helper";
import { CONFIG, lowerLimitByPercentage } from "./constants";
import { NetworkData } from "./types";
import { NetworkManager } from "forta-agent-tools";

import {
  supplyFinding,
  borrowFinding,
  supplyFindingAboveKink,
  borrowFindingAboveKink,
} from "./findings";

import { calculatePercentage } from "./utils";

let configuratorProxy: string;
let usdcAddress: string;
let helper: Helper;
let configContract: ethers.Contract;
let protocolInfo: ethers.Contract;

const networkManager = new NetworkManager<NetworkData>(CONFIG);

export function provideInitialize(
  provider: ethers.providers.Provider,
  networkManager: NetworkManager<NetworkData>,
) {
  return async function initialize() {
    await networkManager.init(provider);
    usdcAddress = networkManager.get("usdc");
    configuratorProxy = networkManager.get("configurationProxy");

    configContract = new ethers.Contract(
      configuratorProxy,
      CONFIGURATION_ABI,
      provider,
    );

    protocolInfo = new ethers.Contract(
      usdcAddress,
      [UTILIZATION, SUPPLY_RATE, BORROW_RATE],
      provider,
    );

    helper = new Helper(configContract, protocolInfo);
  };
}

export function provideHandleTransaction(): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {
    const findings: Finding[] = [];

    const compoundPoolTransaction = tx.filterFunction(
      [WITHDRAW, SUPPLY],
      usdcAddress,
    );

    /*
    Will show findings only for a transaction that is a supply transaction or a withdraw transaction. 
    If the transaction is more than the supply or the borrow kink limit, it will trigger an alert
    */
    if (compoundPoolTransaction.length > 0) {
      // get configuration values from the configurator contract for USDC token
      const { 
        configurationData, 
        utilizationData, 
        supplyAPR, 
        borrowAPR 
      } = await helper.getAllCompoundData(
        usdcAddress,
        configuratorProxy,
        tx.blockNumber,
      );

      // calculate lower limit for a withdraw transaction
      const lowerLimit = calculatePercentage(
        lowerLimitByPercentage,
        configurationData[9],
      );

      // calculate upper limit for a supply transaction
      const upperLimit = calculatePercentage(
        upperLimitByPercentage,
        configurationData[5],
      );

      compoundPoolTransaction.forEach((log) => {
        const name = log.name;

        if (name == "supply" && utilizationData.gt(upperLimit)) {
          if (utilizationData.gt(configurationData[5])) {
            findings.push(
              supplyFindingAboveKink(
                supplyAPR.toString(),
                utilizationData.toString(),
              ),
            );
          } else {
            findings.push(
              supplyFinding(supplyAPR.toString(), utilizationData.toString()),
            );
          }
        } else if (name == "withdraw" && utilizationData.lt(lowerLimit)) {
          findings.push(
            borrowFinding(borrowAPR.toString(), utilizationData.toString()),
          );
        } else if (name == "withdraw") {
          if (utilizationData.lt(lowerLimit)) {
            findings.push(
              borrowFinding(borrowAPR.toString(), utilizationData.toString()),
            );
          } else if (utilizationData.gt(configurationData[9])) {
            findings.push(
              borrowFindingAboveKink(
                borrowAPR.toString(),
                utilizationData.toString(),
              ),
            );
          }
        }
      });
    }
    return findings;
  };
}

export default {
  initialize: provideInitialize(getEthersProvider(), networkManager),
  handleTransaction: provideHandleTransaction(),
};
