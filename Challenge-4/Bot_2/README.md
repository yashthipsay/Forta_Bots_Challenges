# Compound Bot for notifying ideal SupplyAPR and BorrowAPR

## Description

The bot monitors the liquidations and withrawals of USDC token per transaction and calculates the SupplyAPR and BorrowAPR for the Compound protocol. It notifies if the lender or borrower has transacted at the ideal SupplyAPR or BorrowAPR

## Supported Chains

- Ethereum
- Polygon

## Alerts

Describe each of the type of alerts fired by this bot

- SUPPLY-1
  - Fired when the Lender is incentivized to supply USDC at the ideal SupplyAPR
  - Severity is always set to "Info"
  - Type is always set to "info" 
  - Metadata fields: 
    - `SupplyRate`: The SupplyAPR at which the lender is incentivized to supply USDC
    - `Utilization`: The current Supply Kink rate of the Compound protocol

- BORROW-1
  - Fired when the Borrower is incentivized to borrow USDC at the ideal BorrowAPR
  - Severity is always set to "Info"
  - Type is always set to "info"
  - Metadata fields:
    - `BorrowRate`: The BorrowAPR at which the borrower is incentivized to borrow USDC
    - `Utilization`: The current Borrow Kink rate of the Compound protocol

## Test Data

The bot behavior can be verified with the following scenarios:
- Ethereum network: 
  - [0xa5a55153fbee01788702d495ddb370d96baf2190c3890d3df77e51e48b9af74a](https://etherscan.io/tx/0xa5a55153fbee01788702d495ddb370d96baf2190c3890d3df77e51e48b9af74a)

- Polygon network: 
  - [0xd4b697a8a2b60a0df3f2882ea5c765c9afcea158e2f0b0573c73a61f8c31f8c0](https://polygonscan.com/tx/0xd4b697a8a2b60a0df3f2882ea5c765c9afcea158e2f0b0573c73a61f8c31f8c0)