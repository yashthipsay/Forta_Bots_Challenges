# Compound III Proposal


## Summary
    - Compound V3 protocol is a platform that enables its users to supply assets as collateral in return for the base asset. 
    - It also provides interests for supplying and borrowing assets from the pool it provides, depending upon the market conditions. 
    - Users are rewarded COMP tokens based on their contribution to the protocol. They are incentivsed for lending or borrwing in the form of Annual Percentage Rate, which is a result of the interest they receive based on the utilization of the supplied assets
    - The protocol is designed to be a decentralized platform, which is governed by the community. The community can propose and vote on changes to the protocol, which are then implemented by the developers.
    - The `Configurator.sol` has properties in a general config struct that can be changed by governance. Once a proposal is passed, the values are changed and anyone can call the `deploy()` function that creates a new comet instance

## Proposed Bots:
     - COMP01: CompoundV3 DAO Bot
        - This bot will monitor any changes that are done to the protocol by its community. It will keep track of the values changed through proposals. The change in values will be emitted through events in the `Configurator.sol` file.
        - The events that will be monitored are: 
             1. `event SetGovernor(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor);`

             2. `event SetSupplyKink(address indexed cometProxy,uint64 oldKink, uint64 newKink);`

             3. `event SetBorrowKink(address indexed cometProxy,uint64 oldKink, uint64 newKink);`

             4. `event SetBorrowPerYearInterestRateBase(address indexed cometProxy,uint64 oldIRBase, uint64 newIRBase);`

             5. `event SetSupplyPerYearInterestRateBase(address indexed cometProxy,uint64 oldIRBase, uint64 newIRBase);`

             6. `event UpdateAssetBorrowCollateralFactor(address indexed cometProxy, address indexed asset, uint64 oldBorrowCF, uint64 newBorrowCF);`
     
             7. `event UpdateAssetLiquidateCollateralFactor(address indexed cometProxy, address indexed asset, uint64 oldLiquidateCF, uint64 newLiquidateCF);`

         -This bot is beneficial as it will keep track of the changes made to the protocol, which will help the developers and organizations keep track of the changes made to the protocol and plan necessary actions accordingly.

     - COMP02: USDC Utilization Monitor Bot
     - This bot is designed to monitor the utilization factor or percentage of USDC, focusing specifically on the optimal utilization point, known as the "kink". 
     - The bot will categorize the utilization percentage into three distinct ranges and provide insights on the borrow and supply rates of USDC based on the current utilization. 
     - Additionally, it will issue alerts for significant changes in the utilization slope, especially when the utilization exceeds the optimal kink.

        - Utilization Percentage Ranges:
             1. Under-Utilization: Utilization percentage below 30%.
                 - Finding: Indicates a low demand for borrowing, potentially leading to lower borrow rates and higher supply rates.
                 
             2. Decent Utilization: Utilization percentage between 30% and 60%.
                 - Finding: Represents a balanced demand for borrowing, with moderate borrow and supply rates.
                 
             3. High Utilization: Utilization percentage exceeds 60%.
                 - Alert: Triggered when utilization is above 60%, indicating increasing demand for borrowing. This is critical as it approaches the kink at 85%.
                 
             4. Exceeding Kink: Utilization percentage reaches or exceeds 85%.
                 - Alert: A specific alert for when the utilization crosses the kink, indicating a significant change in the slope of borrow and supply rates due to high demand for liquidity. This scenario requires immediate attention as it may affect the liquidity pool's stability.

        - The bot will continuously monitor transactions and events related to the USDC liquidity pool on the Ethereum and Polygon network to calculate the current utilization percentage. It will use this data to determine the current range and issue findings or alerts accordingly.

        - Benefits:
             - Provides real-time insights into the demand for USDC borrowing on the Ethereum and Polygon network, helping liquidity providers and borrowers make informed decisions.
             - Alerts users to critical changes in market dynamics, particularly when utilization rates approach or exceed the kink, allowing for timely responses to optimize returns or mitigate risks.

        - This bot is an essential tool for stakeholders in the USDC market on the Scroll network, offering valuable data on market conditions and alerting to significant changes that could impact liquidity and rates.
          

  ## Proposed Solution:
     - COMP01: CompoundV3 DAO Bot
        - Initialize a `handleBlock` function as we would not be checking individual transactions, but blocks for any changes, which will be more efficient.
        - Detect for values changes on a single network and filter events that are triggered because of change in these values.
        - Create findings for each event seperately: 
          1. COMPOUND-1: Governor Change
          2. COMPOUND-2: Supply Kink Change
          3. COMPOUND-3: Borrow Kink Change
          4. COMPOUND-4: Borrow Interest Rate Base Change
          5. COMPOUND-5: Supply Interest Rate Base Change
          6. COMPOUND-6: Asset Borrow Collateral Factor Change
          7. COMPOUND-7: Asset Liquidate Collateral Factor Change
         - Create a thorough documentation of the findings and the changes made to the protocol, which will be beneficial for the developers and organizations to keep track of the changes made to the protocol.
         - Create a test suite to test the bot's functionality and ensure that it is working as expected.

     - COMP02: USDC Utilization Monitor Bot
        - Implement a script to monitor the utilization percentage of USDC.
        - Define the utilization ranges and corresponding actions for each range.
        - Set up alerts for utilization exceeding the optimal kink and provide detailed insights on the utilization slope.
        - Continuously monitor the utilization percentage and trigger alerts based on predefined thresholds.
        - The main property to be monitored here is the `getUtilization()` percentage. The formula for getUtilization is `totalBorrow + (FACTOR_SCALE/totalSupply)`. The `FACTOR_SCALE` is a constant value of 1e18.
        - The range of values where slope is low i.e. `uint public override immutable supplyPerSecondInterestRateSlopeLow` will be divided into 3 parts monitoring the utilization of each transaction, and then returning the mean utilization per block. Then a finding will be generated perblock denoting what range the utilization is in, and whether it is favourable to lend or borrow.
        - Develop a user-friendly interface to display utilization data, findings, and alerts for stakeholders.
        - Conduct thorough testing to validate the bot's functionality and ensure accurate utilization monitoring and alerting.
     
