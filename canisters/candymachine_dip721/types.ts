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

export type TokenMetadata  = {
    token_identifier: int64,
    owner: Opt<Principal>,
    operator: Opt<Principal>,
    is_burned: boolean,
    properties: [string, nat8[]][],
    minted_at: int64,
    minted_by: Principal,
    transferred_at: Opt<int64>,
    transferred_by: Opt<Principal>,
    approved_at: Opt<int64>,
    approved_by: Opt<Principal>,
    burned_at: Opt<int64>,
    burned_by: Opt<Principal>
}