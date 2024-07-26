export const CONFIGURATOR = "0xcFC1fA6b7ca982176529899D99af6473aD80DF4F";

export const CONFIGURATOR_PROXY = "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3";

export const USDC_TOKEN = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";

export const COMET_FACTORY = "0xa7F7De6cCad4D83d81676717053883337aC2c1b4";

export const BORROW_KINK =
  "event SetBorrowKink(address indexed cometProxy,uint64 oldKink, uint64 newKink)";

export const UTILIZATION =
  "function getUtilization() public view returns (uint)";

export const SUPPLY_KINK =
  "event SetSupplyKink(address indexed cometProxy,uint64 oldKink, uint64 newKink)";

export const SET_GOVERNOR =
  "event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)";

export const BORROW_PYIR =
  "event SetBorrowPerYearInterestRateBase(address indexed cometProxy,uint64 oldIRBase, uint64 newIRBase)";

export const SUPPLY_PYIR =
  "event SetSupplyPerYearInterestRateBase(address indexed cometProxy,uint64 oldIRBase, uint64 newIRBase)";

export const BORROW_CF =
  "event UpdateAssetBorrowCollateralFactor(address indexed cometProxy, address indexed asset, uint64 oldBorrowCF, uint64 newBorrowCF)";

export const LIQUIDATE_CF =
  "event UpdateAssetLiquidateCollateralFactor(address indexed cometProxy, address indexed asset, uint64 oldLiquidateCF, uint64 newLiquidateCF)";

export const ASSET_INFO = [
  `function getAssetInfo(uint8 i) public view returns (uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap)`,
];

export const RESERVES = "function getReserves() public view returns (int)";

export const CONFIGURATION_ABI = [
  "function getConfiguration(address cometProxy) external view returns (address governor, address pauseGuardian, address baseToken, address baseTokenPriceFeed, address extensionDelegate, uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, uint64 storeFrontPriceFactor, uint64 trackingIndexScale, uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves, (address asset, address priceFeed, uint8 decimals, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap)[] assetConfigs)",
];
