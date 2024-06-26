import { TestTransactionEvent, MockEthersProvider } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { ethers, HandleTransaction } from "forta-agent";
import { provideSwapHandler } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import { Interface } from "@ethersproject/abi";
import { createFinding } from "./finding";
import { PoolValues } from "./retrieval";
import { UNISWAP_PAIR_ABI, SWAP_EVENT, RANDOM_EVENT } from "./utils";

// Test values for a valid uniswap event
const UNISWAP_EVENT_1 = {
  TOKEN0_ADDR: createAddress("0x3845badAde8e6dFF049820680d1F14bD3903a5d0"), // Token 0 address
  TOKEN0_VAL: BigNumber.from("100"), // Token 0 value
  TOKEN1_ADDR: createAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"), // Token 1 address
  TOKEN1_VAL: BigNumber.from("400"), // Token 1 value
  POOL_ADDR: "0x5859ebE6Fd3BBC6bD646b73a5DbB09a5D7B6e7B7", // Pool address
  Fee: BigNumber.from("3000"), // Fee value
};

const UNISWAP_EVENT_2 = {
  TOKEN2_ADDR: createAddress("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"), // Token 2 address
  TOKEN2_VAL: BigNumber.from("100"), // Token 2 value
  TOKEN3_ADDR: createAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"), // Token 3 address
  TOKEN3_VAL: BigNumber.from("400"), // Token 3 value
  POOL_ADDR2: "0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0", // Pool address 2
  Fee: BigNumber.from("500"), // Fee value 2
};

const SQRT_PRICE = BigNumber.from("10"); // Square root price
const LIQ = BigNumber.from("1000"); // Liquidity value
const TICK = BigNumber.from("1"); // Tick value

const POOL_IFACE = new ethers.utils.Interface(UNISWAP_PAIR_ABI); // Pool interface

const MakeMockCall = (
  mockProvider: MockEthersProvider,
  id: string,
  inputs: any[],
  outputs: any[],
  testCase: number = 1,
  block: number = 10,
  intface: Interface = POOL_IFACE,
  addr: string = testCase === 1 ? UNISWAP_EVENT_1.POOL_ADDR : UNISWAP_EVENT_2.POOL_ADDR2
) => {
  mockProvider.addCallTo(addr, block, intface, id, {
    inputs,
    outputs,
  });
};

