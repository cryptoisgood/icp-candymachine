import {NatResponseDto} from "../../candymachine/response-type";
import {candymachine} from "../../declarations/candymachine";
import {currentlyMinting} from "../../candymachine/main";


export const maxTokens = async (): Promise<any> => {
    return candymachine.maxTokens();
}

export const leftToMint = async (): Promise<any> => {
    return candymachine.currentlyMinting();
}