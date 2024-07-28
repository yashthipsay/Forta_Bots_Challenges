import { ethers, HandleTransaction } from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { provideHandleGovernanceTransaction } from "./agent";
import { ASSET_INFO, CONFIGURATOR_PROXY } from "./constants";
import { getCollateralAsset } from "./helper";

let handleTransaction: HandleTransaction;
describe("Helper test suite", () => {
  let mockProvider: MockEthersProvider;
  let provider: ethers.providers.Provider;
  let Iface: ethers.utils.Interface = new ethers.utils.Interface(ASSET_INFO);
  let getCollateralName = new ethers.utils.Interface([
    "function name() view returns (string)",
  ]);

  const mockAssetTokenAddress = createAddress("0x10957");
  beforeEach(() => {
    mockProvider = new MockEthersProvider() as any;
    provider = mockProvider as unknown as ethers.providers.Provider;
    handleTransaction = provideHandleGovernanceTransaction(
      provider,
      ASSET_INFO,
    );
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

    const asset = await getCollateralAsset(
      mockAssetTokenAddress,
      ASSET_INFO,
      mockProvider as any,
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
