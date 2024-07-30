   // const cometContract = new ethers.Contract(assetToken, [UTILIZATION], provider)
    // // console.log(cometContract);
    // const getUtilization = await cometContract.getUtilization(
    // );

    // try {
    //   const configurationContract = new ethers.Contract(CONFIGURATOR_PROXY, CONFIGURATION_ABI, provider);
    //   const configuration = await configurationContract.getConfiguration(CONFIGURATOR);
    //   console.log(configuration);
    // } catch (error) {
    //   console.error("Error fetching configuration:", error);
    // }

    // try{
    //   const borrowRate = new ethers.Contract(assetToken, ["function getBorrowRate(uint utilization) public view returns (uint64)"], provider)
    //   const getBorrowRate = await borrowRate.getBorrowRate(getUtilization);
    // }catch (error){
    //   console.log(error);
    // }