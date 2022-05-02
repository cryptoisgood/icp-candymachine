import {Canister, CanisterResult, ic, Query, nat32} from 'azle';


// type DB = Canister<{
//     graphql_query(query: string, params: string): CanisterResult<string>;
//     graphql_mutation(query: string, params: string): CanisterResult<string>;
// }>;
//
// let db = ic.canisters.DB<DB>('r7inp-6aaaa-aaaaa-aaabq-cai');

export function getNat32(): Query<nat32> {
    return 4294967295;
}

export function printNat32(nat32: nat32): Query<nat32> {
    ic.print(typeof nat32);
    return nat32;
}