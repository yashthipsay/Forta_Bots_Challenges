import { Interface } from "ethers/lib/utils";


export const CONFIGURATOR_PROXY = "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3";

export const CONFIGURATOR_PROXY_ARB =
  "0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775";

export const USDC_TOKEN_ETH = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";

export const USDC_TOKEN_ARB = "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf";

export const COMET_FACTORY = "0xa7F7De6cCad4D83d81676717053883337aC2c1b4";

export const BORROW_KINK =
  "event SetBorrowKink(address indexed cometProxy,uint64 oldKink, uint64 newKink)";

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

