import { TestTransactionEvent, MockEthersProvider } from 'forta-agent-tools/lib/test';
import { provideHandleGovernanceTransaction } from './agent';
import {ethers, Finding, FindingSeverity, FindingType, HandleTransaction} from 'forta-agent' 
import { ASSET_INFO, CONFIGURATOR_PROXY, USDC_TOKEN } from './constants';
import { createAddress } from 'forta-agent-tools';
import * as helpers from './helper';

jest.mock('./helper');

const mockedGetCollateralAsset = helpers.getCollateralAsset as jest.MockedFn<typeof helpers.getCollateralAsset>;

let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(ASSET_INFO);
let getCollateralName = new ethers.utils.Interface(["function name() view returns (string)"])


describe("Compound test suite", () => {
    let txEvent: TestTransactionEvent;

    const mockArgs = [
        createAddress("0x1421"),
        createAddress("0x123"),
        createAddress("0x234"),
    ]

    const obj = [{
        args: [
            ...mockArgs
        ]
    }]

    // const setGovernor = (

    // ): [string, string ,string] => {
    //     const data  = ethers.utils.defaultAbiCoder.encode(
    //         ["address", "address", "address"],
    //         mockArgs
    //     );

    //     const senderTopic = "0xDD659911EcBD4458db07Ee7cDdeC79bf8F859AbC";
    //     const to = "0xc0Da02939E1441F497fd74F78cE7Decb17B66529";

    //     return ["setGovernor(address,address,address)", CONFIGURATOR_PROXY, data];
    // }
    let mockProvider: MockEthersProvider;
  let provider: ethers.providers.Provider;
    beforeAll(() => {
    })

    beforeEach(async () => {
        
        mockProvider = new MockEthersProvider() as any;
    provider = mockProvider as unknown as ethers.providers.Provider;
    handleTransaction = provideHandleGovernanceTransaction(USDC_TOKEN, CONFIGURATOR_PROXY, provider);
        mockedGetCollateralAsset.mockImplementation(async(assetToken: string, abi: string[], provider: ethers.providers.Provider, blockNumber: number) => {
            return {
                "Collateral Asset - Mock Collateral Name": createAddress("0x123")
            };
        })
    })

    it("should return a finding", async() => {
        jest.clearAllMocks();
        mockProvider.setNetwork(1)
        mockProvider.addCallTo(USDC_TOKEN, 0, Iface, "getAssetInfo", {
            inputs: [0],
            outputs: [0, createAddress("0x123"), createAddress("0x234"), 4, 12, 134, 1245, 1265 ]
        });
        mockProvider.addCallTo(createAddress("0x123"), 0, getCollateralName, "name", {
            inputs: [],
            outputs: ["Collateral-1"]
        });

        const mockValueForName = 'Mock Collateral Name';
        // Use the mockImplementation or mockResolvedValue to mock the function
        txEvent = new TestTransactionEvent()

        txEvent.setBlock(0)
        .addEventLog(
            "event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)",
            CONFIGURATOR_PROXY,
            [...mockArgs]
        )


        const findings = await handleTransaction(txEvent);
        console.log(findings);
    })
})