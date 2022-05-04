import {nat, Opt, Principal, Stable, Variant} from "azle";
import {TokenIdPrincipal, TokenIdToMetadata} from "./types";

export type StableStorage = Stable<{
    metadata?: Opt<Metadata>,
    ledger?: Opt<Ledger>
}>;

export type Ledger = Variant<{
    tokensEntries?: Opt<TokenIdToMetadata[]>
    ownersEntries?: Opt<TokenIdPrincipal[]>
    operatorsEntries?: Opt<TokenIdPrincipal[]>
    txRecordsEntries?: Opt<TxEvent[]>
}>;

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

export type Metadata = Variant<{
    custodians?: Opt<Principal[]>
    logo?: Opt<string>
    name?: Opt<string>
    symbol?: Opt<string>
}>;

export type Stats = Variant<{
    total_transactions: nat,
    total_supply: nat,
    cycles: nat,
    total_unique_holders: nat
}>;