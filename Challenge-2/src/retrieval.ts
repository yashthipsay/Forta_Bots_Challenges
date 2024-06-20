import { Contract, ContractRunner, Provider } from "ethers";
import { ethers } from "forta-agent";
 
import { COMPUTED_INIT_CODE_HASH, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";
import {getCreate2Address} from "@ethersproject/address";



export default class Retrieval{
    private provider: ethers.providers.Provider;

    constructor(provider: ethers.providers.Provider){
        this.provider = provider;
    }

    public getUniswapPairCreate2Address  (
        factoryAbi: string,
        token0: string,
        token1: string,
        initCode: string
    ): string  {
        const salt = ethers.utils.solidityKeccak256(["address", "address"], [token0, token1]);
        return getCreate2Address(factoryAbi, salt, initCode);

    }

    public async isValidUniswapPair(
        pairAddress: string,
        block: number,
        uniswapFactoryAddr: string,
        init: string
    ): Promise<[boolean, string, string]> {
        const pairContract = new ethers.Contract(pairAddress, UNISWAP_PAIR_ABI, this.provider);
        let token0Address: string, token1Address: string;
        
            [token0Address, token1Address] = await Promise.all([
                pairContract.token0(),
                pairContract.token1()
            ]);
        

        const tokenPair = this.getUniswapPairCreate2Address(UNISWAP_FACTORY_ADDRESS, token0Address, token1Address, COMPUTED_INIT_CODE_HASH);
        const isValid = tokenPair.toLowerCase() === pairAddress.toLowerCase() ? true : false;
        console.log("tokenPair", tokenPair, pairAddress);

        return [isValid, token0Address.toLowerCase(), token1Address.toLowerCase()];
    } 

    }

