import {
    CanisterResult,
    ic,
    Init,
    nat,
    nat32, nat8,
    Migrate,
    Opt,
    PostUpgrade,
    PreUpgrade,
    Principal,
    Query,
    Update,
    UpdateAsync, Variant, nat64, int64, int, nat16, int32, int8, float64, int16
} from 'azle';
import {TokenIdPrincipal, TokenIdToMetadata, TokenMetadata, GenericValue} from "./types";
import {CanisterStatusResult, Management} from 'azle/canisters/management';
import {
    ExistedNFT,
    OperatorNotFound,
    OwnerNotFound,
    SelfApprove,
    SelfTransfer,
    TokenNotFound,
    TxNotFound,
    UnauthorizedOperator,
    UnauthorizedOwner
} from "./constants";
import {Metadata, StableStorage, Stats, TxDetails, TxEvent} from "./state-types";
import {
    BoolResponseDto, NatArrResponseDto,
    NatResponseDto,
    PrincipalResponseDto, TokenMetadataArrResponseDto,
    TokenMetadataResponseDto,
    TxEventResponseDto
} from "./response-type";
import {config} from "../candymachine_assets/src/candymachine-config";
type StringProperty = [string, GenericValue];
type TokenIdentifier = nat;

const tokens = new Map<TokenIdentifier, TokenMetadata>();
const ownerList = new Map<Principal, nat[]>();
const operators = new Map<Principal, nat[]>();
const txRecords: TxEvent[] = [];

_loadFromState();
export const ManagementCanister = ic.canisters.Management<Management>('aaaaa-aa');
export function init(): Init {
    ic.print('init');
    ic.stableStorage<StableStorage>().metadata = {
        symbol: config.COLLECTION_SYMBOL,
        name: config.COLLECTION_NAME,
        logo: config.COLLECTION_LOGO,
        custodians: [config.PLUG_ADMIN_PRINCIPAL]
    };
}

export function preUpgrade(): PreUpgrade {

    ic.stableStorage<StableStorage>().ledger = {
        tokensEntries:
            _mapToArray<nat, TokenMetadata>(tokens, (key, val) => {
                return {tokenId: key, tokenMetadata: val} as TokenIdToMetadata;
            } ),
        ownersEntries:
            _mapToArray<Principal, nat[]>(ownerList, (key, val) => {
                return {principal: key, tokenIds: val} as TokenIdPrincipal;
            }),
        operatorsEntries:
            _mapToArray<Principal, nat[]>(operators, (key, val) => {
                return {principal: key, tokenIds: val} as TokenIdPrincipal;
            }),
        txRecordsEntries: txRecords ? [...txRecords] : []
    }

    const custy: Migrate<Principal[]> = ic.stableStorage<StableStorage>().metadata.custodians;
    ic.stableStorage<StableStorage>().metadata.custodians = custy;
}

export function postUpgrade(): PostUpgrade {

    ic.stableStorage<StableStorage>().ledger = {
        tokensEntries: [],
        ownersEntries: [],
        operatorsEntries: [],
        txRecordsEntries: []
    }
}

export function metadata(): Query<Metadata> {
    ic.print("call metadata");
    const data = ic.stableStorage<StableStorage>().metadata;
    ic.print(data.symbol);
    ic.print(data.logo);
    ic.print(data.name);
    for (let custodian of data.custodians) {
        ic.print(custodian);
    }

    return {
        symbol: data.symbol,
        logo: data.logo,
        name: data.name,
        custodians: data.custodians
    }
}

export function name() : Query<string> {
    return ic.stableStorage<StableStorage>().metadata.name;
}

export function symbol() : Query<string> {
    return ic.stableStorage<StableStorage>().metadata.symbol;
}

export function logo(): Query<string> {
    return ic.stableStorage<StableStorage>().metadata.logo;
}

export function custodians(): Query<Principal[]> {
    return ic.stableStorage<StableStorage>().metadata.custodians;
}

export function setName(name: string): Update<void> {
    _isCanisterCustodian();
    ic.stableStorage<StableStorage>().metadata.name = name;
}

export function setLogo(logo: string): Update<void> {
    _isCanisterCustodian();
    ic.stableStorage<StableStorage>().metadata.logo = logo;
}

export function setSymbol(symbol: string): Update<void> {
    _isCanisterCustodian();
    ic.stableStorage<StableStorage>().metadata.symbol = symbol;
}

export function setCustodians(custodians: Principal[]): Update<void> {
    _isCanisterCustodian();
    ic.stableStorage<StableStorage>().metadata.custodians = custodians
}

export function totalTransactions(): Query<nat> {
    return _totalTransaction();
}

