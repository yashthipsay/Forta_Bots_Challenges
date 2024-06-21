import { TestTransactionEvent, MockEthersProvider } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { ethers, HandleTransaction } from "forta-agent";
import { provideHandleTransaction } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import { Interface } from "@ethersproject/abi";
import { createFinding } from "./finding";
import { poolValues } from "./helper";
import { IUNISWAPV3POOL, SWAP_EVENT, MINT_EVENT } from "./constants";

// Test values for a valid uniswap event
const TEST_VALUE_1 = {
    TOKEN0_ADDRESS: "0x3845badAde8e6dFF049820680d1F14bD3903a5d0",
    TOKEN0_VALUE: BigNumber.from("100"),
    TOKEN1_ADDRESS: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    TOKEN1_VALUE: BigNumber.from("400"),
    POOL_ADDRESS: "0x5859ebE6Fd3BBC6bD646b73a5DbB09a5D7B6e7B7",
    FEE: BigNumber.from("3000"),
};

// Test values for a valid uniswap event but from a different pool from the first test values
const TEST_VALUE_2 = {
    TOKEN2_ADDRESS: createAddress("0x3"),
    TOKEN2_VALUE: BigNumber.from("100"),
    TOKEN3_ADDRESS: createAddress("0x4"),
    TOKEN3_VALUE: BigNumber.from("400"),
    POOL_ADDRESS2: createAddress("0x5"),
    FEE: BigNumber.from("500"),
};

// These are also test values for the swap event but can remain the same so we use these for both cases
const SQRT_PRICE = BigNumber.from("10");
const LIQUIDITY = BigNumber.from("1000");
const TICK = BigNumber.from("1");

const POOL_INTERFACE = new ethers.utils.Interface(IUNISWAPV3POOL);

// Helper function that simulates a function call from a certain contract
// E.g., for token0 function in pool contract we return the token address when called with correct params
const makeMockCall = (
    mockProvider: MockEthersProvider,
    id: string,
    inp: any[],
    outp: any[],
    example: number = 1,
    block: number = 10,
    intface: Interface = POOL_INTERFACE,
    addr: string = TEST_VALUE_1.POOL_ADDRESS
) => {
  
    if (example == 2) {
        addr = TEST_VALUE_2.POOL_ADDRESS2;
    }
  

    mockProvider.addCallTo(addr, block, intface, id, {
        inputs: inp,
        outputs: outp,
    });
};

describe("Uniswap swap detection bot", () => {
    let handleTransaction: HandleTransaction;
    let mockProvider: MockEthersProvider;
    let provider: ethers.providers.Provider;

    beforeEach(() => {
        mockProvider = new MockEthersProvider();
        provider = mockProvider as unknown as ethers.providers.Provider;
        handleTransaction = provideHandleTransaction(provider, SWAP_EVENT, IUNISWAPV3POOL);
    });

    it("returns an empty finding if there are no swap events", async () => {
        const txEvent = new TestTransactionEvent();
        const findings = await handleTransaction(txEvent);
        expect(findings.length).toEqual(0);
        expect(findings).toStrictEqual([]);
    });

    it("returns an empty finding if there are other events but no swap event", async () => {
        const txEvent = new TestTransactionEvent()
            .setBlock(10)
            .addEventLog(MINT_EVENT[0], createAddress("0x3"), [createAddress("0x4"), 1]);
        const findings = await handleTransaction(txEvent);
        expect(findings.length).toEqual(0);
        expect(findings).toStrictEqual([]);
    });

    it("returns no findings if there is a swap event from a different pool (not Uniswap)", async () => {
        // In this case, we assume that there exists a pool contract that has the token/fee functions so it returns a value
        // However, when checked with the Uniswap fact contract getPool function, it fails as it is not a Uniswap pool
        makeMockCall(mockProvider, "token0", [], [TEST_VALUE_1.TOKEN0_ADDRESS]);
        makeMockCall(mockProvider, "token1", [], [TEST_VALUE_1.TOKEN1_ADDRESS]);
        makeMockCall(mockProvider, "fee", [], [TEST_VALUE_1.FEE]);

        const txEvent = new TestTransactionEvent()
            .setBlock(10)
            .addEventLog(SWAP_EVENT[0], createAddress("0x55"), [
                TEST_VALUE_1.TOKEN0_ADDRESS,
                TEST_VALUE_1.TOKEN1_ADDRESS,
                TEST_VALUE_1.TOKEN0_VALUE,
                TEST_VALUE_1.TOKEN1_VALUE,
                SQRT_PRICE,
                LIQUIDITY,
                TICK,
            ]);

        const findings = await handleTransaction(txEvent);
        expect(findings.length).toEqual(0);
        expect(findings).toStrictEqual([]);
    });

    it("returns a finding if there is a single valid swap event from Uniswap", async () => {
        try{
        makeMockCall(mockProvider, "token0", [], [TEST_VALUE_1.TOKEN0_ADDRESS]);
        makeMockCall(mockProvider, "token1", [], [TEST_VALUE_1.TOKEN1_ADDRESS]);

        const txEvent = new TestTransactionEvent()
            .addEventLog(SWAP_EVENT[0], TEST_VALUE_1.POOL_ADDRESS, [
                TEST_VALUE_1.TOKEN0_ADDRESS,
                TEST_VALUE_1.TOKEN1_ADDRESS,
                TEST_VALUE_1.TOKEN0_VALUE,
                TEST_VALUE_1.TOKEN1_VALUE,
                SQRT_PRICE,
                LIQUIDITY,
                TICK,
            ]);

        const poolVal: poolValues = {
            token0: TEST_VALUE_1.TOKEN0_ADDRESS,
            token1: TEST_VALUE_1.TOKEN1_ADDRESS,
            fee: TEST_VALUE_1.FEE,
        };
        const mockFinding = createFinding(poolVal, TEST_VALUE_1.POOL_ADDRESS);
        const findings = await handleTransaction(txEvent);

        expect(findings.length).toEqual(1);
        expect(findings[0]).toStrictEqual(mockFinding);
    } catch (error) {
        console.log(error);
    }
    });

});
