import {MockEthersProvider} from "forta-agent-tools/lib/test";
import {ethers, HandleBlock, createBlockEvent, getChainId} from "forta-agent";
import { provideHandleBlock } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import {Interface} from "ethers/lib/utils";
import { ESCROW_ABI, OPT_ESCROW_ADDRESS, ABT_ESCROW_ADDRESS, L2_ABI, DAI_ADDRESS, DAI_L2_ADDRESS } from "./constants";
import { createFinding, createL1OptFinding } from "./findings";
import { getAlerts, AlertsResponse } from "forta-agent";



const TEST_VAL1 = {
    OPT_ESCROW_ADDRESS: OPT_ESCROW_ADDRESS,
    OPT_ESCROW_VALUE: BigNumber.from("100"),
    ABT_ESCROW_ADDRESS: ABT_ESCROW_ADDRESS,
    ABT_ESCROW_VALUE: BigNumber.from("400"),
    OPT_L2_BAL: BigNumber.from("500"),
    ABT_L2_BAL: BigNumber.from("600"),
    BOT_ID: "0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612",
}

const TEST_VAL2 = {
    OPT_ESCROW_ADDRESS: OPT_ESCROW_ADDRESS,
    OPT_ESCROW_VALUE: BigNumber.from("500"),
    ABT_ESCROW_ADDRESS: ABT_ESCROW_ADDRESS,
    ABT_ESCROW_VALUE: BigNumber.from("400"),
    OPT_L2_BAL: BigNumber.from("100"),
    ABT_L2_BAL: BigNumber.from("100"),
}

const mockAlertResponse = {
    alerts: [
        {
        metadata: {
            OptEscrBal: TEST_VAL1.OPT_ESCROW_VALUE,
            AbtEscrBal: TEST_VAL1.ABT_ESCROW_VALUE
        },
    },
    ],

    pageInfo: {
        hasNextPage: false,
        endCursor: {
            alertId: "L1 Escrow Supply",
            blockNumber: 10,
        },
    }
};

const mockGetAlerts = jest.fn();

const L1_IFACE = new ethers.utils.Interface([ESCROW_ABI]);
const L2_IFACE = new ethers.utils.Interface([L2_ABI]);

const MakeMockCall = (
    mockProvider: MockEthersProvider,
    id: string,
    inp: any[],
    outp: any[],
    addr: string,
    intface: Interface,
    block: number
) => {
    mockProvider.addCallTo(addr, block, intface, id, {
        inputs: inp,
        outputs: outp
    });
};


describe("Dai bridge 11-12 solvency check", () => {
    let handleBlock: HandleBlock;
    let mockProvider: MockEthersProvider;
    let provider: ethers.providers.Provider;

    beforeEach(() => {
        mockProvider = new MockEthersProvider();
        provider = mockProvider as unknown as ethers.providers.Provider;
        handleBlock = provideHandleBlock(provider, mockGetAlerts);
    });


    it("returns no finding if the optimism layer 2 dai supply is less than the layer 1 escrow dai balance", async() => {
        const blockEvent = createBlockEvent({
            block: {
                hash: "0xa",
                number: 10
            } as any,
        });
    
        mockProvider.addCallTo(DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
            inputs: [],
            outputs: [TEST_VAL1.OPT_ESCROW_VALUE]
        });
    
      
    
        mockProvider.setNetwork(10);

        // Pass in AlertQueryOptions
        const findings = await handleBlock(blockEvent);
    
    
        expect(findings.length).toEqual(0);
        expect(findings).toStrictEqual([]);
    });

    it("returns a findings for layer one escrows when on the eth network", async () => {
        const blockEvent = createBlockEvent({
            block: { hash: "0xa", number: 10 } as any 
        });
        mockProvider.setNetwork(1);

        mockProvider
            .addCallTo(DAI_ADDRESS, 10, L1_IFACE, "balanceOf", {
                inputs: [TEST_VAL1.OPT_ESCROW_ADDRESS],
                outputs: [TEST_VAL1.OPT_ESCROW_VALUE],
            })
            .addCallTo(DAI_ADDRESS, 10, L1_IFACE, "balanceOf", {
                inputs: [TEST_VAL1.ABT_ESCROW_ADDRESS],
                outputs: [TEST_VAL1.ABT_ESCROW_VALUE],
            });


            const findings = await handleBlock(blockEvent);
            expect(findings).toEqual([createL1OptFinding(TEST_VAL1.OPT_ESCROW_VALUE.toString(), TEST_VAL1.ABT_ESCROW_VALUE.toString())]);
            });

            it("returns no finding if the Arbitrum layer 2 dai supply is less than arbitrum escrow balance", async () => {
                const blockEvent = createBlockEvent({
                    block: {hash: "0xa", number: 10} as any,
                })

                mockProvider.addCallTo(DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
                    inputs: [],
                    outputs: [TEST_VAL2.ABT_L2_BAL],
                });

                mockProvider.setNetwork(42161);

                const findings = await handleBlock(blockEvent);

                expect(findings.length).toEqual(0);
                expect(findings).toStrictEqual([]);
            });

            it("returns a finding if optimism l2 supply is more than L1 escrow balance", async() => {
                const blockEvent = createBlockEvent({
                    block: {hash: "0xa", number: 10} as any,
                });

                mockProvider.addCallTo(DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
                    inputs: [],
                    outputs: [TEST_VAL1.OPT_L2_BAL],
                });

               

                mockProvider.setNetwork(10);
                mockGetAlerts.mockReturnValue({
                    alerts: 
                        [{
                            metadata: {
                                optEscBal: TEST_VAL1.OPT_ESCROW_VALUE.toString(),
                                abtEscBal: TEST_VAL1.ABT_ESCROW_VALUE.toString(),
                        },
                            },]
                        });
                const findings = await handleBlock(blockEvent);
                    
                

                const expectedFindings = createFinding(TEST_VAL1.OPT_ESCROW_VALUE.toString(), TEST_VAL1.OPT_L2_BAL.toString(), "Optimism");

                expect(findings.length).toEqual(1);
                expect(findings).toStrictEqual([expectedFindings]);
            });

 

    });
