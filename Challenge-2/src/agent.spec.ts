import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Finding, FindingSeverity, FindingType, getEthersProvider, HandleTransaction } from "forta-agent";
import { provideSwapHandler } from "./agent";
import { BigNumber } from "@ethersproject/bignumber";
import { COMPUTED_INIT_CODE_HASH, SWAP_EVENT, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";
import Retrieval from "./retrieval";
import { createAddress } from "forta-agent-tools";
import { Interface } from "@ethersproject/abi";
import { ethers } from "forta-agent";
import { Provider } from "@ethersproject/abstract-provider";


let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(UNISWAP_PAIR_ABI);


describe("Uniswap test suite", () => {
  const mockProvider = new MockEthersProvider();

  let txEvent: TestTransactionEvent;

  const mockToken1 = createAddress("0x987");
  const mockFee = 10000;
//   const mockPoolAddress = createAddress("0x42069");
    let mockPoolAddress: string
    try{
        const retrieval = new Retrieval(mockProvider as any);
        mockPoolAddress = retrieval.getUniswapPairCreate2Address(createAddress('0x23124'), createAddress('0x765'), mockToken1, 99206)
    } catch (error) {
        console.error(error);
    }

  const mockSwapEventArgs = [
    createAddress("0x234"),
    createAddress("0x345"),
    ethers.BigNumber.from("5378335736229591174395"),
    ethers.BigNumber.from("266508884993980604"),
    ethers.BigNumber.from("555620238891309147094159455"),
    ethers.BigNumber.from("14900188386820019615173"),
    99206,
  ];

  // Describe block groups test cases together
  beforeAll(() => {
    handleTransaction = provideSwapHandler(UNISWAP_FACTORY_ADDRESS, COMPUTED_INIT_CODE_HASH, mockProvider as any);
  });

  /*
 const mockProvider: MockEthersProvider = new MockEthersProvider()
  .addCallTo(address, 20, iface, "myAwesomeFunction", { inputs: [10, "tests"], outputs: [1, 2000] });

  const createBalanceOfCall = (moduleAddress: string, tokenAmount: BigNumber, blockNumber: number) => {
    mockProvider.addCallTo(mockNetworkManager.usdcAddress, blockNumber, USDC_IFACE, "balanceOf", {
      inputs: [moduleAddress],
      outputs: [tokenAmount],
    });
  };
 */

  it.only("returns a finding if there is a single valid swap event from Uniswap", async () => {
    const createUniswapPairCalls = (pairAddress: string, functionName: string, output: string | number, blockNumber: number) => {
      mockProvider.addCallTo(pairAddress, blockNumber, Iface, functionName, {
        inputs: [],
        outputs: [output],
      });
    };

    createUniswapPairCalls(mockPoolAddress, "token0", createAddress("0x765"), 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);

    txEvent = new TestTransactionEvent();

    txEvent
    .setBlock(0)
      .addEventLog(
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        mockPoolAddress,
        [
          mockSwapEventArgs[0],
          mockSwapEventArgs[1],
          mockSwapEventArgs[2],
          mockSwapEventArgs[3],
          mockSwapEventArgs[4],
          mockSwapEventArgs[5],
          mockSwapEventArgs[6],
        ]
      );
  
  

      

    const findings = await handleTransaction(txEvent)
      .then((findings) => {
        console.log(findings);
        expect(findings.length).toStrictEqual(1);
        expect(findings).toStrictEqual([
          Finding.fromObject({
            name: 'Uniswap V3 Swap Detector',
            description: 'This Bot detects the Swaps executed on Uniswap V3',
            alertId: 'FORTA-1',
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            protocol: 'UniswapV3',
            metadata: {
              
            },
          }),
        ]);
      })
      
  });
});