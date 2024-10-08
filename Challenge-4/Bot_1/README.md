# Compound Governance Monitoring Bot

## Description

The bot monitors different governance values that can change if a proposal is successfully executed. These changes can cause several relevant changes that can change the working of the protocol. The bot will monitor these changes and alert the user if any of the changes are detected.

## Supported Chains

- Ethereum
- Arbitrum

## Alerts

Describe each of the type of alerts fired by this agent

- GOV-1
  - Fired when the any of the governance proposal is changed in Compound V3 protocol e.g. `SetSupplyKink`, `setBorrowKink`, `setGovernor`, `setBorrowPerYearInterestRateBase`, `setSupplyPerYearInterestRateBase`, `UpdateAssetLiquidateCollateralFactor`, `UpdateAssetBorrowCollateralFactor`
  - Severity is always set to `Info` as it detects changes made to the protocol which do not involve any security risk.
  - Type is always set to `Info`
  - Metadata fields: 
    - Changed Events: List of events that are changed in the proposal:
      - `SUPPLY_KINK`: Old and new values only if Supply Kink is changed
      - `BORROW_KINK`: Old and new values only if Borrow Kink is changed
      - `SET_GOVERNOR`: Old and new values only if Governor is changed
      - `BORROW_PYIR`: Old and new values only if Borrow Per Year Interest Rate is changed
      - `SUPPLY_PYIR`: Old and new values only if Supply Per Year Interest Rate is changed
      - `LIQUIDATE_CF`: Old and new values only if Asset Liquidate Collateral Factor is changed
      - `BORROW_CF`: Old and new values only if Asset Borrow Collateral Factor is changed
    - Asset Data: Each token has a different Asset data. For example USDC token on Ethereum:
      - `"Collateral Asset - Compound": "0xc00e94Cb662C3520282E6f5717214004A7f26888"`,
      - `"Collateral Asset - Wrapped BTC": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"`,
      - `"Collateral Asset - Wrapped Ether": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"`,
      - `"Collateral Asset - Uniswap": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"`


## Test Data

The bot behaviour can be verified with the following transactions:

- [0x6c027d5d6b1ca59ebd3bfbc6128a090ed4bd2ed23453b8656daf2bbe9a6d8594](https://etherscan.io/tx/0x6c027d5d6b1ca59ebd3bfbc6128a090ed4bd2ed23453b8656daf2bbe9a6d8594) - `SUPPLY_KINK`, `BORROW_KINK`, `BORROW_PYIR`(Borrow per year Interest Rate) (Ethereum)
- [0x612b126dd0efdf62b43f12f9dfd3d10adb1c281c8edaba9b1ea2869a480aa060](https://arbiscan.io/tx/0x612b126dd0efdf62b43f12f9dfd3d10adb1c281c8edaba9b1ea2869a480aa060) - `SUPPLY_KINK`, `BORROW_KINK` (Arbitrum)
