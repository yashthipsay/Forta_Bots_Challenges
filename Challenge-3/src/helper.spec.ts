import { CachedContract, createAddress } from "forta-agent-tools";
import { DAI_L2_ADDRESS, ESCROW_ABI, L2_ABI } from "./constants";
import { AlertsResponse, ethers, getEthersProvider } from "forta-agent";
import { MockEthersProvider } from "forta-agent-tools/lib/test";
import { Contract } from "@ethersproject/contracts";
import Helper from "./helper";




describe("Helper test suite", () => {
const provider = new MockEthersProvider() as any;
const mockProvider = provider as any as ethers.providers.Provider;
let alertsResponse: Object;
let daiContract;
let getL1Alerts: any;
let findings: any[] = [];
    const helper = new Helper(new MockEthersProvider() as any);
 const daiAddress = createAddress("0x345");
 const totalSupply = ethers.utils.parseUnits("1000000", 18);
 const totalSupplyBignumber = ethers.BigNumber.from("1000000");
 alertsResponse = {
    alerts: [
        {
            metadata: {
                optEscBal: "500000000000000000000000", abtEscBal: "400000000000000000000000"
            }
        }
    ]
}
    beforeEach(() => {
        getL1Alerts = jest.fn().mockResolvedValue(alertsResponse);
    })
    
    it("returns the total supply of the L2 network", async() => {
        provider
        .addCallTo(DAI_L2_ADDRESS, 0, new ethers.utils.Interface([L2_ABI]), "totalSupply", {
            inputs: [],
            outputs: [totalSupplyBignumber]
        });

        const blockNumber = 0;
        const chainId = 10;
        try{
        const result = await helper.getL2Supply(blockNumber, chainId, findings, getL1Alerts)
        }catch(e){
            console.log(e);
        }
    });

   
})