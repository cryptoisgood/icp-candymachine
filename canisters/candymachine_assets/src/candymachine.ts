import {candymachine} from "../../declarations/candymachine";
import {candymachine_dip721} from "../../declarations/candymachine_dip721";

export const maxTokens = async (): Promise<any> => {
    return candymachine.maxTokens();
}

export const leftToMint = async (): Promise<any> => {
    return candymachine_dip721.totalSupply();
}

export const isInit = async (): Promise<boolean> => {
    return candymachine.isInit();
}