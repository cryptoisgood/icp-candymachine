import {nat, nat64, Principal, Stable, Variant} from "azle";
import {TokenIdPrincipal, TokenIdToMetadata} from "./types";

export type StableStorage = Stable<{
    tokenPk: nat,
    metadata: Metadata,
    ledger: Ledger
}>;

export type Ledger = Variant<{
    tokensEntries: TokenIdToMetadata[],
    ownersEntries: TokenIdPrincipal[],
    operatorsEntries: TokenIdPrincipal[],
    txRecordsEntries: TxEvent[]
}>;

export type TxEvent = Variant<{
    time: nat64,
    caller: Principal,
    operation: string,
    details: TxDetails[]
}>

export type TxDetails = Variant<{
    operator?: Principal
    token_identifier?: nat
    is_approved?: boolean
}>;

export type Metadata = Variant<{
    custodians: Principal[],
    logo: string,
    name: string,
    symbol: string
}>;

export type Stats = Variant<{
    total_transactions: nat,
    total_supply: nat,
    cycles: nat,
    total_unique_holders: nat
}>;