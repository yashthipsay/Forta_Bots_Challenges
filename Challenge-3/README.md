# DAI Bridge Solvency Check Agent: MakerDAO Invariant

## Description

This agent monitors the solvency of the DAI bridge between Layer 1 (Ethereum) and Layer 2 networks (Optimism and Arbitrum). It checks if the DAI balance in the L1 escrow contracts is sufficient to cover the total supply of DAI on the L2 networks.

## Supported Chains

- Ethereum 
- Optimism 
- Arbitrum 

## Alerts

This bot can fire the following alerts:

- L1-ESCROW
  - Fired when the L1 escrow balance for a specific L2 network (Optimism or Arbitrum) is less than the total DAI supply on that L2 network
  - Severity is always set to "High"
  - Type is always set to "Exploit"
  - Metadata fields:
    - `l1Escrow`: The balance of DAI in the L1 escrow contract
    - `l2Supply`: The total supply of DAI on the L2 network
    - `protocol`: The L2 network name ("Optimism" or "Arbitrum")

- L2-SUPPLY
  - Fired to report the current balances of the L1 escrow contracts for both Optimism and Arbitrum
  - Severity is always set to "Info"
  - Type is always set to "Info"
  - Metadata fields:
    - `optEscBal`: The balance of DAI in the Optimism L1 escrow contract
    - `abtEscBal`: The balance of DAI in the Arbitrum L1 escrow contract

## Test Data

The agent behavior can be verified with the following scenarios:

- L1 (Ethereum):
  - Check the balances of the L1 escrow contracts for Optimism and Arbitrum
  - No specific transaction needed; the agent checks balances on each block
  - Example block number:  [20281172](https://etherscan.io/block/20281172)
  
- L2 (Optimism or Arbitrum):
  - Compare the total DAI supply on the L2 network with the corresponding L1 escrow balance
  - An alert will be fired if the L2 supply exceeds the L1 escrow balance
  - Example block number: [122538585](https://etherscan.io/block/122538585)
