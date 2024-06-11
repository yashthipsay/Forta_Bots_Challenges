import { Contract, ContractRunner, ethers, Provider } from "ethers";
 
import { COMPUTED_INIT_CODE_HASH, UNISWAP_FACTORY_ADDRESS, UNISWAP_PAIR_ABI } from "./utils";
import {getCreate2Address} from "@ethersproject/address";



export default class Retrieval{
    private provider: Provider;

    constructor(provider: Provider){
        this.provider = provider;
    }

    public getUniswapPairCreate2Address  (
        token0: string,
        token1: string
    ): string  {
        const salt = ethers.solidityPackedKeccak256(["address", "address"], [token0, token1]);
        return getCreate2Address(UNISWAP_FACTORY_ADDRESS, salt, COMPUTED_INIT_CODE_HASH);

    }

    public async isValidUniswapPair(
        pairAddress: string,
        block: number,
        pancakeFactoryAddr: string,
        init: string
    ): Promise<[boolean, string, string]> {
        const pairContract = new Contract(pairAddress, UNISWAP_PAIR_ABI, this.provider);
        let token0Address: string, token1Address: string;
        try{
            token0Address = await pairContract.token0();
            token1Address = await pairContract.token1();
        }catch {
            return [false, "", ""];
        }

        const tokenPair = this.getUniswapPairCreate2Address(token0Address, token1Address);
        const isValid = tokenPair.toLowerCase() === pairAddress.toLowerCase() ? true : false;

        return [isValid, token0Address.toLowerCase(), token1Address.toLowerCase()];
    } 

    }
