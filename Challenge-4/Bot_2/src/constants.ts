export const CONFIGURATION_ABI = [
  "function getConfiguration(address cometProxy) view returns (tuple(address governor, address pauseGuardian, address baseToken, address baseTokenPriceFeed, address extensionDelegate, uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, uint64 storeFrontPriceFactor, uint64 trackingIndexScale, uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves, tuple(address asset, uint8 decimals, uint256 conversionFactor)[] assetConfigs) configuration)",
];
//                                                                              1                   2                       3                 4                             5                         6                 7                                           8                                              9                                10                 11
export const COMET_FACTORY = "0xa7F7De6cCad4D83d81676717053883337aC2c1b4";

export const CONFIGURATOR_PROXY = "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3";

export const CONFIGURATOR_PROXY_ARB =
  "0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775";

export const CONFIGURATOR = "0xcFC1fA6b7ca982176529899D99af6473aD80DF4F";

export const USDC_TOKEN_ETH = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";

export const USDC_TOKEN_ARB = "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf";

export const COMET_PROXY = "0x1EC63B5883C3481134FD50D5DAebc83Ecd2E8779";

export const UTILIZATION =
  "function getUtilization() public view returns (uint)";

export const SUPPLY_RATE =
  "function getSupplyRate(uint utilization) public view returns (uint64)";

export const BORROW_RATE =
  "function getBorrowRate(uint utilization) public view returns (uint64)";

export const TOKEN_ADDRESSES: { [key: string]: string } = {
  USDC: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
  WETH: "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
  USDT: "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840",
};

export const WITHDRAW = "function withdraw(address asset, uint amount)";
export const SUPPLY = "function supply(address asset, uint amount)";
