import {nat, Principal, Variant} from "azle";
export type Tokens = {
    e8s: nat
}
//
// export type TransferSend = {
//     from: Principal,
//     to: Principal,
//     amount: Tokens
// }
//
// export type Transaction = {
//     transfer: TransferSend;
//     memo: nat;
//     created_at_time: nat;
// };
//
// export type Block = {
//     parent_hash: string;
//     transaction: Transaction;
//     timestamp: nat;
// };
//
// //BlockHeight = Nat
//
// export type TransferError = {
//     TxTooOld: { allowed_window_nanos : nat };
//     BadFee: { expected_fee : Tokens };
//     TxDuplicate: { duplicate_of : nat };
//     TxCreatedInFuture;
//     InsufficientFunds: { balance : Tokens };
// };
//
// export type TransferSendResponse = Variant<{
//     Ok: nat,
//     Err: TransferError
// }>