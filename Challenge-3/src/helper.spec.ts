import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { ethers } from "ethers";
import { Alert, AlertsResponse, Finding } from "forta-agent";
import Helper from "./helper";
import {
  DAI_ADDRESS,
  DAI_L2_ADDRESS,
  ESCROW_ABI,
  OPT_ESCROW_ADDRESS,
} from "./constants";
const L2_ABI = ["function totalSupply() view returns (uint256)"];

// Mock data
let L1Alert: Alert = {
  alertId: "L2_Alert",
  hasAddress: (address: string) => false,
  metadata: {
    optEscBal: "50000000", // Ensure this value is a string and not undefined
    abtEscBal: "40000000",
  },
};

const l1Alerts: AlertsResponse = {
  alerts: [L1Alert],
  pageInfo: {
    hasNextPage: false,
  },
};

describe("getL2Supply", () => {
  let mockProvider: any;
  let findings: Finding[];
  let helper: Helper;

  beforeEach(() => {
    // Create the mock provider
    mockProvider = new MockEthersProvider() as any;

    // Initialize findings
    findings = [];

    // Initialize the Helper instance
    helper = new Helper(mockProvider as any);

    // Mock the totalSupply call with block tag
    mockProvider.addCallTo(
      DAI_L2_ADDRESS,
      12345,
      new ethers.utils.Interface(L2_ABI),
      "totalSupply",
      {
        inputs: [],
        outputs: [ethers.BigNumber.from("1000000000000000000000000")], // 1,000,000 DAI
      },
    );

    // Mock the getL1Alerts method
    jest.spyOn(helper, "getL1Alerts").mockResolvedValue(l1Alerts);
  });

  it("should return correct L1 escrow balances on L1 chain", async () => {
    mockProvider.setNetwork(1);
    mockProvider.addCallTo(
      DAI_ADDRESS,
      12345,
      new ethers.utils.Interface([ESCROW_ABI]),
      "balanceOf",
      {
        inputs: [OPT_ESCROW_ADDRESS],
        outputs: [ethers.BigNumber.from("1000000000000000000000000")],
      },
    );

    const blockNumber = 12345;

    const result = await helper.getL1Balance(OPT_ESCROW_ADDRESS, blockNumber);

    expect(result.toString()).toBe("1000000000000000000000000");
  });

  it("should correctly get L2 supply and compare with L1 balance for Optimism", async () => {
    mockProvider.setNetwork(10); // Set the network to Optimism

    const blockNumber = 12345;
    const chainId = 10; // Optimism chain ID

    await helper.getL2Supply(blockNumber, chainId, findings);
    expect(findings).toHaveLength(1);
    expect(findings[0].metadata.l1Escrow).toBe("50000000");
    expect(findings[0].metadata.l2Supply).toBe("1000000000000000000000000");
    expect(findings[0].protocol).toBe("Optimism");
  });

  it("should correctly get L2 supply and compare with L1 balance for Arbitrum", async () => {
    mockProvider.setNetwork(42161); // Set the network to Arbitrum

    const blockNumber = 12345;
    const chainId = 42161; // Arbitrum chain ID

    await helper.getL2Supply(blockNumber, chainId, findings);

    expect(findings).toHaveLength(1);
    expect(findings[0].metadata.l1Escrow).toBe("40000000");
    expect(findings[0].metadata.l2Supply).toBe("1000000000000000000000000");
    expect(findings[0].protocol).toBe("Arbitrum");
  });
});
