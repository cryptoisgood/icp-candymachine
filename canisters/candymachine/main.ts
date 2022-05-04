import {Canister, CanisterResult, ic, Query, nat32, Opt, nat, Principal, Stable, Async, UpdateAsync} from 'azle';
import {NatResponseDto} from "./response-type";
import {propertyVariant} from "./types";

type NFTCanister = Canister<{
    mint(to: Principal, tokenId: nat, properties: propertyVariant[]): CanisterResult<NatResponseDto>;
}>;

let nft = ic.canisters.NFTCanister<NFTCanister>('r7inp-6aaaa-aaaaa-aaabq-cai');


let tokenId = 0;

export function* mint(): UpdateAsync<NatResponseDto> {
    tokenId = 1 + tokenId;
    const caller = ic.caller();
    const result: CanisterResult<NatResponseDto> = yield nft.mint(caller, BigInt(tokenId), [
        {location: "http://127.0.0.1:8000/TechisGood.png?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai"}
    ]);

    if (result.err) {
        return {
            Err: result.err
        }
    }

    return result.ok;
}
