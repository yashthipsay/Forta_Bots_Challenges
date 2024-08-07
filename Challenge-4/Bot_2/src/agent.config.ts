import { Network } from "forta-agent";
import { USDC_TOKEN_POLYGON, USDC_TOKEN_ETH } from "./constants";
import { NetworkData } from "./types";

type BotConfig = Record<number, NetworkData>;

const CONFIG: BotConfig = {
  1: {
    usdc: USDC_TOKEN_ETH,
    configurationProxy: 1,
  },
  42161: {
    usdc: USDC_TOKEN_POLYGON,
    configurationProxy: 2,
  },
};

export default CONFIG;
