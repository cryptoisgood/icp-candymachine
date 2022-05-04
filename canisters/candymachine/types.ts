import {Variant, Principal, nat, Opt} from "azle";

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

export type propertyVariant = Variant<{
    location?: Opt<string>
    contentType?: Opt<string>
    thumbnail?: Opt<string>
}>;

export type TokenMetadata = {
    token_identifier: nat,
    owner: Principal,
    operator?: Opt<Principal>,
    properties: propertyVariant[],
    is_burned: boolean,
    minted_at: nat,
    minted_by: Principal,
    transferred_at?: Opt<nat>,
    transferred_by?: Opt<Principal>,
    approved_at?: Opt<nat>,
    approved_by?: Opt<Principal>,
    burned_at?: Opt<nat>,
    burned_by?: Opt<Principal>
};