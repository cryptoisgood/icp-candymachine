import {Stable, Variant, Principal, nat, Opt, nat8, nat32, int, nat64, int64, nat16, int16, int32, int8, float64, float32} from "azle";

// export type TokenId = nat;

export type TxEvent = {
    time: nat,
    caller: Principal,
    operation: string,
    details: TxDetails[]
}

export type TxDetails = Variant<{
    operator?: Opt<Principal>
    token_identifier?: Opt<nat>
    is_approved?: Opt<boolean>
    owner?: Opt<Principal>
    to?: Opt<Principal>
}>;
type GenericValue = Variant<{
    Nat64Content: nat64;
    Nat32Content : nat32;
    BoolContent : boolean;
    Nat8Content : nat8;
    Int64Content : int64;
    IntContent : int;
    NatContent : nat;
    Nat16Content : nat16;
    Int32Content : int32;
    Int8Content : int8;
    FloatContent : float64;
    Int16Content : int16;
    BlobContent : nat8[];
    Principal : Principal;
    TextContent : string;
}>;

export type propertyVariant = [string, GenericValue];

export type TokenMetadata = {
    transferred_at?: Opt<nat64>,
    transferred_by?: Opt<Principal>,
    owner: Principal,
    operator?: Opt<Principal>,
    properties: propertyVariant[],
    is_burned: boolean,
    token_identifier: nat,
    burned_at?: Opt<nat64>,
    burned_by?: Opt<Principal>
    approved_at?: Opt<nat64>,
    approved_by?: Opt<Principal>,
    minted_at: nat64,
    minted_by: Principal,
};

export type StableStorage = Stable<{
    custodians: Principal[],
    nftCanister: Principal,
    initMint: boolean
}>;