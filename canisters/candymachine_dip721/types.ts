import {Stable, Variant, Principal, nat, Opt, int, int64, nat8, nat16, nat64} from "azle";

// export type TokenId = nat;

export type TokenIdToMetadata = Variant<{
    tokenId?: nat;
    tokenMetadata?: TokenMetadata;
}>;

export type TokenIdPrincipal = Variant<{
    principal?: Principal;
    tokenIds?: nat[];
}>;

export type PrincipalNatVariant = Variant<{
    principal?: Principal;
    balance?: nat;
}>;

export type propertyVariant = Variant<{
    location?: string
    contentType?: string
    thumbnail?: string
}>;

export type TokenMetadata  = Variant<{
    token_identifier: int64,
    owner: Principal,
    operator?: Principal,
    properties: propertyVariant[],
    is_burned: boolean,
    minted_at: int64,
    minted_by: Principal,
    transferred_at?: int64,
    transferred_by?: Principal,
    approved_at?: int64,
    approved_by?: Principal,
    burned_at?: int64,
    burned_by?: Principal
}>

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