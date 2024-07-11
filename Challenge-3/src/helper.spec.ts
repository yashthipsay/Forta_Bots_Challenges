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
    optEscBal: ethers.BigNumber.from("50000000"),
    abtEscBal: ethers.BigNumber.from("40000000"),
  },
};

const l1Alerts: AlertsResponse = {
  alerts: [L1Alert],
  pageInfo: {
    hasNextPage: false,
  },
};

const mockGetAlerts = jest.fn();

describe("getL2Supply", () => {
  let mockProvider: any;
  let findings: Finding[];
  let getL1Alerts: jest.Mock<Promise<any>, any>;
  let helper: Helper;
  beforeEach(() => {
    // Create the mock provider
    mockProvider = new MockEthersProvider() as any;

    // Initialize findings and getL1Alerts mock
    findings = [];
    getL1Alerts = jest.fn().mockResolvedValue(l1Alerts);

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
  });

  beforeAll(() => {
    helper = new Helper(mockProvider as any);
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
    mockGetAlerts.mockReturnValue({
      alerts: [
        {
          metadata: {
            optEscBal: ethers.BigNumber.from("500000000000000000000000"),
            abtEscBal: ethers.BigNumber.from("400000000000000000000000"),
          },
        },
      ],
    });

    const blockNumber = 12345;
    const chainId = 1;

    const result = await helper.getL1Balance.call(
      { provider: mockProvider },
      OPT_ESCROW_ADDRESS,
      blockNumber,
    );

    expect(result.toString()).toBe("1000000000000000000000000");
    // expect(findings).toHaveLength(1);
  });

  it("should correctly get L2 supply and compare with L1 balance for Optimism", async () => {
    mockProvider.setNetwork(10); // Set the network to Optimism
    mockGetAlerts.mockReturnValue({
      alerts: [
        {
          metadata: {
            optEscBal: ethers.BigNumber.from("500000000000000000000000"),
            abtEscBal: ethers.BigNumber.from("400000000000000000000000"),
          },
        },
      ],
    });
    const blockNumber = 12345;
    const chainId = 10; // Optimism chain ID

    const result = await helper.getL2Supply.call(
      { provider: mockProvider },
      blockNumber,
      chainId,
      findings,
      getL1Alerts as any,
    );

    expect(findings).toHaveLength(1);
    expect(findings[0].metadata.l1Escrow).toBe("50000000");
    expect(findings[0].metadata.l2Supply).toBe("1000000000000000000000000");
    expect(findings[0].protocol).toBe("Optimism");
  });

  it("should correctly get L2 supply and compare with L1 balance for Arbitrum", async () => {
    mockProvider.setNetwork(42161); // Set the network to Arbitrum
    mockGetAlerts.mockReturnValue({
      alerts: [
        {
          metadata: {
            optEscBal: ethers.BigNumber.from("300000000000000000000000"),
            abtEscBal: ethers.BigNumber.from("250000000000000000000000"),
          },
        },
      ],
    });
    const blockNumber = 12345;
    const chainId = 42161; // Arbitrum chain ID

    const result = await helper.getL2Supply.call(
      { provider: mockProvider },
      blockNumber,
      chainId,
      findings,
      getL1Alerts as any,
    );

    expect(findings).toHaveLength(1);
    expect(findings[0].metadata.l1Escrow).toBe("40000000");
    expect(findings[0].metadata.l2Supply).toBe("1000000000000000000000000");
    expect(findings[0].protocol).toBe("Arbitrum");
  });
});
