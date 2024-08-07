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
  USDC_TOKEN_ETH,
  UTILIZATION,
  WITHDRAW,
} from "./constants";
import Helper from "./helper";
import CONFIG from "./agent.config";
import { NetworkData } from "./types";
import { NetworkManager } from "forta-agent-tools";
import {
  supplyFinding,
  borrowFinding,
  alertSupplyFinding,
  alertBorrowFinding,
} from "./findings";

let configuratorProxy: string | undefined;
let tokenAddress: string;
let helper: Helper;
const networkManager = new NetworkManager<NetworkData>(CONFIG);
export function provideInitialize(provider: ethers.providers.Provider) {
  return async function initialize() {
    await networkManager.init(provider);
    helper = new Helper(provider);
  };
}

export function provideHandleTransaction(
): HandleTransaction {
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];

    tokenAddress = networkManager.get("usdc");

    const withdraw = tx.filterFunction([WITHDRAW], tokenAddress);

    const supply = tx.filterFunction([SUPPLY], tokenAddress);

    configuratorProxy = networkManager.get("configurationProxy");

    // get configuration values from the configurator contract for USDC token
    const configuration = await helper.gettConfiguration(
      USDC_TOKEN_ETH,
      tx.blockNumber,
    );

    // get utilization for cUSDC token
    const utilization = await helper.getUtilization(
      tokenAddress,
      UTILIZATION,
      tx.blockNumber,
    );

    // get annual percentage rate for supply
    const supplyAPR = await helper.getSupplyAPR(
      tokenAddress,
      SUPPLY_RATE,
      utilization,
      tx.blockNumber,
    );

    // get annual percentage rate for borrow
    const borrowAPR = await helper.getBorrowAPR(
      tokenAddress,
      BORROW_RATE,
      utilization,
      tx.blockNumber,
    );

    // calculate lower limit for a withdraw transaction 
    const lowerLimitByPercentage = ethers.BigNumber.from(30).mul(
      ethers.BigNumber.from(10).pow(16),
    );
    const lowerLimit = configuration[9]
      .mul(lowerLimitByPercentage)
      .div(ethers.BigNumber.from(10).pow(18));

    // calculate upper limit for a supply transaction
    const upperLimitByPercentage = ethers.BigNumber.from(90).mul(
      ethers.BigNumber.from(10).pow(16),
    ); // 90% = 0.90 = 90 * 10^(-2) = 90 * 10^(16-18)
    const upperLimit = configuration[5]
      .mul(upperLimitByPercentage)
      .div(ethers.BigNumber.from(10).pow(18));

    // will show findings only for a transaction that is a supply transaction or a withdraw transaction. If the transaction is more than the supply or the borrowkink limit, it will trigger an alert
    if (supply && supply.length > 0 && utilization.gt(upperLimit)) {
      if (utilization.gt(configuration[5])) {
        helper.getCompoundAlerts(1, { function: "supply" });
        finding.push(
          alertSupplyFinding(supplyAPR.toString(), utilization.toString()),
        );
      } else {
        for (let i = 0; i < supply.length; i++) {
          finding.push(
            supplyFinding(supplyAPR.toString(), utilization.toString()),
          );
        }
      }
    } else if (withdraw && withdraw.length > 0 && utilization.lt(lowerLimit)) {
      for (let i = 0; i < withdraw.length; i++) {
        finding.push(
          borrowFinding(borrowAPR.toString(), utilization.toString()),
        );
      }
    } else if (  //conditions for a withdraw transaction that would trigger an alert, hencec it is in a different else if block
      withdraw &&
      withdraw.length > 0 &&
      utilization.gt(configuration[9])
    ) {
      helper.getCompoundAlerts(1, { function: "withdraw" });
      finding.push(
        alertBorrowFinding(borrowAPR.toString(), utilization.toString()),
      );
    }
    return finding;
  };
}

export default {
  initialize: provideInitialize(getEthersProvider()),
  handleTransaction: provideHandleTransaction(),
};
