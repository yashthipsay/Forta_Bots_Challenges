import { ethers, HandleTransaction } from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { MockEthersProvider } from "forta-agent-tools/lib/test";
import Helper from "./helper";

describe("Helper test suite", () => {
  /**
   * Retrieves information about an asset.
   *
   * @param i - The index of the asset.
   * @returns An object containing various information about the asset, including offset, asset address, price feed address, scale, borrow collateral factor, liquidate collateral factor, liquidation factor, and supply cap.
   */
  let mockProvider: MockEthersProvider;
  let provider: ethers.providers.Provider;
  const assetInfo = [
    `function getAssetInfo(uint8 i) public view returns (uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap)`,
  ];
  let Iface: ethers.utils.Interface = new ethers.utils.Interface(assetInfo);
  let getCollateralName = new ethers.utils.Interface([
    "function name() view returns (string)",
  ]);
  let helper: Helper;

  const mockAssetTokenAddress = createAddress("0x10957");
  beforeEach(() => {
    mockProvider = new MockEthersProvider() as any;
    provider = mockProvider as unknown as ethers.providers.Provider;

    helper = new Helper(provider);
  });
  it("should return correct assetInformation for a token", async () => {
    let collateralAddresses = [
      createAddress("0x1247"),
      createAddress("0x12567"),
      createAddress("0x1289"),
      createAddress("0x1290"),
    ];

    mockProvider.setNetwork(1);
    collateralAddresses.forEach((address, index) => {
      mockProvider.addCallTo(mockAssetTokenAddress, 0, Iface, "getAssetInfo", {
        inputs: [index],
        outputs: [
          index,
          address,
          createAddress("0x234"),
          4,
          12,
          134,
          1245,
          1265,
        ],
      });

      mockProvider.addCallTo(address, 0, getCollateralName, "name", {
        inputs: [],
        outputs: [`Collateral-${index + 1}`],
      });
    });

    const asset = await helper.getCollateralAssets(
      mockAssetTokenAddress,
      assetInfo,
      0,
    );
    expect(asset).toEqual({
      "Collateral Asset - Collateral-1": `${createAddress("0x1247")}`,
      "Collateral Asset - Collateral-2": `${createAddress("0x12567")}`,
      "Collateral Asset - Collateral-3": `${createAddress("0x1289")}`,
      "Collateral Asset - Collateral-4": `${createAddress("0x1290")}`,
    });
  });
});