describe("Uniswap swap detection bot", () => {
  let handleTransaction: HandleTransaction;
  let mockProvider: MockEthersProvider;
  let provider: ethers.providers.Provider;

  beforeEach(() => {
    mockProvider = new MockEthersProvider();
    provider = mockProvider as unknown as ethers.providers.Provider;
    handleTransaction = provideSwapHandler(provider, SWAP_EVENT, UNISWAP_PAIR_ABI);
  });

  it("returns an empty finding if there are no swap events", async () => {
    // Test case: No swap events
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(0);
    expect(findings).toStrictEqual([]);
  });

  it("returns an empty finding if there are other events but no swap event", async () => {
    // Test case: Other events but no swap event
    const txEvent = new TestTransactionEvent()
      .setBlock(10)
      .addEventLog(RANDOM_EVENT[0], createAddress("0x3"), [createAddress("0x4"), 1]);
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(0);
    expect(findings).toStrictEqual([]);
  });

  it("returns no findings if there is a swap event from a different pool(not uniswap)", async () => {
    // Test case: Swap event from a different pool (not uniswap)
    MakeMockCall(mockProvider, "token0", [], [UNISWAP_EVENT_1.TOKEN0_ADDR]);
    MakeMockCall(mockProvider, "token1", [], [UNISWAP_EVENT_1.TOKEN1_ADDR]);
    MakeMockCall(mockProvider, "fee", [], [UNISWAP_EVENT_1.Fee]);

    const txEvent = new TestTransactionEvent()
      .setBlock(10)
      .addEventLog(SWAP_EVENT[0], createAddress("0x55"), [
        UNISWAP_EVENT_1.TOKEN0_ADDR,
        UNISWAP_EVENT_1.TOKEN1_ADDR,
        UNISWAP_EVENT_1.TOKEN0_VAL,
        UNISWAP_EVENT_1.TOKEN1_VAL,
        SQRT_PRICE,
        LIQ,
        TICK,
      ]);

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(0);
    expect(findings).toStrictEqual([]);
  });

  it("returns a finding if there is a single valid swap event from uniswap", async () => {
    // Test case: Single valid swap event from uniswap
    MakeMockCall(mockProvider, "token0", [], [UNISWAP_EVENT_1.TOKEN0_ADDR]);
    MakeMockCall(mockProvider, "token1", [], [UNISWAP_EVENT_1.TOKEN1_ADDR]);
    MakeMockCall(mockProvider, "fee", [], [UNISWAP_EVENT_1.Fee]);

    const txEvent = new TestTransactionEvent()
      .setBlock(10)
      .addEventLog(SWAP_EVENT[0], UNISWAP_EVENT_1.POOL_ADDR, [
        UNISWAP_EVENT_1.TOKEN0_ADDR,
        UNISWAP_EVENT_1.TOKEN1_ADDR,
        UNISWAP_EVENT_1.TOKEN0_VAL,
        UNISWAP_EVENT_1.TOKEN1_VAL,
        SQRT_PRICE,
        LIQ,
        TICK,
      ]);

    const mockFinding = createFinding(
      {
        token0: UNISWAP_EVENT_1.TOKEN0_ADDR,
        token1: UNISWAP_EVENT_1.TOKEN1_ADDR,
        fee: UNISWAP_EVENT_1.Fee,
      },
      UNISWAP_EVENT_1.POOL_ADDR
    );
    const findings = await handleTransaction(txEvent);

    expect(findings.length).toEqual(1);
    expect(findings[0]).toStrictEqual(mockFinding);
  });

  it("returns multiple findings if there is multiple valid swap events from uniswap (different pools)", async () => {
    // Test case: Multiple valid swap events from uniswap (different pools)
    MakeMockCall(mockProvider, "token0", [], [UNISWAP_EVENT_1.TOKEN0_ADDR]);
    MakeMockCall(mockProvider, "token1", [], [UNISWAP_EVENT_1.TOKEN1_ADDR]);
    MakeMockCall(mockProvider, "fee", [], [UNISWAP_EVENT_1.Fee]);

    // MockCall for the second swap event in a different pool
    MakeMockCall(mockProvider, "token0", [], [UNISWAP_EVENT_2.TOKEN2_ADDR], 2);
    MakeMockCall(mockProvider, "token1", [], [UNISWAP_EVENT_2.TOKEN3_ADDR], 2);
    MakeMockCall(mockProvider, "fee", [], [UNISWAP_EVENT_2.Fee], 2);

    const txEvent = new TestTransactionEvent()
      .setBlock(10)
      .addEventLog(SWAP_EVENT[0], UNISWAP_EVENT_1.POOL_ADDR, [
        UNISWAP_EVENT_1.TOKEN0_ADDR,
        UNISWAP_EVENT_1.TOKEN1_ADDR,
        UNISWAP_EVENT_1.TOKEN0_VAL,
        UNISWAP_EVENT_1.TOKEN1_VAL,
        SQRT_PRICE,
        LIQ,
        TICK,
      ])
      // Event log for the second swap event in a different pool
      .addEventLog(SWAP_EVENT[0], UNISWAP_EVENT_2.POOL_ADDR2, [
        UNISWAP_EVENT_2.TOKEN2_ADDR,
        UNISWAP_EVENT_2.TOKEN3_ADDR,
        UNISWAP_EVENT_2.TOKEN2_VAL,
        UNISWAP_EVENT_2.TOKEN3_VAL,
        SQRT_PRICE,
        LIQ,
        TICK,
      ]);

    const poolVal = {
      token0: UNISWAP_EVENT_1.TOKEN0_ADDR,
      token1: UNISWAP_EVENT_1.TOKEN1_ADDR,
      fee: UNISWAP_EVENT_1.Fee,
    };
    const poolVal2 = {
      token0: UNISWAP_EVENT_2.TOKEN2_ADDR,
      token1: UNISWAP_EVENT_2.TOKEN3_ADDR,
      fee: UNISWAP_EVENT_2.Fee,
    };
    const mockFinding = createFinding(poolVal, UNISWAP_EVENT_1.POOL_ADDR);
    const mockFinding2 = createFinding(poolVal2, UNISWAP_EVENT_2.POOL_ADDR2);

    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(2);
    expect(findings[0]).toStrictEqual(mockFinding);
    expect(findings[1]).toStrictEqual(mockFinding2);
  });
});
