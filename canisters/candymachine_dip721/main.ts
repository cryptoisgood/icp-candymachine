import {ic, Query, nat, Principal, Update, Init, PreUpgrade, PostUpgrade, Opt, nat8} from 'azle';
import {
    Metadata,
    PrincipalNatVariant,
    StableStorage,
    TokenIdPrincipal,
    TokenIdToMetadata,
    TokenMetadata
} from "./types";
import {isEqual, isFalse, isTrue, notEqual} from "./safeAssert";

const _metadata: Metadata = {
    name: "SampleNft",
    symbol: "SNFT",
    logo: "",
    custodians: []
}

const whiteList = new Set<Principal>()
const tokens  = new Map<nat, TokenMetadata>();
const owners  = new Map<nat, Principal>();
const balances  = new Map<Principal, nat>();
const tokenApprovals  = new Map<nat, Principal>();
const operatorApprovals  = new Map<Principal, Principal[]>();

export function init(): Init {
    ic.stableStorage<StableStorage>().tokenPk = 0n;
    ic.stableStorage<StableStorage>().tokens = [];
    ic.stableStorage<StableStorage>().ownersEntries = [];
    ic.stableStorage<StableStorage>().balancesEntries = [];
    ic.stableStorage<StableStorage>().tokenApprovalsEntries = [];
    ic.stableStorage<StableStorage>().operatorApprovalsEntries = [];
}

export function preUpgrade(): PreUpgrade {
    ic.stableStorage<StableStorage>().tokens =
        _mapToArray<nat, TokenMetadata>(tokens, (key, val) => {
            return {tokenId: key, tokenMetadata: val} as TokenIdToMetadata;
        } );

    ic.stableStorage<StableStorage>().ownersEntries =
        _mapToArray<nat, Principal>(owners, (key, val) => {
            return {tokenId: key, principal: val} as TokenIdPrincipal;
        });

    ic.stableStorage<StableStorage>().balancesEntries =
        _mapToArray<Principal, nat>(balances, (key, val) => {
            return {principal: key, balance: val} as PrincipalNatVariant;
        });

    ic.stableStorage<StableStorage>().tokenApprovalsEntries =
        _mapToArray<nat, Principal>(tokenApprovals, (key, val) => {
            return {tokenId: key, principal: val} as TokenIdPrincipal;
        });

    ic.stableStorage<StableStorage>().operatorApprovalsEntries =
        _mapToArray<Principal, Principal[]>(operatorApprovals, (key, val) => {
            return {Principal: key, principals: val} as TokenIdPrincipal;
        });
}

export function postUpgrade(): PostUpgrade {
    for (let tokenURIEntry of ic.stableStorage<StableStorage>().tokens) {
        tokens.set(tokenURIEntry.tokenId, tokenURIEntry.tokenMetadata);
    }

    for (let ownersEntry of ic.stableStorage<StableStorage>().ownersEntries) {
        owners.set(ownersEntry.tokenId, ownersEntry.principal);
    }

    for (let balancesEntry of ic.stableStorage<StableStorage>().balancesEntries) {
        balances.set(balancesEntry.principal, balancesEntry.balance);
    }

    for (let tokenApprovalsEntry of ic.stableStorage<StableStorage>().tokenApprovalsEntries) {
        tokenApprovals.set(tokenApprovalsEntry.tokenId, tokenApprovalsEntry.principal)
    }

    for (let operatorApprovalsEntry of ic.stableStorage<StableStorage>().operatorApprovalsEntries) {
        operatorApprovals.set(operatorApprovalsEntry.principal, operatorApprovalsEntry.principals);
    }

    ic.stableStorage<StableStorage>().tokens = [];
    ic.stableStorage<StableStorage>().ownersEntries = [];
    ic.stableStorage<StableStorage>().balancesEntries = [];
    ic.stableStorage<StableStorage>().tokenApprovalsEntries = [];
    ic.stableStorage<StableStorage>().operatorApprovalsEntries = [];
}

export function balanceOf(p: Principal): Query<Opt<nat>> {
    return balances.get(p);
}

export function ownerOf(tokenId: nat): Query<Opt<Principal>> {
    return _ownerOf(tokenId);
}

export function metadata(): Query<Metadata> {
    return _metadata;
}

export function name() : Query<string> {
    return _metadata.name;
}

export function symbol() : Query<string> {
    return _metadata.symbol;
}

export function logo(): Query<string> {
    return _metadata.logo;
}

export function custodians(): Query<Principal[]> {
    return _metadata.custodians;
}

export function isApprovedForAll(owner : Principal, operator : Principal): Query<boolean> {
    return _isApprovedForAll(owner, operator);
}

