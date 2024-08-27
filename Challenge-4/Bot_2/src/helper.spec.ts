import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { ethers } from "forta-agent";
import Helper from "./helper";
import { createAddress } from "forta-agent-tools";

const mockAbi = [
  `function getConfiguration(address cometProxy) view returns (tuple(address governor, address pauseGuardian, 
  address baseToken, address baseTokenPriceFeed, address extensionDelegate, 
  uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, 
  uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, 
  uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, 
  uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, 
  uint64 storeFrontPriceFactor, uint64 trackingIndexScale, 
  uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, 
  uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves, 
  tuple(address asset, uint8 decimals, uint256 conversionFactor)[] assetConfigs) configuration)`,
  "function getUtilization() public view returns (uint)",
  "function getSupplyRate(uint utilization) public view returns (uint64)",
  "function getBorrowRate(uint utilization) public view returns (uint64)",
];

// Declare mock values at the global scope
const mockGovernor = createAddress("0x123");
const mockPauseGuardian = createAddress("0x123");
const mockBaseToken = createAddress("0x123");
const mockBaseTokenPriceFeed = createAddress("0x123");
const mockExtensionDelegate = createAddress("0x223");
const mockSupplyKink = ethers.BigNumber.from(5000);
const mockSupplyPerYearInterestRateSlopeLow = ethers.BigNumber.from(60);
const mockSupplyPerYearInterestRateSlopeHigh = ethers.BigNumber.from(100);
const mockSupplyPerYearInterestRateBase = ethers.BigNumber.from(900);
const mockBorrowKink = ethers.BigNumber.from(4000);
const mockBorrowPerYearInterestRateSlopeLow = ethers.BigNumber.from(100);
const mockBorrowPerYearInterestRateSlopeHigh = ethers.BigNumber.from(200);
const mockBorrowPerYearInterestRateBase = ethers.BigNumber.from(300);
const mockStoreFrontPriceFactor = ethers.BigNumber.from(50);
const mockTrackingIndexScale = ethers.BigNumber.from(50);
const mockBaseTrackingSupplySpeed = ethers.BigNumber.from(50);
const mockBaseTrackingBorrowSpeed = ethers.BigNumber.from(50);
const mockBaseMinForRewards = ethers.BigNumber.from(50);
const mockBaseBorrowMin = ethers.BigNumber.from(50);
const mockTargetReserves = ethers.BigNumber.from(50);

