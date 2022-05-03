import {CanisterResult, ic, Init, nat, Opt, PostUpgrade, PreUpgrade, Principal, Query, Update, UpdateAsync} from 'azle';
import {TokenIdPrincipal, TokenIdToMetadata, TokenMetadata} from "./types";
import {CanisterStatusResult, Management} from 'azle/canisters/management';
import {OperatorNotFound, OwnerNotFound, SelfApprove, TokenNotFound, UnauthorizedOwner} from "./constants";
import {Metadata, StableStorage, Stats, TxDetails, TxEvent} from "./state-types";
import {BoolResponseDto, NatResponseDto, PrincipalResponseDto, TokenMetadataResponseDto} from "./response-type";

const tokens = new Map<nat, TokenMetadata>();
const ownerList = new Map<Principal, nat[]>();
const operators = new Map<Principal, nat[]>();
const txRecords: TxEvent[] = []
let metadataObj: Metadata = {
    name: "SampleNft",
    symbol: "SNFT",
    logo: "http://127.0.0.1:8000/TechisGood.png?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai",
    custodians: [ic.id(), "rwlgt-iiaaa-aaaaa-aaaaa-cai", "rrkah-fqaaa-aaaaa-aaaaq-cai"]
};

export const ManagementCanister = ic.canisters.Management<Management>('aaaaa-aa');

export function init(): Init {
    ic.stableStorage<StableStorage>().tokenPk = 0n;
    ic.stableStorage<StableStorage>().ledger = {
        tokensEntries: [],
        ownersEntries: [],
        operatorsEntries: [],
        txRecordsEntries: []
    }
}

export function preUpgrade(): PreUpgrade {
    const ledger = {
        tokensEntries: [],
        ownersEntries: [],
        operatorsEntries: [],
        txRecordsEntries: []
    };

    ledger.tokensEntries =
        _mapToArray<nat, TokenMetadata>(tokens, (key, val) => {
            return {tokenId: key, tokenMetadata: val} as TokenIdToMetadata;
        } );

    ledger.ownersEntries =
        _mapToArray<Principal, nat[]>(ownerList, (key, val) => {
            return {principal: key, tokenIds: val} as TokenIdPrincipal;
        });

    ledger.operatorsEntries =
        _mapToArray<Principal, nat[]>(operators, (key, val) => {
            return {principal: key, tokenIds: val} as TokenIdPrincipal;
        });

    ledger.txRecordsEntries = [...txRecords]

    ic.stableStorage<StableStorage>().ledger = ledger;
    ic.stableStorage<StableStorage>().metadata = metadataObj;
}

export function postUpgrade(): PostUpgrade {
    const ledger = ic.stableStorage<StableStorage>().ledger;
    for (let tokenURIEntry of ledger.tokensEntries) {
        tokens.set(tokenURIEntry.tokenId, tokenURIEntry.tokenMetadata);
    }

    for (let ownersEntry of ledger.ownersEntries) {
        ownerList.set(ownersEntry.principal, ownersEntry.tokenIds);
    }

    for (let operatorEntries of ledger.operatorsEntries) {
        operators.set(operatorEntries.principal, operatorEntries.tokenIds);
    }

    for (let txRecordsEntry of ledger.txRecordsEntries) {
        txRecords.push(txRecordsEntry);
    }
    metadataObj = ic.stableStorage<StableStorage>().metadata;
    ic.stableStorage<StableStorage>().ledger = {
        tokensEntries: [],
        ownersEntries: [],
        operatorsEntries: [],
        txRecordsEntries: []
    }
    delete ic.stableStorage<StableStorage>().metadata;
}

// export function http_request(req: HttpRequest): Query<HttpResponseDto> {
//     return {
//         Ok: {
//             upgrade: false,
//             status_code: 200,
//             headers: [],
//             body: Array.from(toUTF8Array("abc")),
//             streamingStrategy: null
//         }
//     }
// }


export function metadata(): Query<Metadata> {
    return metadataObj;
}

export function name() : Query<string> {
    return metadataObj.name;
}

export function symbol() : Query<string> {
    return metadataObj.symbol;
}

export function logo(): Query<string> {
    return metadataObj.logo;
}

export function custodians(): Query<Principal[]> {
    return metadataObj.custodians;
}

export function setName(name: string): Update<void> {
    _isCanisterCustodian();
    metadataObj.name = name;
}

export function setLogo(logo: string): Update<void> {
    _isCanisterCustodian();
    metadataObj.logo = logo;
}

