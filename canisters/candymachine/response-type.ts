import {float32, nat, Opt, Principal, Variant} from "azle";
import {TokenMetadata, TxEvent} from "./types";


export type TokenMetadataResponseDto = Variant<{
    Ok?: Opt<TokenMetadata>,
    Err?: Opt<string>
}>;

export type StringResponseDto = Variant<{
    Ok?: Opt<string>,
    Err?: Opt<string>
}>;

export type NatResponseDto = Variant<{
    Ok?: Opt<nat>,
    Err?: Opt<string>
}>

export type FloatResponseDto = Variant<{
    Ok?: Opt<float32>,
    Err?: Opt<string>
}>

export type PrincipalResponseDto = Variant<{
    Ok?: Opt<Principal>,
    Err?: Opt<string>
}>;

export type BoolResponseDto = Variant<{
    Ok?: Opt<boolean>,
    Err?: Opt<string>
}>;

export type TxEventResponseDto = Variant<{
    Ok?: Opt<TxEvent>,
    Err?: Opt<string>
}>;