import { ethers } from "forta-agent";


export function calculatePercentage(percentageLimit: ethers.BigNumber, kink: ethers.BigNumber) {
    return kink.mul(percentageLimit).div(ethers.BigNumber.from(10).pow(18))
}