import { Network } from "forta-agent";
import { USDC_TOKEN_ARB, USDC_TOKEN_ETH } from "./constants";

export interface NetworkData {
    usdc: string;
    configurationProxy:number;
}

type BotConfig = Record<number, NetworkData>;

const CONFIG: BotConfig = {
    1: {
        usdc: USDC_TOKEN_ETH,
        configurationProxy: 1,
    },
    42161: {
        usdc: USDC_TOKEN_ARB,
        configurationProxy: 2,
    }   

}

export default CONFIG;