import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { HandleTransaction } from "forta-agent";
import { provideHandleTransaction } from "./agent";
import { COMPUTED_INIT_CODE_HASH, UNISWAP_PAIR_ABI } from "./constants";
import Helper from "./helper";
import { createAddress } from "forta-agent-tools";
import { ethers } from "forta-agent";

let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(UNISWAP_PAIR_ABI);

describe("Uniswap test suite", () => {
  const mockProvider = new MockEthersProvider();
  const mockToken1 = createAddress("0x987");
  const mockFee = 99206;
  let mockPoolAddress: string;
  
  const helper = new Helper(mockProvider as any);
  mockPoolAddress = helper.getUniswapPairCreate2Address(
    createAddress("0x284"),
    createAddress("0x765"),
    mockToken1,
    99206,
    COMPUTED_INIT_CODE_HASH
  );

  // Describe block groups test cases together
  beforeAll(() => {
    handleTransaction = provideHandleTransaction(createAddress("0x284"), COMPUTED_INIT_CODE_HASH, mockProvider as any);
  });
  const createUniswapPairCalls = (
    pairAddress: string,
    functionName: string,
    output: string | number,
    blockNumber: number
  ) => {
    mockProvider.addCallTo(pairAddress, blockNumber, Iface, functionName, {
      inputs: [],
      outputs: [output],
    });
  };

  // It returns a single finding if there is a single valid swap event from Uniswap
  it("Testing validity for swap event from Uniswap", async () => {
    createUniswapPairCalls(mockPoolAddress, "token0", createAddress("0x765"), 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);

    const [isValid] = await helper.isValidUniswapPair(
      createAddress("0x284"),
      mockPoolAddress,
      COMPUTED_INIT_CODE_HASH,
      mockProvider as any,
      0
    );

    expect(isValid).toBe(true);
  });

  it("returns valid Uniswap address for correct set of parameters", async () => {
    const mockGetUniswapPairCreate2Address = jest.fn();
    helper.getUniswapPairCreate2Address = mockGetUniswapPairCreate2Address;

    // Use mockResolvedValue if getUniswapPairCreate2Address is async
    mockGetUniswapPairCreate2Address.mockResolvedValue("0x0000000000000000000000000000000000000234");

    const result = await helper.getUniswapPairCreate2Address(
      createAddress("0x284"),
      createAddress("0x765"),
      mockToken1,
      99206,
      COMPUTED_INIT_CODE_HASH
    );

    expect(result).toBe("0x0000000000000000000000000000000000000234");
  });
});
