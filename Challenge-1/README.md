# Large Tether Transfer Agent

## Description

This bot detects bot creation and bot updation on different chains

## Supported Chains

- Ethereum
- Polygon

## Alerts

Describe each of the type of alerts fired by this agent

- BOT-1
  - Fired when the bot creation function is called i.e. when a bot is created by the deployer address
  - Severity is always set to "low" as only bot is being created
  - Type is always set to "info" 
  - Metadata field include the address of the deployer who created the bot.

- BOT-2
  - Fired when the bot creation function is called i.e. when a bot is updated by the deployer address
  - Severity is always set to "low" as only bot is being updated
  - Type is always set to "info" 
  - Metadata field include the address of the deployer who created the bot.

## Test Data

The agent behaviour can be verified with the following transactions:

- 

0x6a72649c16d5246a207abdef78c8ce2148ed67c6c8a672bdac85e4c6ea2bdac8(tx Hash for `Create Agent` function)
