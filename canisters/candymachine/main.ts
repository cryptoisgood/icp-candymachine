import {
    Canister,
    CanisterResult,
    ic,
    Query,
    nat32,
    Opt,
    nat,
    Principal,
    Stable,
    Async,
    UpdateAsync,
    float32
} from 'azle';
import {FloatResponseDto, NatResponseDto, StringResponseDto} from "./response-type";
import {propertyVariant} from "./types";

type NFTCanister = Canister<{
    mint(to: Principal, tokenId: nat, properties: propertyVariant[]): CanisterResult<NatResponseDto>;
}>;
let nft = ic.canisters.NFTCanister<NFTCanister>('r7inp-6aaaa-aaaaa-aaabq-cai');

// export const ICPCanister = ic.canisters.ICP<ICP>(process.env.ICP_LEDGER_CANISTER_ID);

const NOT_IMPLEMENTED = "not_implemented";
const FAILED_CAPTCHA  = "failed_captcha";
const MAX_TOKEN_ID = 1000000;
const PRICE: float32 = 0.5;
let tokenId = 0;
const validatedUsers = new Map<Principal, string>();

export function startCaptcha(): Query<StringResponseDto> {
    return {
        Err: NOT_IMPLEMENTED
    };
}

export function* mint(captcha: string): UpdateAsync<NatResponseDto> {
    const caller = ic.caller();

    if (!_validateUser(caller, captcha)) {
        return {
            Err: FAILED_CAPTCHA
        }
    }
    tokenId = 1 + tokenId;
    const result: CanisterResult<NatResponseDto> = yield nft.mint(caller, BigInt(tokenId), [
        {location: "http://127.0.0.1:8000/TechisGood.png?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai"}
    ]);

    if (MAX_TOKEN_ID === tokenId) {
        return {
            Err: "ALL_NFT_MINTED"
        }
    }

    if (result.err) {
        return {
            Err: result.err
        }
    }

    return result.ok;
}

export function leftToMint(): Query<NatResponseDto> {
    return {
        Ok: BigInt(MAX_TOKEN_ID - tokenId)
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

function _validateUser(caller, captcha): boolean {
    //return validatedUsers.get(caller) === captcha;
    //implement captcha later
    return true;
}