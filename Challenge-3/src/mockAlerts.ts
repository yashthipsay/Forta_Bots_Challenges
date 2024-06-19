import {getAlerts} from "forta-agent";


export const getL1Alerts = async (blockNumber: number) => {
    return await getAlerts( {
        botIds: ["0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612"],
        alertId: "L1 Escrow amount",
        first: 1,
        blockNumberRange: {
            startBlockNumber: blockNumber,
            endBlockNumber: blockNumber,
        }
    });
}