import { HandleTransaction, TransactionEvent, ethers, Finding, getEthersProvider, FindingSeverity } from 'forta-agent';
import { BORROW_RATE, COMET_FACTORY, CONFIGURATION_ABI, CONFIGURATOR, CONFIGURATOR_PROXY, SUPPLY, SUPPLY_RATE, TOKEN_ADDRESSES, USDC_TOKEN_ETH, UTILIZATION, WITHDRAW } from './constants';
import Helper from './helper';
import CONFIG, { NetworkData } from './agent.config';
import { NetworkManager } from 'forta-agent-tools';
import { supplyFinding, borrowFinding } from './findings';

let configuratorProxy: string | undefined;
let tokenAddress: string;
let helper: Helper;
const networkManager = new NetworkManager<NetworkData>(CONFIG)
export function provideInitialize(provider: ethers.providers.Provider) {
  return async function initialize() {
    await networkManager.init(provider);
    helper = new Helper(provider);
  }
}


export function provideUtilization(provider: ethers.providers.Provider): HandleTransaction{
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];
    const secondsPerYear = 31536000;
    tokenAddress = await helper.getAddress(networkManager);

    const withdraw = tx.filterFunction(WITHDRAW, tokenAddress);
    // console.log(withdraw);

    const supply = tx.filterFunction(SUPPLY, tokenAddress);
    // console.log(supply);
    const network = await provider.getNetwork();

    configuratorProxy = await helper.getConfigurator(network.chainId);

    const configuration = await helper.gettConfiguration(USDC_TOKEN_ETH, tokenAddress, tx.blockNumber);
    console.log(configuration);
    // .borrowPerYearInterestSlopeLow
    const utilization = await helper.getUtilization(tokenAddress, UTILIZATION, tx.blockNumber);  
    console.log(utilization.toString());


     const supplyAPR = await helper.getSupplyAPR(tokenAddress, SUPPLY_RATE, utilization, tx.blockNumber);
     console.log("Supply APR", supplyAPR);

      const borrowAPR = await helper.getBorrowAPR(tokenAddress, BORROW_RATE, utilization, tx.blockNumber);
      console.log("Borrow APR", borrowAPR);
    // console.log("Borrow Rate", getBorrowRate.toString()/1e18 * 100, "\n");

    const percentage = ethers.BigNumber.from(30).mul(ethers.BigNumber.from(10).pow(16))
    const lowerLimit = configuration[9].mul(percentage).div(ethers.BigNumber.from(10).pow(18));
    console.log(lowerLimit.toString());

    const upperPercentage = ethers.BigNumber.from(90).mul(ethers.BigNumber.from(10).pow(16)); // 90% = 0.90 = 90 * 10^(-2) = 90 * 10^(16-18)
const upperLimit = configuration[5].mul(upperPercentage).div(ethers.BigNumber.from(10).pow(18));
console.log(upperLimit.toString());

    if(supply && supply.length > 0 && utilization.gt(upperLimit)){
      finding.push(supplyFinding(supplyAPR.toString(), utilization.toString(), tx.network));
    }
    else if(withdraw && withdraw.length > 0 && utilization.lt(lowerLimit)){
      finding.push(borrowFinding(borrowAPR.toString(), utilization.toString(), tx.network));
    }
    
    return finding;
  }
}

export default{
  initialize: provideInitialize(getEthersProvider()),
  handleTransaction: provideUtilization(getEthersProvider()),
}