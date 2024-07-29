import { NetworkManager } from "forta-agent-tools";
import {
  CONFIGURATOR_PROXY,
  CONFIGURATOR_PROXY_ARB,
  USDC_TOKEN_ETH,
  USDC_TOKEN_ARB,
} from "./constants";
import { ethers } from "forta-agent";

interface NetworkData {
  address: string;
  num: number;
}

export const addressManager = {};

export const data: Record<number, NetworkData> = {
  1: {
    address: USDC_TOKEN_ETH,
    num: 1,
  },
  42161: {
    address: USDC_TOKEN_ARB,
    num: 2,
  },
};

export const getAddress = async (provider: ethers.providers.Provider) => {
  const networkManager = new NetworkManager(data);
  await networkManager.init(provider);
  return networkManager.get("address");
};

export const getConfigurator = async (chainId: number) => {
  if (chainId == 1) {
    return CONFIGURATOR_PROXY;
  } else if (chainId == 42161) {
    return CONFIGURATOR_PROXY_ARB;
  }
};
