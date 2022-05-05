import {
    Canister,
    CanisterResult,
    ic,
    Query,
    nat32,
    nat,
    Principal,
    UpdateAsync,
    float32
} from 'azle';
import {FloatResponseDto, NatResponseDto, StringResponseDto} from "./response-type";
import {propertyVariant} from "./types";

type NFTCanister = Canister<{
    mint(to: Principal, tokenId: nat, properties: propertyVariant[]): CanisterResult<NatResponseDto>;
    totalSupply(): CanisterResult<nat32>;
}>;

let nft = ic.canisters.NFTCanister<NFTCanister>('r7inp-6aaaa-aaaaa-aaabq-cai');

const NOT_IMPLEMENTED = "not_implemented";
const FAILED_CAPTCHA  = "failed_captcha";
const ALL_NFT_MINTED = "all_nft_minted";
const MAX_TOKEN_ID = 1000000;
const PRICE: float32 = 0.5;

export function startCaptcha(): Query<StringResponseDto> {
    return {
        Err: NOT_IMPLEMENTED
    };
}

export function* mint(captcha: string): UpdateAsync<NatResponseDto> {
    const caller = ic.caller();
    const tokenIdResp = yield nft.totalSupply();
    const tokenId = tokenIdResp.ok;
    const result: CanisterResult<NatResponseDto> = yield nft.mint(caller, BigInt(tokenId + 1), [
        {location: "https://comparator.cryptoisgood.studio/TechisGood.jpg"}
    ]);

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
    const tokenId = yield nft.totalSupply();
    return {
        Ok: BigInt(tokenId.ok)
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