export function setSymbol(symbol: string): Update<void> {
    _isCanisterCustodian();
    metadataObj.symbol = symbol;
}

export function setCustodians(custodians: Principal[]): Update<void> {
    _isCanisterCustodian();
    metadataObj.custodians = custodians
}

export function* cycles(): UpdateAsync<Opt<nat>> {
    const canisterStatusResult: CanisterResult<CanisterStatusResult> = yield ManagementCanister.canister_status({
        canister_id: ic.id()
    });
    if (canisterStatusResult.ok === undefined) {
        return null;
    }

    return canisterStatusResult.ok.cycles;
}

export function totalUniqueHolders(): Query<Opt<nat>> {
    return _totalUniqueHolders();
}

export function* stats(): UpdateAsync<Stats> {
    const canisterStatusResult: CanisterResult<CanisterStatusResult> = yield ManagementCanister.canister_status({
        canister_id: ic.id()
    });
    return {
        total_transactions: _totalTransaction(),
        total_supply: _totalSupply(),
        cycles: canisterStatusResult.ok.cycles,
        total_unique_holders: totalUniqueHolders()
    }
}

export function supportedInterfaces(): Query<string[]> {
    return ["Approval", "Mint", "Burn", "TransactionHistory"];
}

export function balanceOf(p: Principal): Query<NatResponseDto> {
    const owner = ownerList.get(p);
    return owner ?
        {
            Ok: BigInt(owner.length)
        } :
        {
            Err: OwnerNotFound
        };
}

export function ownerOf(tokenId: nat): Query<PrincipalResponseDto> {
    const token = tokens.get(tokenId);
    return token ?
        {
            Ok: token.owner
        } :
        {
            Err: OwnerNotFound
        };
}

export function operatorOf(tokenId: nat): Query<PrincipalResponseDto> {
    const ope = _operatorOf(tokenId);
    return ope.length === 0 ? {
        Err: OperatorNotFound
    } : {
        Ok: ope
    }
}

export function ownerTokenMetadata(owner: Principal): Query<PrincipalResponseDto> {
    const meta = _getOwnersTokenMetadata(owner);
    return meta.length === 0 ? {
        Err: TokenNotFound
    } : {
        Ok: meta[0].owner
    };
}

export function operatorTokenIdentifiers(owner: Principal): Query<PrincipalResponseDto> {
    const meta = _getOwnersTokenMetadata(owner);
    return meta.length === 0 ? {
        Err: TokenNotFound
    } : {
        Ok: meta[0].operator
    };
}

export function tokenMetadata(tokenId: nat): Query<TokenMetadataResponseDto> {
    if (tokens.has(tokenId)) {
        return {
            Ok: tokens.get(tokenId)
        }
    }

    return {
        Err: TokenNotFound
    }
}

export function isApprovedForAll(owner : Principal, operator : Principal): Query<BoolResponseDto> {
    try {
        return {
            Ok: _isApprovedForAll(owner, operator)
        }
    }catch (e) {
        return {
            Err: e
        }
    }
}

export function approve(approvedBy : Principal, tokenId : nat) : Update<NatResponseDto>{
    const caller = ic.caller();
    if (caller === approvedBy) {
        return {
            Err: SelfApprove
        };
    }

    const owners = ownerList.get(approvedBy);
    if (!owners && owners.length > 0) {
        return {
            Err: OwnerNotFound
        }
    }

    const token = tokens.get(tokenId);
    if (!token) {
        return {
            Err: TokenNotFound
        }
    }

    const owner = token.owner;
    if (owner !== caller) {
        return {
          Err: UnauthorizedOwner
        };
    }
    const tokenOperator = _operatorOf(tokenId);
    try {
        _updateOperatorCache(tokenId, tokenOperator, approvedBy);
    }catch (e) {
        return {
            Err: e
        };
    }


    _approve(approvedBy, tokenId, caller);
    const transaction = _addTransaction(caller, "approve", [
        {operator: caller},
        {token_identifier: tokenId}
    ]);

    return {
        Ok: transaction
    };

}

export function setApprovalForAll(op : Principal, isApproved : boolean): Update<NatResponseDto> {
    const caller = ic.caller();
    if (caller != op) {
        return {
            Err: SelfApprove
        };
    }

    const tokMeta: TokenMetadata[] = _getOwnersTokenMetadata(caller);
    for (let tokenMetadatum of tokMeta) {
        const operator = tokenMetadatum.operator;
        const newOperator = isApproved ? op : null;
        _updateOperatorCache(tokenMetadatum.token_identifier, operator, newOperator);
        _approve(caller, tokenMetadatum.token_identifier, newOperator);
    }

    return {
        Ok: _addTransaction(caller, "setApprovalForAll", [
            {operator: op},
            {is_approved: isApproved}
        ])
    }
}

