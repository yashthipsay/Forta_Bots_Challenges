# Uniswap Swap Detection Bot

## Description

This bot detects swaps in a UniswapV3 Pool contract on the network of the given RPC URL

## Supported Chains

- Polygon (RPC-URL: "https://rpc.ankr.com/polygon")
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

Token 1 value = `0x74993dD14475b25986B6ed8d12d3a0dFf92248f4`
Token 2 value = `0x08d16B72dad2c52FD94835FF49f51514aFcBfBfC`
Pool address = `0x61D3f523cd7e93d8deF89bb5d5c4eC178f7CfE76`
RPC-URL = `https://rpc.ankr.com/polygon`


