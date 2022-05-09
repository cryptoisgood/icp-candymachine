import {candymachine} from "../../declarations/candymachine";

export const maxTokens = async (): Promise<any> => {
    return candymachine.maxTokens();
}

export const leftToMint = async (): Promise<any> => {
    return candymachine.currentlyMinting();
}

export const isInit = async (): Promise<boolean> => {
    return candymachine.isInit();
}