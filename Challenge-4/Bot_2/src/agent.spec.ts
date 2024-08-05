import { MockEthersProvider, TestTransactionEvent } from 'forta-agent-tools/lib/test';
import { ethers, HandleTransaction, TransactionEvent } from 'forta-agent';
import { provideInitialize, provideUtilization } from './agent';
import { createAddress } from 'forta-agent-tools';
import { BORROW_RATE, CONFIGURATOR_PROXY, SUPPLY, SUPPLY_RATE, USDC_TOKEN_ETH, WITHDRAW } from './constants';
import * as helper from './helper';
describe("Compound test suite for lending and borrowing", () => {
    let mockProvider = new MockEthersProvider();
    let handleTransaction: HandleTransaction;
    let txEvent: TestTransactionEvent;
    let initialize: any;
    let mockAssetTokenAddress = createAddress("0x345");
    let mockConfiguratorProxy = createAddress("0x123");
    const functions = [
        `function getConfiguration(address cometProxy) view returns (tuple(address governor, address pauseGuardian, address baseToken, address baseTokenPriceFeed, address extensionDelegate, uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, uint64 storeFrontPriceFactor, uint64 trackingIndexScale, uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves, tuple(address asset, uint8 decimals, uint256 conversionFactor)[] assetConfigs) configuration)`,
        `function getUtilization() public view returns (uint)`,
        `function getSupplyRate(uint utilization) public view returns (uint64)`,
        `function getBorrowRate(uint utilization) public view returns (uint64)`
    ]
    const Iface = new ethers.utils.Interface(functions);
    const provideInterface = new ethers.utils.Interface([SUPPLY])
 
    beforeEach(() => {
        handleTransaction = provideUtilization(mockProvider as any)
        txEvent = new TestTransactionEvent().setBlock(0);
        jest.spyOn(helper, "getAddress").mockResolvedValue(USDC_TOKEN_ETH);
        jest.spyOn(helper, "getConfigurator").mockResolvedValue(CONFIGURATOR_PROXY);
        
    })

    let setupMockProvider = async() => {
        mockProvider.setNetwork(1)
        
       mockProvider.addCallTo(CONFIGURATOR_PROXY, 0, Iface, "getConfiguration", {
            inputs: [USDC_TOKEN_ETH],
            outputs: [
            {
                governor: createAddress("0x123"),
                pauseGuardian: createAddress("0x123"),
                baseToken: createAddress("0x123"),
                baseTokenPriceFeed: createAddress("0x123"),
                extensionDelegate: createAddress("0x123"),
                supplyKink: 50,
                supplyPerYearInterestRateSlopeLow: 100,
                supplyPerYearInterestRateSlopeHigh: 200,
                supplyPerYearInterestRateBase: 300,
                borrowKink: 50,
                borrowPerYearInterestRateSlopeLow: 100,
                borrowPerYearInterestRateSlopeHigh: 200,
                borrowPerYearInterestRateBase: 300,
                storeFrontPriceFactor: 50,
                trackingIndexScale: 50,
                baseTrackingSupplySpeed: 50,
                baseTrackingBorrowSpeed: 50,
                baseMinForRewards: 50,
                baseBorrowMin: 50,
                targetReserves: 50,
                assetConfigs: [
                    {
                        asset: createAddress("0x123"),
                        decimals: 18,
                        conversionFactor: 1
                    }
                ]
            }
            ]
        })
        mockProvider.addCallTo(USDC_TOKEN_ETH, 0, Iface, "getUtilization", {
            inputs: [],
            outputs: [50]
        })
        mockProvider.addCallTo(USDC_TOKEN_ETH, 0, Iface, "getSupplyRate", {
            inputs: [50],
            outputs: [200]
        })
        mockProvider.addCallTo(USDC_TOKEN_ETH, 0, Iface, "getBorrowRate", {
            inputs: [50],
            outputs: [300]
        })
        
    }

    it("returns findings if borrower borrows when borrow kink is less that lower limit", async() => {

        setupMockProvider();

        mockProvider.setNetwork(1);
        txEvent
        .addTraces({
            function: provideInterface.getFunction("supply"),
            to: createAddress("0xc3d688B66703497DAA19211EEdff47f25384cdc3"),
            from: createAddress("0x123"),
            arguments: ["0xc3d688B66703497DAA19211EEdff47f25384cdc3", 50]
        })

        // console.log(txEvent);
        const findings = await handleTransaction(txEvent)
        
        console.log(findings);
        // setupMockProvider();
        // console.log(mockProvider);
    })

  
})