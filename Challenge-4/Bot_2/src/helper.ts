import { ethers } from "forta-agent";
import { LRUCache } from "lru-cache";
import { secondsPerYear } from "./constants";

export default class Helper {
  private compoundDataCache: LRUCache<string, any>;
  private configurationContract: ethers.Contract;
  private protocolInfoContract: ethers.Contract;

  constructor(
    configurationContract: ethers.Contract,
    protocolInfoContract: ethers.Contract,
  ) {
    this.compoundDataCache = new LRUCache<string, any>({ max: 1000 });
    this.configurationContract = configurationContract;
    this.protocolInfoContract = protocolInfoContract;
  }

  public async getAllCompoundData(
    tokenAddress: string,
    configuratorProxy: string,
    blockNumber: number,
  ) {
    const key = `${tokenAddress}-${configuratorProxy}-${blockNumber}`;

    if (this.compoundDataCache.has(key)) {
      return this.compoundDataCache.get(key);
    }

    const configurationData =
      await this.configurationContract.callStatic.getConfiguration(
        tokenAddress,
        {
          blockTag: blockNumber,
        },
      );

    const utilizationData =
      await this.protocolInfoContract.callStatic.getUtilization({
        blockTag: blockNumber,
      });

    const supplyRate = await this.protocolInfoContract.callStatic.getSupplyRate(
      utilizationData,
      { blockTag: blockNumber },
    );

    const supplyAPR = (supplyRate / 1e18) * 100 * secondsPerYear;

    const borrowRate = await this.protocolInfoContract.callStatic.getBorrowRate(
      utilizationData,
      { blockTag: blockNumber },
    );

    const borrowAPR = (borrowRate / 1e18) * 100 * secondsPerYear;

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
