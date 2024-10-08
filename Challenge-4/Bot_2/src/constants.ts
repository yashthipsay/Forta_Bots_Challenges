import { ethers } from "forta-agent";
import { BotConfig } from "./types";

export const CONFIGURATION_ABI = [
  `function getConfiguration(address cometProxy) view returns (
   tuple(
    address governor, 
    address pauseGuardian, 
    address baseToken, 
    address baseTokenPriceFeed, 
    address extensionDelegate, 
    uint64 supplyKink, 
    uint64 supplyPerYearInterestRateSlopeLow, 
    uint64 supplyPerYearInterestRateSlopeHigh, 
    uint64 supplyPerYearInterestRateBase, 
    uint64 borrowKink, 
    uint64 borrowPerYearInterestRateSlopeLow, 
    uint64 borrowPerYearInterestRateSlopeHigh, 
    uint64 borrowPerYearInterestRateBase, 
    uint64 storeFrontPriceFactor, 
    uint64 trackingIndexScale, 
    uint64 baseTrackingSupplySpeed, 
    uint64 baseTrackingBorrowSpeed, 
    uint104 baseMinForRewards, 
    uint104 baseBorrowMin, 
    uint104 targetReserves, 
    tuple(
      address asset, 
      uint8 decimals, 
      uint256 conversionFactor
         )[] assetConfigs
      ) configuration)`,
];

export const COMET_FACTORY = "0xa7F7De6cCad4D83d81676717053883337aC2c1b4";

export const CONFIGURATOR_PROXY_ETH =
  "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3";

export const CONFIGURATOR_PROXY_POLYGON =
  "0x83E0F742cAcBE66349E3701B171eE2487a26e738";

export const CONFIGURATOR = "0xcFC1fA6b7ca982176529899D99af6473aD80DF4F";

export const cUSDC_TOKEN_ETH = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";

export const cUSDC_TOKEN_POLYGON = "0xF25212E676D1F7F89Cd72fFEe66158f541246445";

export const COMET_PROXY = "0x1EC63B5883C3481134FD50D5DAebc83Ecd2E8779";

export const UTILIZATION =
  "function getUtilization() public view returns (uint)";

export const SUPPLY_RATE =
  "function getSupplyRate(uint utilization) public view returns (uint64)";

export const BORROW_RATE =
  "function getBorrowRate(uint utilization) public view returns (uint64)";

export const WITHDRAW = "function withdraw(address asset, uint amount)";
export const SUPPLY = "function supply(address asset, uint amount)";

export const CONFIG: BotConfig = {
  1: {
    usdc: cUSDC_TOKEN_ETH,
    configurationProxy: CONFIGURATOR_PROXY_ETH,
  },
  137: {
    usdc: cUSDC_TOKEN_POLYGON,
    configurationProxy: CONFIGURATOR_PROXY_POLYGON,
  },
};

export const upperLimitByPercentage = ethers.BigNumber.from(90).mul(
  ethers.BigNumber.from(10).pow(16),
);

export const lowerLimitByPercentage = ethers.BigNumber.from(30).mul(
  ethers.BigNumber.from(10).pow(16),
);

export const secondsPerYear = 60 * 60 * 24 * 365;