export function totalSupply(): Query<nat> {
    return _totalSupply();
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

export function ownerOf(tokenId: TokenIdentifier): Query<PrincipalResponseDto> {
    const token = tokens.get(tokenId);
    return token ?
        {
            Ok: token.owner
        } :
        {
            Err: OwnerNotFound
        };
}

export function ownerTokenIdentifiers(owner: Principal): Query<NatArrResponseDto> {
    const nfts = ownerList.get(owner);
    if (!nfts || nfts.length == 0) {
        return {
            Err: TokenNotFound
        }
    }

    return {
        Ok: nfts
    }

}

export function ownerTokenMetadata(owner: Principal): Query<TokenMetadataArrResponseDto> {
    const meta = _getOwnersTokenMetadata(owner);
    return meta.length === 0 ? {
        Err: OwnerNotFound
    } : {
        Ok: meta
    };
}

export function operatorOf(tokenId: TokenIdentifier): Query<PrincipalResponseDto> {
    const ope = _operatorOf(tokenId);
    return ope.length === 0 ? {
        Err: OperatorNotFound
    } : {
        Ok: ope
    }
}


export function operatorTokenIdentifiers(owner: Principal): Query<NatArrResponseDto> {
    const meta = _getOwnersTokenMetadata(owner);
    return meta.length === 0 ? {
        Err: TokenNotFound
    } : {
        Ok: meta.map(x=>x.token_identifier)
    };
}

export function operatorTokenMetadata(owner: Principal): Query<TokenMetadataArrResponseDto> {
    const meta = _getOwnersTokenMetadata(owner);
    return meta.length === 0 ? {
        Err: OwnerNotFound
    } : {
        Ok: meta
    };
}

export function tokenMetadata(tokenId: TokenIdentifier): Query<TokenMetadataResponseDto> {
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

export function transaction(index: nat): Query<TxEventResponseDto> {
    const chosenIndex = index - 1n;

    if (chosenIndex < 0) {
        return {
            Err: TxNotFound
        }
    } else if (chosenIndex > txRecords.length) {
        return {
            Err: TxNotFound
        }
    }

    return {
        Ok: txRecords[Number(chosenIndex)]
    }
}

export function approve(approvedBy : Principal, tokenId : TokenIdentifier) : Update<NatResponseDto>{
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
    if (caller === op) {
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

export function transfer(to: Principal, tokenId : TokenIdentifier): Update<NatResponseDto> {
    const caller = ic.caller();

    if (caller === to) {
        return {
            Err: SelfTransfer
        }
    }

    const token = tokens.get(tokenId);
    if (!token) {
        return {
            Err: TokenNotFound
        }
    }
    const oldOwner = token.owner;
    const oldOperator = token.operator;
    _updateOwnerCache(tokenId, oldOwner, to);
    _updateOperatorCache(tokenId, oldOperator);
    _transfer(oldOwner, to, tokenId);

    return {
        Ok: _addTransaction(caller, "transfer", [
            {owner: caller},
            {to: to},
            {token_identifier: tokenId}
        ])
    }
}

export function transferFrom(from : Principal, to : Principal, tokenId : TokenIdentifier): Update<NatResponseDto> {
    const caller = ic.caller();
    if (from === to) {
        return {
            Err: SelfTransfer
        }
    }
    const token = tokens.get(tokenId);
    if (!token) {
        return {
            Err: TokenNotFound
        }
    }
    const oldOwner = token.owner;
    const oldOperator = token.operator;

    if (caller != oldOwner) {
        return {
            Err: UnauthorizedOwner
        }
    }

    if (caller != oldOperator) {
        return {
            Err: UnauthorizedOperator
        }
    }
    _updateOwnerCache(tokenId, oldOwner, to);
    _updateOperatorCache(tokenId, oldOperator);
    _transfer(caller, to, tokenId);

    return {
        Ok: _addTransaction(caller, "transfer", [
            {owner: caller},
            {to: to},
            {token_identifier: tokenId}
        ])
    }
}

export function mint(to: Principal, tokenId: TokenIdentifier, properties: StringProperty[]): Update<NatResponseDto> {
    const caller = ic.caller();
    ic.print(`mint called from ${caller}`);
    _isCanisterCustodian();
    if (tokens.has(tokenId)) {
        return {
            Err: ExistedNFT
        }
    }
    _addTokenMetadata(tokenId, {
        token_identifier: tokenId,
        owner: to,
        operator: null,
        properties,
        is_burned: false,
        minted_at: _nowTime(),
        minted_by: to,
        transferred_at: null,
        transferred_by: null,
        approved_at: null,
        approved_by: null,
        burned_at: null,
        burned_by: null,
    });
    _updateOwnerCache(tokenId, undefined, to);

    return {
        Ok:_addTransaction(caller, "mint", [
            {to: to},
            {token_identifier: tokenId}
        ])
    };
}

export function burn(tokenId: TokenIdentifier): Update<NatResponseDto> {
    const caller = ic.caller();
    const token = tokens.get(tokenId);
    if (caller != token.owner) {
        return {
            Err: UnauthorizedOwner
        }
    }

    const operator = token.operator;
    _updateOwnerCache(tokenId, token.owner);
    _updateOperatorCache(tokenId, operator);
    return {
        Ok: _addTransaction(caller, "burn", [
            {token_identifier: tokenId}
        ])
    }

}
// private

function _totalUniqueHolders() {
    return BigInt(ownerList.size);
}

function _totalTransaction(): nat {
    return BigInt(txRecords.length);
}

function _totalSupply(): nat {
    return BigInt(tokens.size);
}

function _isCanisterCustodian() {
    const caller = ic.caller();
    if (!ic.stableStorage<StableStorage>().metadata.custodians.includes(caller)) {
        ic.trap("Caller is not an custodian of canister");
    }
}

function _operatorOf(tokenId: TokenIdentifier): Principal | undefined {
    return tokens.get(tokenId)?.operator
}

function _updateOperatorCache(tokenId: TokenIdentifier, oldOperator?: Principal, newOperator?: Principal) {
    const oldOperatorTokenIdentifiers = operators.get(oldOperator);
    if (!oldOperatorTokenIdentifiers || oldOperatorTokenIdentifiers.length === 0) {
        throw OperatorNotFound;
    }
    if (oldOperator) {
        const mutatedArr = oldOperatorTokenIdentifiers.filter(x => x !== tokenId);
        if (mutatedArr.length === 0) {
            operators.delete(oldOperator);
        } else {
            operators.set(oldOperator, mutatedArr);
        }
    }
    if (newOperator) {
        const newOperatorSet = operators.get(newOperator);
        if (newOperatorSet) {
            newOperatorSet.push(tokenId)
        } else {
            operators.set(newOperator, [tokenId]);
        }
    }
}

function _updateOwnerCache(tokenId: TokenIdentifier, oldOwner?: Principal, newOwner?: Principal) {
    if (oldOwner) {
        const oldOwnerTokenIdentifiers = ownerList.get(oldOwner);
        if (!oldOwnerTokenIdentifiers) {
            throw "couldn't find owner";
        }
        const cleanedTokens = oldOwnerTokenIdentifiers.filter(x => x!== tokenId);
        if (cleanedTokens.length === 0) {
            ownerList.delete(oldOwner);
        } else {
            ownerList.set(oldOwner, cleanedTokens);
        }
    }
    if (newOwner) {
        const newOwnerTokenIdentifier = ownerList.get(newOwner);
        if (!newOwnerTokenIdentifier) {
            ownerList.set(newOwner, [tokenId]);
        } else {
            newOwnerTokenIdentifier.push(tokenId);
        }
    }
}

function _addTransaction(caller: Principal, operation: string, details: TxDetails[]): nat {
    txRecords.push({
       time: _nowTime(),
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

function _approve(to: Principal, tokenId: TokenIdentifier, newOperator?: Opt<Principal>) {
    const token = tokens.get(tokenId);
    token.approved_at = _nowTime();
    token.approved_by = to;
    if (newOperator) token.operator = newOperator;
    tokens.set(tokenId, token);
}

function _transfer(from: Principal, to: Principal, tokenId: TokenIdentifier) {
    const token = tokens.get(tokenId);
    token.owner = to;
    token.transferred_by = from;
    token.transferred_at = _nowTime();
    token.operator = null;
}

function _addTokenMetadata(tokenId: TokenIdentifier, metadata: TokenMetadata) {
    tokens.set(tokenId, metadata);
}

function _mapToArray<key, val>(map: Map<key, val>, transformer): []{
    const resp = [];
    if (map) {
        // @ts-ignore
        for (let key of map.keys()) {
            resp.push(transformer(key, map.get(key)))
        }
    }
    return [];
}

function _loadFromState() {
    for (let tokenURIEntry of ic.stableStorage<StableStorage>()?.ledger?.tokensEntries || []) {
        tokens.set(tokenURIEntry.tokenId, tokenURIEntry.tokenMetadata);
    }
    for (let ownersEntry of ic.stableStorage<StableStorage>()?.ledger?.ownersEntries || []) {
        ownerList.set(ownersEntry.principal, ownersEntry.tokenIds);
    }
    for (let operatorEntries of ic.stableStorage<StableStorage>()?.ledger?.operatorsEntries || []) {
        operators.set(operatorEntries.principal, operatorEntries.tokenIds);
    }
    for (let txRecordsEntry of ic.stableStorage<StableStorage>()?.ledger?.txRecordsEntries || []) {
        txRecords.push(txRecordsEntry);
    }
}


function _nowTime(): nat {
    return ic.time();
}