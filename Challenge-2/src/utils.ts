import {bytecode} from "./UniswapBytecode.json";
import { keccak256 } from "@ethersproject/solidity";

export const UNISWAP_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

export const UNISWAP_FACTORY_ABI = [`function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)`, 
  
  `event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)`]

export  const UNISWAP_PAIR_ABI = [
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
  ];

export const COMPUTED_INIT_CODE_HASH = keccak256(['bytes'], [`0x${bytecode}`])
  