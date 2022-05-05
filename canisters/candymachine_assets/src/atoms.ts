import {atom} from "recoil";



const localStorageEffect = key => ({setSelf, onSet}) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
        isReset
            ? localStorage.removeItem(key)
            : localStorage.setItem(key, JSON.stringify(newValue));
    });
};


export const loadingAtom = atom({
    key: 'loading',
    default: false
});
export const connectedAtom = atom({
    key: 'connected',
    default: false
});

export const maxTokensAtom = atom({
    key: 'max_tokens',
    default: 0
});

export const leftToMintAtom = atom({
    key: 'left_to_mint',
    default: 0,
    effects: [
        localStorageEffect("left_to_mint")
    ]
});

export const canisters = atom({
    key: 'canisters',
    default: []
});
