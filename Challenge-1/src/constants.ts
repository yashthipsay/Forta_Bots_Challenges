export const CREATE_BOT_FUNCTION =
  "function registerAgent(uint256 agentId, string metadata, uint256[] chainIds) public";

export const UPDATE_BOT_FUNCTION =
  "function updateAgent(uint256 agentId, string metadata, uint256[] chainIds) public";

export const BOT_CREATION_HOOK =
  "function _beforeAgentUpdate(uint256 agentId, string newMetadata, uint256[] newChainIds) internal virtual";

export const BOT_DEPLOYED_ADDRESS =
  "0x61447385B019187daa48e91c55c02AF1F1f3F863";

export const NETHERMIND_DEPLOYER_ADDRESS =
  "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";