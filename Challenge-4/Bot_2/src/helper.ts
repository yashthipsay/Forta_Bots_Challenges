import {
  CONFIGURATION_ABI,
} from "./constants";
import { AlertsResponse, ethers, getAlerts } from "forta-agent";
import { AlertType } from "./types";

export default class Helper {
  private provider: ethers.providers.Provider;
  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }

  public secondsPerYear = 31536000;

  public async getProtocolConfiguration(
    tokenAddress: string ,
    configuratorProxy: string,
    blockNumber: number,
  ): Promise<any> {
      const configuration = new ethers.Contract(
      configuratorProxy,
      CONFIGURATION_ABI,
      this.provider,
    );

    return await configuration.callStatic.getConfiguration(tokenAddress, {
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

  // getSupplyRate returns the supply rate in terms of seconds. It has to be converted to annual rate
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

  // getBorrowRate returns the borrow rate in terms of seconds. It has to be converted to annual rate
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

  // alerts only if utilization is aove supply kink or borrow kink for supply function and borrow function respectively
  public async getCompoundAlerts(
    chaindId: number,
    alertType: AlertType,
  ): Promise<AlertsResponse> {
    let alertId: string;
    if (alertType.function === "supply") {
      alertId = "SUPPLY-2";
    } else if (alertType.function === "withdraw") {
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
