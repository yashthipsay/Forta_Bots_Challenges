# Uniswap Swap Detection Bot

## Description

This bot detects swaps in a UniswapV3 Pool contract on the network of the given RPC URL

## Supported Chains

- Polygon 
- Ethereum (default)


## Alerts

Describe each of the type of alerts fired by this agent

- UNISWAP_SWAP_EVENT
  - Fired when a swap takes place emitting a Swap event
  - Severity is set to "low" as it is only meant to give us information
  - Type is always set to "info" 
  - In the metadata field, the validity of the token pair is mentioned

## Test Data

The bot behaviour can be verified with the following addresses:

Txn Hash - `0x76eda3e5118fda2ec63ba850da54f9305c11a4712715180c8a97a54f2340b8fa`


