import { BigNumber } from "@ethersproject/bignumber";
import {getAlerts} from "forta-agent";
import { Alert, AlertEvent } from "forta-agent";

const alert: Alert = {
    alertId: "L1_ESCROW",
    chainId: 1,
    hasAddress: () => true,
    metadata: {
        optEscBal: BigNumber,
        abtEscBal: BigNumber
    }

} 
export const L1Alert = async (blockNumber: number): Promise<AlertEvent> => {
    return {
        alert: alert,
        blockNumber: blockNumber,
        alertId: "L1_ESCROW",
        alertHash: "0x01",
        name: "L1_ESCROW_ALERT",
        hash: "",
        botId: "",
        transactionHash: "",
        blockHash: "",
        chainId: 1,
        hasAddress: () => true
    }
    
}