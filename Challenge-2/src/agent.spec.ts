import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import Retrieval from "./retrieval";
import { UNISWAP_PAIR_ABI, UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS, COMPUTED_INIT_CODE_HASH } from "./utils";
import { provideSwapHandler } from "./agent";
import {TestTransactionEvent, MockEthersProvider} from "forta-agent-tools/lib/test";
import { ProviderCache, createAddress } from "forta-agent-tools";
import { BigNumber } from "@ethersproject/bignumber";
const createFinding = (
    pairAddress: string,
    swapTokenIn: string,
    swapTokenOut: string,
): Finding => {
    return Finding.fromObject({
        name: "Swap Event",
        description: "Swap event detected",
        alertId: "UNISWAP_SWAP_EVENT",
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious,
        metadata: {
          
        },
    })
}
const mockProvider: MockEthersProvider = new MockEthersProvider();

const retrieval = new Retrieval(mockProvider as any);

const INIT_CODE = ethers.utils.keccak256("0x");
const PAIR_IFACE = new ethers.utils.Interface(UNISWAP_PAIR_ABI);
const [token0, token1, token2, token3] = [
    createAddress("0x01"),
    createAddress("0x02"),
    createAddress("0x03"),
    createAddress("0x04"),
  ];
  const TEST_PAIR_ADDRESS = retrieval.getUniswapPairCreate2Address(UNISWAP_FACTORY_ADDRESS, token0, token1, INIT_CODE).toLowerCase();
    const TEST_PAIR_ADDRESS2 = retrieval.getUniswapPairCreate2Address(UNISWAP_FACTORY_ADDRESS, token2, token3, INIT_CODE).toLowerCase();

export const SWAP_EVENT = 
"event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out,uint amount1Out,address indexed to)";
const SENDER = createAddress("0x12");
const toEbn = (num: string) => ethers.BigNumber.from(num);

const createSwapEvent = (
    pairAddress: string,
    amount0In: ethers.BigNumber,
    amount1In: ethers.BigNumber,
    amount0Out: ethers.BigNumber,
    amount1Out: ethers.BigNumber,
    to: string
  ): [string, string, string, string, string] => {
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint", "uint", "uint", "uint"],
      [amount0In, amount1In, amount0Out, amount1Out]
    );
   
    return ["Swap(address,uint256,uint256,uint256,uint256,address)", pairAddress, data, SENDER, to];
  };

  const createSomeOtherEvent = (contractAddress: string, arg1: string): [string, string, string] => {
   
    return ["SomeOtherEvent(uint256)", contractAddress, arg1];
  };

  const TEST_VAL1 = {
    TOKEN0_ADDR: "0x3845badAde8e6dFF049820680d1F14bD3903a5d0",
    TOKEN0_VAL: BigNumber.from("100"),
    TOKEN1_ADDR: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    TOKEN1_VAL: BigNumber.from("400"),
    POOL_ADDR: "0x5859ebE6Fd3BBC6bD646b73a5DbB09a5D7B6e7B7",
    Fee: BigNumber.from("3000"),
  };

  const TEST_VAL2 = {
    TOKEN2_ADDR: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    TOKEN2_VAL: BigNumber.from("100"),
    TOKEN3_ADDR: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    TOKEN3_VAL: BigNumber.from("400"),
    POOL_ADDR2: "0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0",
    Fee: BigNumber.from("500"),
  };

  const SQRT_PRICE = BigNumber.from("10");
const LIQ = BigNumber.from("1000");
const TICK = BigNumber.from("1");

