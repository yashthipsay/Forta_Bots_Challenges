import { getAlerts } from "forta-agent"


export const getL1Alerts = async (botId: string) => {
    return await getAlerts({
        botIds: [botId],
        alertIds: ["L2 INVARIANT"],
        first: 1,
    })
}