export function approve(to : Principal, tokenId : nat) : Update<void>{
    const caller = ic.caller();
    const owner = _ownerOf(tokenId);
    if (!owner) {
        ic.trap("No owner for token");
    }

    if (owner === to && owner == caller && _isApprovedForAll(owner, caller)) {
        _approve(to, tokenId);
    }
}

export function getApproved(tokenId: nat): Update<Principal> {
    const appr = _getApproved(tokenId);
    if (appr) {
        return appr;
    }

    ic.trap("None Approved");
}

export function setApprovalForAll(op : Principal, isApproved : boolean): Update<void> {
    const caller = ic.caller();
    notEqual(caller, op, "caller not equal to op in set approval for all");

    if (isApproved) {
        if (operatorApprovals.has(caller)) {
            const opList = operatorApprovals.get(caller).filter((x) =>
                x != op
            );
            opList.push(op);
            operatorApprovals.set(caller, opList);
        } else {
            operatorApprovals.set(caller, [op]);
        }
    } else {
        if (operatorApprovals.has(caller)) {
            const opList = operatorApprovals.get(caller).filter((x) =>
                x != op
            );
            operatorApprovals.set(caller, opList);
        } else {
            operatorApprovals.set(caller, []);
        }
    }
}

export function transferFrom(from : Principal, to : Principal, tokenId : nat): Update<void> {
    const caller = ic.caller();
    isTrue(_isApprovedOrOwner(caller, tokenId), "transfer from is not approved or owner");
    _transfer(from, to, tokenId);
}

export function mint(image: nat8[]): Update<nat> {
    ic.stableStorage<StableStorage>().tokenPk += 1n;
    const token = ic.stableStorage<StableStorage>().tokenPk;
    const caller = ic.caller();
    _mint(caller, token, {
        token_identifier: token,
        owner: caller,
        operator: null,
        properties: [
            ["image", image]
        ],
        is_burned: false,
        minted_at: BigInt(Date.now()),
        minted_by: caller,
        transferred_at: null,
        transferred_by: null,
        approved_at: null,
        approved_by: null,
        burned_at: null,
        burned_by: null,
    });
    return token;
}


// private

function _ownerOf(tokenId : nat) : Principal {
    return owners.get(tokenId);
}
//
// function _tokenURI(tokenId : nat) : string {
//     return tokens.get(tokenId);
// }

function _isApprovedForAll(owner : Principal, operator : Principal) : boolean {
    if (operatorApprovals.get(owner)) {
        if (whiteList.has(operator)) {
            for (let allow of whiteList.values()) {
                if (allow === operator) {
                    return true;
                }
            }
        }
    }
    return false;
}

function _approve(to: Principal, tokenId: nat) {
    tokenApprovals.set(tokenId, to);
}

function _getApproved(tokenId : nat) : Principal {
    isTrue(_exists(tokenId), "token id does not exist for _getApproved");

    if (tokenApprovals.has(tokenId)) {
        return tokenApprovals.get(tokenId);
    }

    return;
}

function _hasApprovedAndSame(tokenId: nat, spender : Principal) : boolean {
    const v = _getApproved(tokenId);
    return v && v === spender;
}

function _isApprovedOrOwner(spender: Principal, tokenId: nat) : boolean {
    isTrue(_exists(tokenId), "token id does not exist for _isApprovedOrOwner");
    const owner = _ownerOf(tokenId);
    return spender === owner ||
        _hasApprovedAndSame(tokenId, spender) ||
        _isApprovedForAll(owner, spender);
}

function _exists(tokenId: nat): boolean {
    return owners.has(tokenId);
}

function _transfer(from: Principal, to: Principal, tokenId: nat) {
    isTrue(_exists(tokenId), "token id does not exist for _transfer");
    isEqual(_ownerOf(tokenId), from, "trying to transfer a token they do not own");
    _removeApprove(tokenId);
    _decrementBalance(from);
    _incrementBalance(to);
    owners.set(tokenId, to);
}

function _removeApprove(tokenId: nat) {
    tokenApprovals.delete(tokenId);
}

function _decrementBalance(address: Principal) {
    if (balances.has(address)) {
        const v = balances.get(address);
        if (v > 0) balances.set(address, v - 1n);
    } else {
        balances.set(address, 0n);
    }
}

function _incrementBalance(address: Principal) {
    if (balances.has(address)) {
        const v = balances.get(address);
        balances.set(address, v + 1n);
    } else {
        balances.set(address, 0n);
    }
}

function _mint(to: Principal, tokenId: nat, metadata: TokenMetadata) {
    isFalse(_exists(tokenId), "token id does not exist and can't be minted");
    _incrementBalance(to);
    owners.set(tokenId, to);
    tokens.set(tokenId, metadata);
}

function _mapToArray<key, val>(map: Map<key, val>, transformer): []{
    const resp = [];
    for (let key of map.keys()) {
        resp.push(transformer(key, map.get(key)))
    }
    return [];
}