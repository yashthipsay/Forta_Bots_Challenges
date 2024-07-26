import { ethers } from "forta-agent";
import { BigNumber } from "@ethersproject/bignumber";
import { POOL_INIT_CODE_HASH } from "./utils";

export type PoolValues = {
  token0: string; // address of token0
  token1: string; // address of token1
  fee: number | BigNumber; // fee value
};

export const getUniswapPoolValues = async (
  poolAddress: string, // address of the Uniswap pool
  IUNISWAPV3POOL: string[], // array of Uniswap pool interfaces
  provider: ethers.providers.Provider, // Ethereum provider
  blockNumber: number // block number
): Promise<PoolValues> => {
  const cacheKey: string = poolAddress; // cache key for the pool address

  const uniswapPool = new ethers.Contract(poolAddress, IUNISWAPV3POOL, provider); // create Uniswap pool contract instance
  let token0 = await uniswapPool.token0({ blockTag: blockNumber }); // get token0 address
  let token1 = await uniswapPool.token1({ blockTag: blockNumber }); // get token1 address
  let fee = await uniswapPool.fee({ blockTag: blockNumber }); // get fee value

  return { token0, token1, fee } as PoolValues; // return pool values
};

export const getUniswapCreate2Address = (poolValues: PoolValues, factoryContract: ethers.Contract) => {
  return ethers.utils.getCreate2Address(
    factoryContract.address,
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint24"],
        [poolValues.token0, poolValues.token1, poolValues.fee]
      )
    ),
    POOL_INIT_CODE_HASH
  );
};
