import {nat, Opt, Principal, Variant} from "azle";
import {TokenMetadata} from "./types";
import {TxEvent} from "./state-types";

export type TokenMetadataResponseDto = Variant<{
    Ok?: Opt<TokenMetadata>,
    Err?: Opt<string>
}>;

export type TokenMetadataArrResponseDto = Variant<{
    Ok?: Opt<TokenMetadata[]>,
    Err?: Opt<string>
}>;

export type VoidResponseDto = Variant<{
    Ok?: Opt<nat>,
    Err?: Opt<string>
}>;

export type NatResponseDto = Variant<{
    Ok?: Opt<nat>,
    Err?: Opt<string>
}>

export type NatArrResponseDto = Variant<{
    Ok?: Opt<nat[]>,
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