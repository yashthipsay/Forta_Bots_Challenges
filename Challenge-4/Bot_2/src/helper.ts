import {
  BORROW_RATE,
  CONFIGURATION_ABI,
  SUPPLY_RATE,
  UTILIZATION,
} from "./constants";
import { ethers} from "forta-agent";
import {LRUCache} from "lru-cache";


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