# Compound Governance Monitoring Bot

## Description

The bot monitors different governance values that can change if a proposal is successfully executed. These changes can cause several relevant changes that can change the working of the protocol. The bot will monitor these changes and alert the user if any of the changes are detected.

## Supported Chains

- Ethereum
- Arbitrum

## Alerts

Describe each of the type of alerts fired by this agent

- GOV-1
  - Fired when the any of the governance proposal is changed in Compound V3 protocol i.e. `SetSupplyKink, setBorrowKink, setGovernor, setBorrowPerYearInterestRateBase, setSupplyPerYearInterestRateBase, UpdateAssetLiquidateCollateralFactor, UpdateAssetBorrowCollateralFactor`
  - Severity is always set to `Info` as it detects changes made to the protocol which do not involve any security risk.
  - Type is always set to `Info`
  - Metadata fields: 
      - `SUPPLY_KINK`: Old and new values only if Supply Kink is changed
      - `BORROW_KINK`: Old and new values only if Borrow Kink is changed
      - `SET_GOVERNOR`: Old and new values only if Governor is changed
      - `BORROW_PYIR`: Old and new values only if Borrow Per Year Interest Rate is changed
      - `SUPPLY_PYIR`: Old and new values only if Supply Per Year Interest Rate is changed
      - `LIQUIDATE_CF`: Old and new values only if Asset Liquidate Collateral Factor is changed
      - `BORROW_CF`: Old and new values only if Asset Borrow Collateral Factor is changed

## Test Data

The bot behaviour can be verified with the following transactions:

- [0x6c027d5d6b1ca59ebd3bfbc6128a090ed4bd2ed23453b8656daf2bbe9a6d8594](https://etherscan.io/tx/0x6c027d5d6b1ca59ebd3bfbc6128a090ed4bd2ed23453b8656daf2bbe9a6d8594) (for Ethereum Network), or [17375147](https://etherscan.io/block/17375147): block in which the transaction was included.
- [0x612b126dd0efdf62b43f12f9dfd3d10adb1c281c8edaba9b1ea2869a480aa060](https://arbiscan.io/tx/0x612b126dd0efdf62b43f12f9dfd3d10adb1c281c8edaba9b1ea2869a480aa060) (for Arbitrum network), or [163230017](https://arbiscan.io/block/163230017): block in which the transaction was included.
