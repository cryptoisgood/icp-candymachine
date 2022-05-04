import {nat, Opt, Principal, Stable, Variant} from "azle";
import {TokenIdPrincipal, TokenIdToMetadata} from "./types";

export type StableStorage = Stable<{
    metadata?: Opt<Metadata>,
    ledger?: Opt<Ledger>
}>;

export type Ledger = {
    tokensEntries: TokenIdToMetadata[],
    ownersEntries: TokenIdPrincipal[],
    operatorsEntries: TokenIdPrincipal[],
    txRecordsEntries: TxEvent[]
};

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

export type Metadata = {
    custodians: Principal[],
    logo: string,
    name: string,
    symbol: string
};
export type Stats = {
    total_transactions: nat,
    total_supply: nat,
    cycles: nat,
    total_unique_holders: nat
};