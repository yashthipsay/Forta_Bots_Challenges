import {
  BORROW_RATE,
  CONFIGURATION_ABI,
  SUPPLY_RATE,
  UTILIZATION,
} from "./constants";
import { AlertsResponse, ethers, getAlerts } from "forta-agent";
import { AlertType } from "./types";
import {LRUCache} from "lru-cache";

// export default class Helper {
//   private provider: ethers.providers.Provider;
//   private configCache: LRUCache<string, any>;
//   private utilizationCache: LRUCache<string, any>; 
//   constructor(provider: ethers.providers.Provider) {
//     this.provider = provider;
//     this.configCache = new LRUCache<string, any>({ max: 1000});
//     this.utilizationCache = new LRUCache<string, any>({ max: 1000});
//   }

//   public secondsPerYear = 31536000;

//   public async getProtocolConfiguration(
//     tokenAddress: string ,
//     configuratorProxy: string,
//     blockNumber: number,
//   ): Promise<any> {
//       const key = `${tokenAddress}-${configuratorProxy}`;
//       if (this.configCache.has(key)) {
//         return this.configCache.get(key)
//       }
//       const configuration = new ethers.Contract(
//       configuratorProxy,
//       CONFIGURATION_ABI,
//       this.provider,
//     );
//     this.configCache.set(key, await configuration.callStatic.getConfiguration(tokenAddress, {
//       blockTag: blockNumber,
//     }));
//     return await configuration.callStatic.getConfiguration(tokenAddress, {
//       blockTag: blockNumber,
//     });
//   }

//   public async getUtilization(
//     tokenAddress: string,
//     abi: any,
//     blockNumber: number,
//   ) {
//     const key = `${tokenAddress}-${abi}`;
//     if (this.utilizationCache.has(key)) {
//       return this.utilizationCache.get(key)
//     }
//     const utilizationContract = new ethers.Contract(
//       tokenAddress,
//       [abi],
//       this.provider,
//     );
//     this.utilizationCache.set(key, await utilizationContract.callStatic.getUtilization({
//       blockTag: blockNumber,
//     }));
//     return await utilizationContract.callStatic.getUtilization({
//       blockTag: blockNumber,
//     });
//   }

//   // getSupplyRate returns the supply rate in terms of seconds. It has to be converted to annual rate
//   public async getSupplyAPR(
//     tokenAddress: string,
//     abi: any,
//     utilization: ethers.BigNumber,
//     blockNumber: number,
//   ) {
//     const supplyRateContract = new ethers.Contract(
//       tokenAddress,
//       [abi],
//       this.provider,
//     );
//     const getSupplyRate = await supplyRateContract.callStatic.getSupplyRate(
//       utilization,
//       { blockTag: blockNumber },
//     );
//     const supplyAPR = (getSupplyRate / 1e18) * 100 * this.secondsPerYear;
//     return supplyAPR;
//   }

//   // getBorrowRate returns the borrow rate in terms of seconds. It has to be converted to annual rate
//   public async getBorrowAPR(
//     tokenAddress: string,
//     abi: any,
//     utilization: ethers.BigNumber,
//     blockNumber: number,
//   ) {
//     const borrowRateContract = new ethers.Contract(
//       tokenAddress,
//       [abi],
//       this.provider,
//     );
//     const getBorrowRate = await borrowRateContract.callStatic.getBorrowRate(
//       utilization,
//       { blockTag: blockNumber },
//     );
//     const borrowAPR = (getBorrowRate / 1e18) * 100 * this.secondsPerYear;
//     return borrowAPR;
//   }

//   // alerts only if utilization is aove supply kink or borrow kink for supply function and borrow function respectively
//   public async getCompoundAlerts(
//     chaindId: number,
//     alertType: AlertType,
//   ): Promise<AlertsResponse> {
//     let alertId: string;
//     if (alertType.function === "supply") {
//       alertId = "SUPPLY-2";
//     } else if (alertType.function === "withdraw") {
//       alertId = "BORROW-2";
//     } else {
//       throw new Error(`Unknown function type: ${alertType.function}`);
//     }

//     return await getAlerts({
//       alertId: alertId,
//       chainId: chaindId,
//     });
//   }
// }


export default class Helper {
  private provider: ethers.providers.Provider;
  private configCache: LRUCache<string, any>;
  private utilizationCache: LRUCache<string, any>; 
  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.configCache = new LRUCache<string, any>({ max: 1000});
    this.utilizationCache = new LRUCache<string, any>({ max: 1000});
  }

  public secondsPerYear = 31536000;

  public async getAllCompoundData(tokenAddress: string, configuratorProxy: string, blockNumber: number) {
    const configuration = new ethers.Contract(
      configuratorProxy,
      CONFIGURATION_ABI,
      this.provider,
    );
    const protocolInfo = new ethers.Contract(
      tokenAddress,
      [UTILIZATION, SUPPLY_RATE, BORROW_RATE],
      this.provider,
    );
    const configurationData = await configuration.callStatic.getConfiguration(tokenAddress, {
      blockTag: blockNumber,
    });
    const utilizationData = await protocolInfo.callStatic.getUtilization({
      blockTag: blockNumber,
    });
    const supplyRate = await protocolInfo.callStatic.getSupplyRate(
      utilizationData,
      { blockTag: blockNumber },
    );
    const supplyAPR = (supplyRate / 1e18) * 100 * this.secondsPerYear;
    const borrowRate = await protocolInfo.callStatic.getBorrowRate(
      utilizationData,
      { blockTag: blockNumber },
    );
    const borrowAPR = (borrowRate / 1e18) * 100 * this.secondsPerYear;
    return {
      configurationData,
      utilizationData,
      supplyAPR,
      borrowAPR,
    };
  }
}