import {Stable, Variant, Principal, nat, Opt, int, int64, nat8} from "azle";

// export type TokenId = nat;

export type TokenIdToMetadata = Variant<{
    tokenId?: nat;
    tokenMetadata?: TokenMetadata;
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

export type propertyVariant = Variant<{
    location?: string
    contentType?: string
    thumbnail?: string
}>;

export type StableStorage = Stable<{
    tokenPk: nat,
    tokens: TokenIdToMetadata[],
    ownersEntries: TokenIdPrincipal[],
    balancesEntries: PrincipalNatVariant[],
    tokenApprovalsEntries: TokenIdPrincipal[],
    operatorApprovalsEntries: OperatorApprovalVariant[]
}>;

export type Metadata = {
    custodians: Principal[],
    logo: string,
    name: string,
    symbol: string
}

export type ResponseDto = Variant<{
    Ok?: Opt<TokenMetadata>,
    Err?: Opt<string>
}>;


export type TokenMetadata  = Variant<{
    token_identifier: int64,
    owner: Principal,
    operator?: Principal,
    properties: propertyVariant[],
    is_burned: boolean,
    minted_at: int64,
    minted_by: Principal,
    transferred_at?: int64,
    transferred_by?: Principal,
    approved_at?: int64,
    approved_by?: Principal,
    burned_at?: int64,
    burned_by?: Principal
}>