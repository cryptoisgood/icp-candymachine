import {nat, Opt, Principal, Variant} from "azle";
import {TokenMetadata} from "./types";

export type TokenMetadataResponseDto = Variant<{
    Ok?: Opt<TokenMetadata>,
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

export type PrincipalResponseDto = Variant<{
    Ok?: Opt<Principal>,
    Err?: Opt<string>
}>;

export type BoolResponseDto = Variant<{
    Ok?: Opt<boolean>,
    Err?: Opt<string>
}>;