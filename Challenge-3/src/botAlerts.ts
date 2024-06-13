import { Initialize } from "forta-agent"

const BOT_ID_1 = "0x1908ef6008007a2d4a3f3c2aa676832bbc42f747a54dbce88c6842cfa8b18612"


const initialize: Initialize = async () => {
    return {
        alertConfig: {
            subscriptions: [
                {
                    botId: BOT_ID_1,
                    alertIds: ["L2 INVARIANT"]
                }
            ]
        }
    }
}