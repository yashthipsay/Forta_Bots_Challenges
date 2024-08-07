import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { ethers } from "forta-agent";
import Helper from "./helper";
import { createAddress } from "forta-agent-tools";

const mockAbi = [
  "function getConfiguration(address cometProxy) view returns (tuple(address governor, address pauseGuardian, address baseToken, address baseTokenPriceFeed, address extensionDelegate, uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, uint64 storeFrontPriceFactor, uint64 trackingIndexScale, uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves, tuple(address asset, uint8 decimals, uint256 conversionFactor)[] assetConfigs) configuration)",
  "function getUtilization() public view returns (uint)",
  "function getSupplyRate(uint utilization) public view returns (uint64)",
  "function getBorrowRate(uint utilization) public view returns (uint64)",
];

describe("Helper class test suite", () => {
  let mockProvider: MockEthersProvider;
  let Iface: ethers.utils.Interface = new ethers.utils.Interface(mockAbi);
  let helper: Helper;
  const usdcTokenAddress = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";
  let mockConfigProxy = "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3";
  beforeEach(() => {
    mockProvider = new MockEthersProvider() as any;
    helper = new Helper(mockProvider as any);
  });

  it("should return correct configuration data", async () => {
    mockProvider.setNetwork(1);
    mockProvider.addCallTo(mockConfigProxy, 0, Iface, "getConfiguration", {
      inputs: [mockConfigProxy],
      outputs: [
        {
          governor: createAddress("0x123"),
          pauseGuardian: createAddress("0x123"),
          baseToken: createAddress("0x123"),
          baseTokenPriceFeed: createAddress("0x123"),
          extensionDelegate: createAddress("0x223"),
          supplyKink: ethers.BigNumber.from(5000),
          supplyPerYearInterestRateSlopeLow: ethers.BigNumber.from(60),
          supplyPerYearInterestRateSlopeHigh: ethers.BigNumber.from(100),
          supplyPerYearInterestRateBase: ethers.BigNumber.from(900),
          borrowKink: ethers.BigNumber.from(4000),
          borrowPerYearInterestRateSlopeLow: ethers.BigNumber.from(100),
          borrowPerYearInterestRateSlopeHigh: ethers.BigNumber.from(200),
          borrowPerYearInterestRateBase: ethers.BigNumber.from(300),
          storeFrontPriceFactor: ethers.BigNumber.from(50),
          trackingIndexScale: ethers.BigNumber.from(50),
          baseTrackingSupplySpeed: ethers.BigNumber.from(50),
          baseTrackingBorrowSpeed: ethers.BigNumber.from(50),
          baseMinForRewards: ethers.BigNumber.from(50),
          baseBorrowMin: ethers.BigNumber.from(50),
          targetReserves: ethers.BigNumber.from(50),
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

    const getConfig = await helper.gettConfiguration(
      mockConfigProxy,
      0,
    );
    const expectedConfig = [
      createAddress("0x123"),
      createAddress("0x123"),
      createAddress("0x123"),
      createAddress("0x123"),
      createAddress("0x223"),
      ethers.BigNumber.from(5000).toString(),
      ethers.BigNumber.from(60).toString(),
      ethers.BigNumber.from(100).toString(),
      ethers.BigNumber.from(900).toString(),
      ethers.BigNumber.from(4000).toString(),
      ethers.BigNumber.from(100).toString(),
      ethers.BigNumber.from(200).toString(),
      ethers.BigNumber.from(300).toString(),
      ethers.BigNumber.from(50).toString(),
      ethers.BigNumber.from(50).toString(),
      ethers.BigNumber.from(50).toString(),
      ethers.BigNumber.from(50).toString(),
      ethers.BigNumber.from(50).toString(),
      ethers.BigNumber.from(50).toString(),
      ethers.BigNumber.from(50).toString(),
      [[usdcTokenAddress, 18, ethers.BigNumber.from(1)]],
    ];

    const getConfigStringified = getConfig.map((item: any) => {
      if (Array.isArray(item)) {
        return item.map((subItem) =>
          ethers.BigNumber.isBigNumber(subItem) ? subItem.toString() : subItem,
        );
      }
      return ethers.BigNumber.isBigNumber(item) ? item.toString() : item;
    });

    expect(JSON.stringify(getConfigStringified)).toBe(
      JSON.stringify(expectedConfig),
    );
  });

  it("should return correct utilization data", async () => {
    mockProvider.addCallTo(usdcTokenAddress, 0, Iface, "getUtilization", {
      inputs: [],
      outputs: [ethers.BigNumber.from(5000)],
    });
    const getUtilization = await helper.getUtilization(
      usdcTokenAddress,
      "function getUtilization() public view returns (uint)",
      0,
    );
    expect(getUtilization.toString()).toBe(
      ethers.BigNumber.from(5000).toString(),
    );
  });

  it("should return correct supply APR", async () => {
    mockProvider.addCallTo(usdcTokenAddress, 0, Iface, "getSupplyRate", {
      inputs: [ethers.BigNumber.from(5000)],
      outputs: [ethers.BigNumber.from(500000000)],
    });

    const getSupplyAPR = await helper.getSupplyAPR(
      usdcTokenAddress,
      "function getSupplyRate(uint utilization) public view returns (uint64)",
      ethers.BigNumber.from(5000),
      0,
    );
    const expectedSupplyAPR = (500000000 / 1e18) * 100 * 31536000;
    expect(getSupplyAPR).toBe(expectedSupplyAPR);
  });

  it("should return correct borrow APR", async () => {
    mockProvider.addCallTo(usdcTokenAddress, 0, Iface, "getBorrowRate", {
      inputs: [ethers.BigNumber.from(5000)],
      outputs: [ethers.BigNumber.from(500000000)],
    });

    const getBorrowAPR = await helper.getBorrowAPR(
      usdcTokenAddress,
      "function getBorrowRate(uint utilization) public view returns (uint64)",
      ethers.BigNumber.from(5000),
      0,
    );
    const expectedBorrowAPR = (500000000 / 1e18) * 100 * 31536000;
    expect(getBorrowAPR).toBe(expectedBorrowAPR);
  });
});
