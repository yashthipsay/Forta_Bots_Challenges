import {MockEthersProvider} from "forta-agent-tools/lib/test";
import {ethers, HandleBlock, createBlockEvent} from "forta-agent";
import { provideHandleBlock } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import {Interface} from "ethers/lib/utils";
import { ESCROW_ABI, OPT_ESCROW_ADDRESS, ABT_ESCROW_ADDRESS, L2_ABI, DAI_ADDRESS, DAI_L2_ADDRESS } from "./constants";
import { createFinding, createL1AbtFinding, createL1OptFinding } from "./findings";
import { MockProvider } from "./MockProvider";


const TEST_VAL1 = {
    OPT_ESCROW_ADDRESS: OPT_ESCROW_ADDRESS,
    OPT_ESCROW_VALUE: BigNumber.from("100"),
    ABT_ESCROW_ADDRESS: ABT_ESCROW_ADDRESS,
    ABT_ESCROW_VALUE: BigNumber.from("400"),
    OPT_L2_BAL: BigNumber.from("500"),
    ABT_L2_BAL: BigNumber.from("600"),
}

const TEST_VAL2 = {
    OPT_ESCROW_ADDRESS: OPT_ESCROW_ADDRESS,
    OPT_ESCROW_VALUE: BigNumber.from("500"),
    ABT_ESCROW_ADDRESS: ABT_ESCROW_ADDRESS,
    ABT_ESCROW_VALUE: BigNumber.from("400"),
    OPT_L2_BAL: BigNumber.from("100"),
    ABT_L2_BAL: BigNumber.from("100"),
}

const L1_IFACE = new ethers.utils.Interface([ESCROW_ABI]);
const L2_IFACE = new ethers.utils.Interface([L2_ABI]);

const MakeMockCall = (
    mockProvider: MockEthersProvider,
    id: string,
    inp: any[],
    outp: any[],
    addr: string,
    intface: Interface,
    block: number = 10
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
        handleBlock = provideHandleBlock(provider);
    })

    it("returns a findings for layer one escrows when on the eth network", async () => {
        const blockEvent = createBlockEvent({
            block: { hash: "0xa", number: 10 } as any 
        });

        mockProvider
            .addCallTo(DAI_ADDRESS, 10, L1_IFACE, "balanceOf", {
                inputs: [TEST_VAL1.OPT_ESCROW_ADDRESS],
                outputs: [TEST_VAL1.OPT_ESCROW_VALUE],
            })
            .addCallTo(DAI_ADDRESS, 10, L1_IFACE, "balanceOf", {
                inputs: [TEST_VAL1.ABT_ESCROW_ADDRESS],
                outputs: [TEST_VAL1.ABT_ESCROW_VALUE],
            });

            mockProvider.setNetwork(1);

            const findings = await handleBlock(blockEvent);
            expect(findings).toEqual([createL1OptFinding(TEST_VAL1.OPT_ESCROW_VALUE.toString()), createL1AbtFinding(TEST_VAL1.ABT_ESCROW_VALUE.toString())]);
            });

        it("returns no finding if the optimism layer 2 dai supply is less than the layer 1 escrow dai balance", async() => {
            const blockEvent = createBlockEvent({
                block: {
                    number: 10
                } as any,
            });
            mockProvider.setNetwork(10);

           mockProvider.addCallTo(DAI_L2_ADDRESS, 10, L2_IFACE, "totalSupply", {
                inputs: [],
                outputs: [TEST_VAL1.OPT_L2_BAL],
            });


            const findings = await handleBlock(blockEvent);
            

            expect(findings.length).toEqual(0);
            expect(findings).toStrictEqual([]);
        });

    });
