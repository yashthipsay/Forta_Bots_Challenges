

export interface NetworkData {
  usdc: string;
  configurationProxy: string;
}

export type BotConfig = Record<number, NetworkData>;

export interface AlertType {
  function: string;
}
