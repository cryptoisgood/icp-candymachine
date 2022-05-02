import {Canister, CanisterResult, ic, Query, nat32, Opt, nat, Principal} from 'azle';

// type dip721Canister = Canister<{
//     balanceOf(principal: Principal): CanisterResult<Opt<nat>>;
//     ownerOf(tokenId: nat): CanisterResult<Opt<Principal>>;
//     tokenURI(tokenId: nat): CanisterResult<Opt<string>>;
//     name(): CanisterResult<string>;
//     symbol(): CanisterResult<string>;
//     isApprovedForAll(owner: Principal, operator: Principal): CanisterResult<boolean>;
//     approve(to: Principal, tokenId: nat): CanisterResult<void>;
//     getApproved(tokenId: nat): CanisterResult<Principal>;
//     setApprovalForAll(op: Principal, isApproved: boolean): CanisterResult<void>;
//     transferFrom(from: Principal, to: Principal, tokenId: nat): CanisterResult<void>;
//     mint(uri: string): CanisterResult<nat>;
// }>;

export function getNat32(): Query<nat32> {
    return 4294967295;
}

export function printNat32(nat32: nat32): Query<nat32> {
    ic.print(typeof nat32);
    return nat32;
}