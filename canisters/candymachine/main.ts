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
    Init,
    Update
} from 'azle';
import {FloatResponseDto, NatResponseDto, StringResponseDto} from "./response-type";
import {StableStorage} from "./types";
import {config} from "../../candymachine-config";


type propertyVariant = [string, string];

type NFTCanister = Canister<{
    mint(to: Principal, tokenId: nat, properties: propertyVariant): CanisterResult<NatResponseDto>;
    totalSupply(): CanisterResult<nat32>;
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
    const result: CanisterResult<NatResponseDto> = yield _getNftCanister().mint(caller, BigInt(tokenId + 1),
        ["location", "https://comparator.cryptoisgood.studio/TechisGood.jpg"]
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

    return result.ok;
}

export function* currentlyMinting(): UpdateAsync<NatResponseDto> {
    const tokenId = yield _getNftCanister().totalSupply();
    if (tokenId.ok) {
        return {
            Ok: BigInt(tokenId.ok)
        }
    }else {
        return {
            Err: tokenId.err
        }
    }
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