describe("Helper class test suite", () => {
  let mockProvider: MockEthersProvider;
  let Iface: ethers.utils.Interface = new ethers.utils.Interface(mockAbi);
  let helper: Helper;
  const usdcTokenAddress = createAddress("0x1423");
  let mockConfigProxyAddress = createAddress("0x1765");

  beforeEach(() => {
    mockProvider = new MockEthersProvider() as any;
    const mockConfigurationContract = new ethers.Contract(
      mockConfigProxyAddress,
      mockAbi,
      mockProvider as any,
    );
    const mockProtocolInfoContract = new ethers.Contract(
      usdcTokenAddress,
      mockAbi.slice(1),
      mockProvider as any,
    );
    helper = new Helper(mockConfigurationContract, mockProtocolInfoContract);
  });

  it("should return correct configuration data", async () => {
    mockProvider.setNetwork(1);
    mockProvider.addCallTo(mockConfigProxyAddress, 0, Iface, "getConfiguration", {
      inputs: [usdcTokenAddress],
      outputs: [
        {
          governor: mockGovernor,
          pauseGuardian: mockPauseGuardian,
          baseToken: mockBaseToken,
          baseTokenPriceFeed: mockBaseTokenPriceFeed,
          extensionDelegate: mockExtensionDelegate,
          supplyKink: mockSupplyKink,
          supplyPerYearInterestRateSlopeLow: mockSupplyPerYearInterestRateSlopeLow,
          supplyPerYearInterestRateSlopeHigh: mockSupplyPerYearInterestRateSlopeHigh,
          supplyPerYearInterestRateBase: mockSupplyPerYearInterestRateBase,
          borrowKink: mockBorrowKink,
          borrowPerYearInterestRateSlopeLow: mockBorrowPerYearInterestRateSlopeLow,
          borrowPerYearInterestRateSlopeHigh: mockBorrowPerYearInterestRateSlopeHigh,
          borrowPerYearInterestRateBase: mockBorrowPerYearInterestRateBase,
          storeFrontPriceFactor: mockStoreFrontPriceFactor,
          trackingIndexScale: mockTrackingIndexScale,
          baseTrackingSupplySpeed: mockBaseTrackingSupplySpeed,
          baseTrackingBorrowSpeed: mockBaseTrackingBorrowSpeed,
          baseMinForRewards: mockBaseMinForRewards,
          baseBorrowMin: mockBaseBorrowMin,
          targetReserves: mockTargetReserves,
          assetConfigs: [
            {
              asset: usdcTokenAddress,
              decimals: 18,
              conversionFactor: ethers.BigNumber.from(1),
            },
          ],
        },
      ],
    });
    mockProvider.addCallTo(usdcTokenAddress, 0, Iface, "getUtilization", {
      inputs: [],
      outputs: [ethers.BigNumber.from(5000)],
    });
    mockProvider.addCallTo(usdcTokenAddress, 0, Iface, "getSupplyRate", {
      inputs: [ethers.BigNumber.from(5000)],
      outputs: [ethers.BigNumber.from(500000000)],
    });
    mockProvider.addCallTo(usdcTokenAddress, 0, Iface, "getBorrowRate", {
      inputs: [ethers.BigNumber.from(5000)],
      outputs: [ethers.BigNumber.from(400000000)],
    });

    const getConfig: any = await helper.getAllCompoundData(
      usdcTokenAddress,
      mockConfigProxyAddress,
      0,
    );

    const expectedConfig = [
      mockGovernor,
      mockPauseGuardian,
      mockBaseToken,
      mockBaseTokenPriceFeed,
      mockExtensionDelegate,
      mockSupplyKink.toString(),
      mockSupplyPerYearInterestRateSlopeLow.toString(),
      mockSupplyPerYearInterestRateSlopeHigh.toString(),
      mockSupplyPerYearInterestRateBase.toString(),
      mockBorrowKink.toString(),
      mockBorrowPerYearInterestRateSlopeLow.toString(),
      mockBorrowPerYearInterestRateSlopeHigh.toString(),
      mockBorrowPerYearInterestRateBase.toString(),
      mockStoreFrontPriceFactor.toString(),
      mockTrackingIndexScale.toString(),
      mockBaseTrackingSupplySpeed.toString(),
      mockBaseTrackingBorrowSpeed.toString(),
      mockBaseMinForRewards.toString(),
      mockBaseBorrowMin.toString(),
      mockTargetReserves.toString(),
      [[usdcTokenAddress, 18, ethers.BigNumber.from(1)]],
    ];

    const stringifiedConfigDataStringField = JSON.stringify(
      getConfig.configurationData.map((item: any) => {
        if (Array.isArray(item)) {
          return item.map((subItem) =>
            ethers.BigNumber.isBigNumber(subItem)
              ? subItem.toString()
              : subItem,
          );
        }
        return ethers.BigNumber.isBigNumber(item) ? item.toString() : item;
      }),
    );

    const stringifiedExpectedConfigStringField = JSON.stringify(
      expectedConfig.map((item: any) => {
        if (Array.isArray(item)) {
          return item.map((subItem) =>
            ethers.BigNumber.isBigNumber(subItem)
              ? subItem.toString()
              : subItem,
          );
        }
        return ethers.BigNumber.isBigNumber(item) ? item.toString() : item;
      }),
    );

    const expectedSupplyAPR = (500000000 / 1e18) * 100 * 31536000;
    const expectedBorrowAPR = (400000000 / 1e18) * 100 * 31536000;
    const expectedUtilization = ethers.BigNumber.from(5000).toString();

    expect(stringifiedConfigDataStringField).toBe(
      stringifiedExpectedConfigStringField,
    );
    expect(getConfig.supplyAPR).toBe(expectedSupplyAPR);
    expect(getConfig.borrowAPR).toBe(expectedBorrowAPR);
    expect(getConfig.utilizationData.toString()).toBe(expectedUtilization);
  });
});
