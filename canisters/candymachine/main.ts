import {
    Canister,
    CanisterResult,
    ic,
    Query,
    nat32,
    nat,
    Principal,
    UpdateAsync,
    float32,
    nat8,
    Init,
    Update,
    Migrate,
    PreUpgrade,
    PostUpgrade, Variant, nat64, int64, int, nat16, int32, int8, float64, int16
} from 'azle';
import {FloatResponseDto, NatResponseDto, StringResponseDto} from "./response-type";
import {StableStorage} from "./types";
import {config} from "../candymachine_assets/src/candymachine-config";
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

type propertyVariant = [string, GenericValue];

type NFTCanister = Canister<{
    mint(to: Principal, tokenId: nat, properties: propertyVariant[]): CanisterResult<NatResponseDto>;
    totalSupply(): CanisterResult<nat>;
}>;

const NOT_IMPLEMENTED = "not_implemented";
const FAILED_CAPTCHA  = "failed_captcha";
const ALL_NFT_MINTED = "all_nft_minted";
const MAX_TOKEN_ID = config.COLLECTION_SIZE;
const PRICE: float32 = config.PRICE;

export function init(): Init {
    ic.print('init');
    ic.stableStorage<StableStorage>().custodians = [config.PLUG_ADMIN_PRINCIPAL];
    ic.stableStorage<StableStorage>().nftCanister = "";
    ic.stableStorage<StableStorage>().initMint = false;
}


export function startCaptcha(): Query<StringResponseDto> {
    return {
        Err: NOT_IMPLEMENTED
    };
}

export function* mint(captcha: string): UpdateAsync<NatResponseDto> {
    if (!ic.stableStorage<StableStorage>().initMint){
        ic.trap("mint hasn't been initiated");
    }

    const caller = ic.caller();
    const tokenIdResp = yield _getNftCanister().totalSupply();
    const tokenId = tokenIdResp.ok;
    const result: CanisterResult<NatResponseDto> = yield _getNftCanister().mint(caller, BigInt(tokenId + 1n),
        [["location", {TextContent: "https://comparator.cryptoisgood.studio/TechisGood.jpg"}]]
    );

    if (MAX_TOKEN_ID === tokenId) {
        return {
            Err: ALL_NFT_MINTED
        }
    }

    if (result.err) {
        return {
            Err: result.err
        }
    }

    return result.ok
}

export function maxTokens(): Query<NatResponseDto> {
    return {
        Ok: BigInt(MAX_TOKEN_ID)
    }
}

export function price(): Query<FloatResponseDto> {
    return {
        Ok: PRICE
    }
}

export function setCustodians(custodians: string[]): Update<void>  {
    _checkIfCustodian();
    ic.stableStorage<StableStorage>().custodians = custodians;
}


export function setNftCanister(id: string): Update<void> {
    _checkIfCustodian();
    ic.stableStorage<StableStorage>().nftCanister = id;
}

export function getNftCanister(): Update<string>  {
    return ic.stableStorage<StableStorage>().nftCanister;
}

export function initiateMint(): Update<void> {
    _checkIfCustodian();
    ic.stableStorage<StableStorage>().initMint = true;
}

export function isInit(): Query<boolean> {
    return ic.stableStorage<StableStorage>().initMint;
}

function _getNftCanister() {
    return ic.canisters.NFTCanister<NFTCanister>(ic.stableStorage<StableStorage>().nftCanister);
}

function _checkIfCustodian() {
    if (!ic.stableStorage<StableStorage>().custodians.includes(ic.caller())) {
        ic.trap(`${ic.caller()} is not custodian`);
    }
}
