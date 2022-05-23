import {Variant, Principal, nat, Opt, nat8, nat32, int, nat64, int64, nat16, int16, int32, int8, float64, float32} from "azle";

// export type TokenId = nat;

export type TokenIdToMetadata = {
    tokenId: nat;
    tokenMetadata: TokenMetadata;
};

export type TokenIdPrincipal = {
    principal: Principal
    tokenIds: nat[]
};

type StringProperty = [string, GenericValue];
export type GenericValue = Variant<{
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

export type TokenMetadata = {
    transferred_at?: Opt<nat64>,
    transferred_by?: Opt<Principal>,
    owner?: Opt<Principal>,
    operator?: Opt<Principal>,
    properties: StringProperty[],
    is_burned: boolean,
    token_identifier: nat,
    burned_at?: Opt<nat64>,
    burned_by?: Opt<Principal>
    approved_at?: Opt<nat64>,
    approved_by?: Opt<Principal>,
    minted_at: nat64,
    minted_by: Principal,
};

// http

// export type HttpResponseDto = Variant<{
//     Ok?: Opt<HttpResponse>,
//     Err?: Opt<string>
// }>;
//
// export type HeaderField = Variant<{
//     Accept?: string
//     AcceptEncoding?: string;
//     AcceptLanguage?: string;
//     Connection?: string;
//     UpgradeInsecureRequests?: string;
//     Cookie?: string;
//     Host?: string;
//     Referer?: string;
//     SecFetchDest?: string;
//     SecFetchMode?: string;
//     SecFetchSite?: string;
//     SecFetchUser?: string;
//     UserAgent?: string;
//     ContentType?: string;
// }>;
//
// export type HttpRequest = Variant<{
//    method: string;
//    url: string;
//    headers: HeaderField[];
//    body: nat8[];
// }>;
//
// export type HttpResponse = Variant<{
//     upgrade: boolean
//     status_code: nat16;
//     headers: HeaderField[];
//     body: nat8[];
//     streamingStrategy: StreamingStrategy
// }>;
//
// export type StreamingStrategy = {
//     Callback: Callback
// }
//
// export type Callback = {
//     token: StreamingCallbackToken
// }
//
// export type StreamingCallbackHttpResponse = Variant<{
//     body: nat8[];
//     token: Opt<StreamingCallbackToken>;
// }>;
//
// export type StreamingCallbackToken = Variant<{
//     key: string;
//     content_encoding: string;
//     index: nat;
//     sha256: Opt<nat8[]>;
// }>;