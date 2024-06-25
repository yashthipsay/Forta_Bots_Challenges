// import { Contract, ContractRunner, Provider } from "ethers";
// import { ethers } from "forta-agent";

// import { COMPUTED_INIT_CODE_HASH, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";

// export default class Retrieval {
//   private provider: ethers.providers.Provider;

//   // Constructor to initialize with an ethers provider
//   constructor(provider: ethers.providers.Provider) {
//     this.provider = provider;
//   }

//   // Computes the CREATE2 address for a Uniswap pair

//   public getUniswapPairCreate2Address(
//     factoryAddress: string,
//     token0: string,
//     token1: string,
//     fee: number,
//   ): string {
//     return ethers.utils.getCreate2Address(
//       factoryAddress,
//       ethers.utils.keccak256(
//         ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
//       ),
//       COMPUTED_INIT_CODE_HASH
//     );
//   }

//   // Validates if a given Uniswap pair address is correct by recomputing its CREATE2 address

//   public async isValidUniswapPair(
//     pairAddress: string,
//     block: number,
//     uniswapFactoryAddr: string,
//     init: string
//   ): Promise<[boolean, string, string]> {
//     // Create a contract instance for the pair

//     const pairContract = new ethers.Contract(pairAddress, UNISWAP_PAIR_ABI, this.provider);
   
//     // Fetch token addresses and fee from the contract

//     // [token0Address, token1Address, fee] = await Promise.all([
//     //   pairContract.token0({blockTag: block}),
//     //   pairContract.token1({blockTag: block}),
//     //   pairContract.fee({blockTag: block}),
//     // ]);
//     const token0Address = await pairContract.token0({blockTag: block});
//     const token1Address = await pairContract.token1({blockTag: block});
//     const fee = await pairContract.fee({blockTag: block});

//     // Compute the expected pair address using CREATE2

//     const tokenPair = this.getUniswapPairCreate2Address(
//       UNISWAP_FACTORY_ADDRESS,
//       token0Address,
//       token1Address,
//       Number(fee),
//     );
//     // Compare computed address with the provided pair address

//     const isValid = tokenPair.toLowerCase() === pairAddress.toLowerCase() ? true : false;

//     return [isValid, token0Address.toLowerCase(), token1Address.toLowerCase()];
//   }
// }



import { ethers } from "forta-agent";
import { BigNumber } from "@ethersproject/bignumber";
import { IUNISWAPV3FACTORY, UNISWAPV3FACTORY_ADDRESS, POOL_INIT_CODE_HASH } from "./utils";

//Create a custom type that to store the pool values
export type poolValues = {
  token0: string;
  token1: string;
  fee: number | BigNumber;
};



export const getUniswapPoolValues = async (
  poolAddress: string,
  IUNISWAPV3POOL: string[],
  provider: ethers.providers.Provider,
  blockNumber: number
): Promise<poolValues> => {
 
  //If we have called this function before with the same pool address, it
  //should have the vals in cache so we can return them and skip everything else
  const key: string = poolAddress;

  const uniswap_pool = new ethers.Contract(poolAddress, IUNISWAPV3POOL, provider);
  let token0 = await uniswap_pool.token0({ blockTag: blockNumber });
  let token1 = await uniswap_pool.token1({ blockTag: blockNumber });
  let fee = await uniswap_pool.fee({ blockTag: blockNumber });
  // Store vals in cache so we don't repeat the same calls

  return { token0, token1, fee } as poolValues;
};


export const getUniswapCreate2Address = (poolVal: poolValues, factoryContract: ethers.Contract) => {
  return ethers.utils.getCreate2Address(
    factoryContract.address,
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint24"],
        [poolVal.token0, poolVal.token1, poolVal.fee]
      )
    ),
    POOL_INIT_CODE_HASH
  );
};

//alternative method to confirm the pool address
//less gas effecient
/*
export const getPoolAddress = async (
  poolVal: poolValues,
  factoryContract: Contract,
  blockNumber: number
): Promise<string> => {
  const poolAddress = await factoryContract.getPool(poolVal.token0, poolVal.token1, poolVal.fee, {
    blockTag: blockNumber,
  });

  return poolAddress;
};
*/