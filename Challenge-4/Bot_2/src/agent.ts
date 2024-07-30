import { HandleTransaction, TransactionEvent, ethers, Finding, getEthersProvider } from 'forta-agent';
import { BORROW_RATE, COMET_FACTORY, CONFIGURATION_ABI, CONFIGURATOR, CONFIGURATOR_PROXY, SUPPLY_RATE, TOKEN_ADDRESSES, USDC_TOKEN_ETH, UTILIZATION } from './constants';
import { abi } from './configAbi';


export function provideUtilization(provider: ethers.providers.Provider): HandleTransaction{
  return async function HandleTransaction(tx: TransactionEvent) {
    const finding: Finding[] = [];

    const configuration = new ethers.Contract(CONFIGURATOR_PROXY, abi, provider);
    const getConfiguration = await configuration.callStatic.getConfiguration("0xA17581A9E3356d9A858b789D68B4d866e593aE94");
    console.log(getConfiguration[6].toString()/1e18 * 100);
    // .borrowPerYearInterestSlopeLow
    for(const [token, address] of Object.entries(TOKEN_ADDRESSES)){
      const utilizationContract = new ethers.Contract(address, [UTILIZATION], provider);
      const getUtilization = await utilizationContract.callStatic.getUtilization();
      // console.log(token, getUtilization.toString()/1e16);

      const supplyRateContract = new ethers.Contract(address, [SUPPLY_RATE], provider);
      const getSupplyRate = await supplyRateContract.callStatic.getSupplyRate(getUtilization);
      console.log("Supply Rate", getSupplyRate.toString());

      const borrowRateContract = new ethers.Contract(address, [BORROW_RATE], provider);
    const getBorrowRate = await borrowRateContract.callStatic.getBorrowRate(getUtilization);
    // console.log("Borrow Rate", getBorrowRate.toString()/1e18 * 100, "\n");
    }
  
    
    
    return finding;
  }
}

export default{
  handleTransaction: provideUtilization(getEthersProvider()),
}