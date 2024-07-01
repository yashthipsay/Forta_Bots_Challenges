// import { CachedContract, createAddress } from "forta-agent-tools";
// import { DAI_L2_ADDRESS, ESCROW_ABI, L2_ABI } from "./constants";
// import { AlertsResponse, ethers, getEthersProvider } from "forta-agent";
// import { MockEthersProvider } from "forta-agent-tools/lib/test";
// import { Contract } from "@ethersproject/contracts";
// import Helper from "./helper";

// describe("Helper test suite", () => {
// const provider = new MockEthersProvider() as any;
// const mockProvider = provider as any as ethers.providers.Provider;
// let alertsResponse: Object;
// let daiContract;
// let getL1Alerts: any;
// let findings: any[] = [];
//     const helper = new Helper(new MockEthersProvider() as any);
//  const daiAddress = createAddress("0x345");
//  const totalSupply = ethers.utils.parseUnits("1000000", 18);
//  const totalSupplyBignumber = ethers.BigNumber.from("1000000");
//  alertsResponse = {
//     alerts: [
//         {
//             metadata: {
//                 optEscBal: "500000000000000000000000", abtEscBal: "400000000000000000000000"
//             }
//         }
//     ]
// }
//     beforeEach(() => {
//         getL1Alerts = jest.fn().mockResolvedValue(alertsResponse);
//     })

//     it("returns the total supply of the L2 network", async() => {
//         provider
//         .addCallTo(DAI_L2_ADDRESS, 0, new ethers.utils.Interface([L2_ABI]), "totalSupply", {
//             inputs: [],
//             outputs: [totalSupplyBignumber]
//         });

//         const blockNumber = 0;
//         const chainId = 10;
//         try{
//         const result = await helper.getL2Supply(blockNumber, chainId, findings, getL1Alerts)
//         }catch(e){
//             console.log(e);
//         }
//     });

// })

import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { ethers, Contract } from "ethers";
import { Provider } from "@ethersproject/providers";
import { Alert, AlertsResponse, Finding } from "forta-agent";
import Helper from "./helper";
import { DAI_L2_ADDRESS } from "./constants";
import getL2Supply from "./helper";
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

    try {
      const result = await helper.getL2Supply.call(
        { provider: mockProvider },
        blockNumber,
        chainId,
        findings,
        getL1Alerts as any,
      );
      console.log(result);
    } catch (e) {
      console.log(e);
    }
    expect(findings).toHaveLength(1);
    // expect(findings[0].metadata.l1Balance).toBe("500000000000000000000000");
    // expect(findings[0].metadata.l2Balance).toBe("1000000000000000000000000");
    // expect(findings[0].metadata.network).toBe("Optimism");
  });

  //   it("should correctly get L2 supply and compare with L1 balance for Arbitrum", async () => {
  //     const blockNumber = 12345;
  //     const chainId = 42161; // Arbitrum chain ID

  //     const result = await helper.getL2Supply.call({ provider: mockProvider }, blockNumber, chainId, findings, getL1Alerts);

  //     expect(findings).toHaveLength(1);
  //     expect(findings[0].metadata.l1Balance).toBe("400000000000000000000000");
  //     expect(findings[0].metadata.l2Balance).toBe("1000000000000000000000000");
  //     expect(findings[0].metadata.network).toBe("Arbitrum");
  //   });
});