export function getApproved(tokenId: nat): Update<Principal> {
    const appr = _getApproved(tokenId);
    if (appr) {
        return appr;
    }

    ic.trap("None Approved");
}

export function transferFrom(from : Principal, to : Principal, tokenId : nat): Update<void> {
    const caller = ic.caller();
    isTrue(_isApprovedOrOwner(caller, tokenId), "transfer from is not approved or owner");
    _transfer(from, to, tokenId);
}

export function mint(uri: string): Update<nat> {
    const caller = ic.caller();
    const stableMemory = ic.stableStorage<StableStorage>();
    const custodians = stableMemory.metadata.custodians;
    isTrue(custodians.includes(caller), "only admins can run this method");
    stableMemory.tokenPk += 1n;
    const token = ic.stableStorage<StableStorage>().tokenPk;
    _mint(caller, token, {
        token_identifier: token,
        owner: caller,
        operator: null,
        properties: [
            {"location": uri}
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

function _totalUniqueHolders() {
    return ownerList.size ? BigInt(ownerList.size) : null;
}

function _totalTransaction(): nat {
    return BigInt(txRecords.length);
}

function _totalSupply(): nat {
    return BigInt(tokens.size)
}

function _isCanisterCustodian() {
    const caller = ic.caller();
    if (!metadataObj.custodians.includes(caller)) {
        ic.trap("Caller is not an custodian of canister");
    }
}

function _operatorOf(tokenId: nat): Principal | undefined {
    return tokens.get(tokenId)?.operator
}

function _updateOperatorCache(tokenId: nat, oldOperator: Principal, newOperator: Principal) {
    const oldOperatorTokenIdentifiers = operators.get(oldOperator);
    if (!oldOperatorTokenIdentifiers || oldOperatorTokenIdentifiers.length === 0) {
        throw OperatorNotFound;
    }
    const mutatedArr = oldOperatorTokenIdentifiers.filter(x => x !== tokenId);
    if (mutatedArr.length === 0) {
        operators.delete(oldOperator);
    } else {
        operators.set(oldOperator, mutatedArr);
    }

    const newOperatorSet = operators.get(newOperator);
    if (newOperatorSet) {
        newOperatorSet.push(tokenId)
    } else {
        operators.set(newOperator, [tokenId]);
    }
}

function _addTransaction(caller: Principal, operation: string, details: TxDetails[]): nat {
    txRecords.push({
       time: ic.time(),
       operation,
       details,
       caller
    });

    return BigInt(txRecords.length);
}


function _isApprovedForAll(owner : Principal, operator : Principal) : boolean {
    const tokensMetadata = _getOwnersTokenMetadata(owner);
    if (tokensMetadata) {
        const approvedTokens = tokensMetadata.filter(x => x.operator === operator);
        return approvedTokens.length === tokensMetadata.length;
    } else {
        throw TokenNotFound;
    }
}

function _getOwnersTokenMetadata(owner: Principal): TokenMetadata[] {
    const tokensOwned = ownerList.get(owner);
    if (tokensOwned) {
        return tokensOwned.map(x => tokens.get(x));
    } else {
        return [];
    }
}

function _approve(to: Principal, tokenId: nat, newOperator?: Opt<Principal>) {
    const token = tokens.get(tokenId);
    token.approved_at = ic.time();
    token.approved_by = to;
    if (newOperator) token.operator = newOperator;
    tokens.set(tokenId, token);
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
    return ownerList.has(tokenId);
}

function _transfer(from: Principal, to: Principal, tokenId: nat) {
    isTrue(_exists(tokenId), "token id does not exist for _transfer");
    isEqual(_ownerOf(tokenId), from, "trying to transfer a token they do not own");
    _removeApprove(tokenId);
    _decrementBalance(from);
    _incrementBalance(to);
    ownerList.set(tokenId, to);
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
    ownerList.set(tokenId, to);
    tokens.set(tokenId, metadata);
}

function _mapToArray<key, val>(map: Map<key, val>, transformer): []{
    const resp = [];
    for (let key of map.keys()) {
        resp.push(transformer(key, map.get(key)))
    }
    return [];
}