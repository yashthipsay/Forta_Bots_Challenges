import {
  BORROW_RATE,
  CONFIGURATION_ABI,
  SUPPLY_RATE,
  UTILIZATION,
} from "./constants";
import { ethers } from "forta-agent";
import { LRUCache } from "lru-cache";

export default class Helper {
  private provider: ethers.providers.Provider;
  private compoundDataCache: LRUCache<string, any>;
  
  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.compoundDataCache = new LRUCache<string, any>({ max: 1000 });
  }

  public secondsPerYear = 31536000;

  public async getAllCompoundData(
    tokenAddress: string,
    configuratorProxy: string,
    blockNumber: number,
  ) {
    const key =  `${tokenAddress}-${configuratorProxy}-${blockNumber}`;
    if (this.compoundDataCache.has(key)) {
      return this.compoundDataCache.get(key);
    }
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
    const configurationData = await configuration.callStatic.getConfiguration(
      tokenAddress,
      {
        blockTag: blockNumber,
      },
    );
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
    this.compoundDataCache.set(key, {
      configurationData,
      utilizationData,
      supplyAPR,
      borrowAPR,
    });
    return {
      configurationData,
      utilizationData,
      supplyAPR,
      borrowAPR,
    };
  }
}
