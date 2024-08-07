import {
  USDC_TOKEN_POLYGON,
  USDC_TOKEN_ETH,
  CONFIGURATOR_PROXY,
  CONFIGURATOR_PROXY_POLYGON,
} from "./constants";
import { NetworkData } from "./types";

type BotConfig = Record<number, NetworkData>;

const CONFIG: BotConfig = {
  1: {
    usdc: USDC_TOKEN_ETH,
    configurationProxy: CONFIGURATOR_PROXY,
  },
  42161: {
    usdc: USDC_TOKEN_POLYGON,
    configurationProxy: CONFIGURATOR_PROXY_POLYGON,
  },
};

export default CONFIG;
