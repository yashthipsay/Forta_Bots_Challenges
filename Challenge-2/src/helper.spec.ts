import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { HandleTransaction } from "forta-agent";
import { provideHandleTransaction } from "./agent";
import { COMPUTED_INIT_CODE_HASH, UNISWAP_PAIR_ABI } from "./constants";
import Helper from "./helper";
import { createAddress } from "forta-agent-tools";
import { ethers } from "forta-agent";

let handleTransaction: HandleTransaction;
let Iface: ethers.utils.Interface = new ethers.utils.Interface(UNISWAP_PAIR_ABI);

function generateMockPoolAddress(
  factoryAddress: string,
  token0: string,
  token1: string,
  fee: number,
  initcode: string
): string {
  // Compute the salt by hashing the encoded parameters
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
  );

  // Use the getCreate2Address utility to compute the address
  const address = ethers.utils.getCreate2Address(
    factoryAddress,
    salt,
    initcode
  );

  return address;
}

describe("Uniswap test suite", () => {
  const mockProvider = new MockEthersProvider();
  const mockToken1 = createAddress("0x987");
  const mockFee = 99206;
  let mockPoolAddress: string;
  
  const helper = new Helper(mockProvider as any);
  mockPoolAddress = generateMockPoolAddress(
    createAddress("0x284"),
    createAddress("0x765"),
    mockToken1,
    mockFee,
    COMPUTED_INIT_CODE_HASH
  );


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
  it("Testing validity for swap event from Uniswap", async () => {
    const mockIncorrectFactoryAddress = createAddress("0x123235");
    createUniswapPairCalls(mockPoolAddress, "token0", createAddress("0x765"), 0);
    createUniswapPairCalls(mockPoolAddress, "token1", mockToken1, 0);
    createUniswapPairCalls(mockPoolAddress, "fee", mockFee, 0);

    const [isValid] = await helper.isValidUniswapPair(
      mockIncorrectFactoryAddress,
      mockPoolAddress,
      COMPUTED_INIT_CODE_HASH,
      mockProvider as any,
      0
    );

    expect(isValid).toBe(false);
  });

});