describe("Uniswap test suite", () => {
    const handleTransaction: HandleTransaction = provideSwapHandler(
        UNISWAP_FACTORY_ADDRESS,
        retrieval,
        COMPUTED_INIT_CODE_HASH   
    );

    const setTokenPair = (block: number, pairAddress: string, tokenAddress: string, functionId: "token0" | "token1") => {
        mockProvider.addCallTo(pairAddress, block, PAIR_IFACE, functionId, {
          inputs: [],
          outputs: [tokenAddress],
        });
      };
      beforeEach(() => {
        mockProvider.clear();
      });

      it("should return empty findings with empty transaction", async () => {
        const txEvent = new TestTransactionEvent();
        expect(await handleTransaction(txEvent)).toStrictEqual([]);
      });
    
      it("should return empty findings when target event is emitted from contracts that are not valid Uniswap pairs", async () => {
        try{
        
        const txEvent = new TestTransactionEvent().setBlock(210).addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", TEST_PAIR_ADDRESS, [
            TEST_VAL1.TOKEN0_ADDR,
            TEST_VAL1.TOKEN1_ADDR,
            TEST_VAL1.TOKEN0_VAL,
            TEST_VAL1.TOKEN1_VAL,
            SQRT_PRICE,
            LIQ,
            TICK
                    ] );
        setTokenPair(1000, createAddress("0x89"), token0, "token0");
        setTokenPair(1000, createAddress("0x89"), token1, "token1");
        expect(await handleTransaction(txEvent)).toStrictEqual([]);
    } catch (error) {
        console.log(error);
    }
      });

      it("should return findings for swap events from valid uniswap pairs", async() => {
       
        const txEvent = new TestTransactionEvent().addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", TEST_PAIR_ADDRESS, [
TEST_VAL1.TOKEN0_ADDR,
TEST_VAL1.TOKEN1_ADDR,
TEST_VAL1.TOKEN0_VAL,
TEST_VAL1.TOKEN1_VAL,
SQRT_PRICE,
LIQ,
TICK
        ] );

        setTokenPair(210, TEST_PAIR_ADDRESS, token0, "token0");
    setTokenPair(210, TEST_PAIR_ADDRESS, token1, "token1");

    expect(await handleTransaction(txEvent)).toEqual([
        createFinding(
          TEST_PAIR_ADDRESS,
          token1,
          token0,
        ),
      ]);
    
      });

      it("returns an empty finding if there are other events but no swap event", async () => {
        const txEvent = new TestTransactionEvent()
            .addEventLog("event OtherEvent(address indexed sender, uint256 value)", TEST_PAIR_ADDRESS, [
                TEST_VAL1.TOKEN0_ADDR,
                TEST_VAL1.TOKEN0_VAL
            ]);
    
        const findings = await handleTransaction(txEvent);
    
        expect(findings).toEqual([]);
    });

    it("returns multiple findings if there are multiple valid swap events from Uniswap", async () => {
      const txEvent = new TestTransactionEvent()
          .addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", TEST_PAIR_ADDRESS, [
              TEST_VAL1.TOKEN0_ADDR,
              TEST_VAL1.TOKEN1_ADDR,
              TEST_VAL1.TOKEN0_VAL,
              TEST_VAL1.TOKEN1_VAL,
              SQRT_PRICE,
              LIQ,
              TICK
          ])
          .addEventLog("event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", TEST_PAIR_ADDRESS, [
              TEST_VAL2.TOKEN2_ADDR,
              TEST_VAL2.TOKEN3_ADDR,
              TEST_VAL2.TOKEN2_VAL,
              TEST_VAL2.TOKEN3_VAL,
              SQRT_PRICE,
              LIQ,
              TICK
          ]);
  
      const findings = await handleTransaction(txEvent);
  
      expect(findings.length).toEqual(2);
      expect(findings).toEqual([
          createFinding(
              TEST_PAIR_ADDRESS,
              TEST_VAL1.TOKEN1_ADDR,
              TEST_VAL1.TOKEN0_ADDR,
          ),
          createFinding(
              TEST_PAIR_ADDRESS,
              TEST_VAL2.TOKEN3_ADDR,
              TEST_VAL2.TOKEN2_ADDR,
          ),
      ]);
  });
});
