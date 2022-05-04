import {Variant, Principal, nat, Opt} from "azle";

// export type TokenId = nat;

export type TokenIdToMetadata = {
    tokenId: nat;
    tokenMetadata: TokenMetadata;
};

export type TokenIdPrincipal = {
    principal: Principal
    tokenIds: nat[]
};

export type propertyVariant = Variant<{
    location?: Opt<string>
    contentType?: Opt<string>
    thumbnail?: Opt<string>
}>;

export type TokenMetadata = Variant<{
    token_identifier: nat,
    owner: Principal,
    operator?: Opt<Principal>,
    properties: propertyVariant[],
    is_burned: boolean,
    minted_at: nat,
    minted_by: Principal,
    transferred_at?: Opt<nat>,
    transferred_by?: Opt<Principal>,
    approved_at?: Opt<nat>,
    approved_by?: Opt<Principal>,
    burned_at?: Opt<nat>,
    burned_by?: Opt<Principal>
}>;

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