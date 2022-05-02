import {Stable, Variant, Principal, nat} from "azle";

// export type TokenId = nat;

export type StringOptional = Variant<string | undefined>;

export type TokenIdToUri = Variant<{
    tokenId?: nat;
    uri?: string;
}>;

export type TokenIdPrincipal = Variant<{
    tokenId?: nat;
    principal?: Principal;
}>;

export type PrincipalNatVariant = Variant<{
    principal?: Principal;
    balance?: nat;
}>;

export type OperatorApprovalVariant = Variant<{
    principal?: Principal
    principals?: Principal[]
}>;

export type StableStorage = Stable<{
    tokenPk: nat,
    tokenURIEntries: TokenIdToUri[],
    ownersEntries: TokenIdPrincipal[],
    balancesEntries: PrincipalNatVariant[],
    tokenApprovalsEntries: TokenIdPrincipal[],
    operatorApprovalsEntries: OperatorApprovalVariant[]
}>;