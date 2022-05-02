import {ic} from "azle";

export function notEqual(test1: any, test2: any, msg: string) {
    if (test1 == test2) {
        ic.trap(msg)
    }
}

export function isTrue(bool: boolean, msg: string) {
    if (!bool) {
        ic.trap(msg)
    }
}
export function isFalse(bool: boolean, msg: string) {
    isTrue(!bool, msg);
}

export function isEqual(test1: any, test2: any, msg: string) {
    if (test1 !== test2) {
        ic.trap(msg)
    }
}