
export const UNISWAP_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";


export const UNISWAP_FACTORY_ABI = [
  `function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)`,
  `event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)`,
];


export const UNISWAP_PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() public view returns (uint24)",
];


export const COMPUTED_INIT_CODE_HASH = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";


export const SWAP_EVENT = [
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
];
