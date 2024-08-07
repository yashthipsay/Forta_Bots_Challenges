import {
  CONFIGURATION_ABI,
  CONFIGURATOR_PROXY,
  CONFIGURATOR_PROXY_POLYGON,
} from "./constants";
import { AlertsResponse, ethers, getAlerts } from "forta-agent";
import { AlertType } from "./types";

export default class Helper {
  private provider: ethers.providers.Provider;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }

  public secondsPerYear = 31536000;

  public async getConfigurator(chainId: number) {
    if (chainId == 1) {
      return CONFIGURATOR_PROXY;
    } else if (chainId == 42161) {
      return CONFIGURATOR_PROXY_POLYGON;
    }
  }

  public async gettConfiguration(
    configuratorProxy: string | undefined,
    tokenAddress: string,
    blockNumber: number,
  ): Promise<any> {
    const configuration = new ethers.Contract(
      CONFIGURATOR_PROXY,
      CONFIGURATION_ABI,
      this.provider,
    );
   
    return await configuration.callStatic.getConfiguration(configuratorProxy, {
      blockTag: blockNumber,
    });
  }


  public async getUtilization(
    tokenAddress: string,
    abi: any,
    blockNumber: number,
  ) {
    const utilizationContract = new ethers.Contract(
      tokenAddress,
      [abi],
      this.provider,
    );
    return await utilizationContract.callStatic.getUtilization({
      blockTag: blockNumber,
    });
  }

  public async getSupplyAPR(
    tokenAddress: string,
    abi: any,
    utilization: ethers.BigNumber,
    blockNumber: number,
  ) {
    const supplyRateContract = new ethers.Contract(
      tokenAddress,
      [abi],
      this.provider,
    );
    const getSupplyRate = await supplyRateContract.callStatic.getSupplyRate(
      utilization,
      { blockTag: blockNumber },
    );
    const supplyAPR = (getSupplyRate / 1e18) * 100 * this.secondsPerYear;
    return supplyAPR;
  }

  public async getBorrowAPR(
    tokenAddress: string,
    abi: any,
    utilization: ethers.BigNumber,
    blockNumber: number,
  ) {
    const borrowRateContract = new ethers.Contract(
      tokenAddress,
      [abi],
      this.provider,
    );
    const getBorrowRate = await borrowRateContract.callStatic.getBorrowRate(
      utilization,
      { blockTag: blockNumber },
    );
    const borrowAPR = (getBorrowRate / 1e18) * 100 * this.secondsPerYear;
    return borrowAPR;
  }

public async getCompoundAlerts(chaindId: number, alertType: AlertType): Promise<AlertsResponse>{
  let alertId: string;
  if(alertType.function === "supply") {
    alertId = "SUPPLY-2";
  } else if (alertType.function === "borrow") {
    alertId = "BORROW-2";
  } else {
    throw new Error(`Unknown function type: ${alertType.function}`);
}

  return await getAlerts({
    alertId: alertId,
    chainId: chaindId,
  });
}

}

