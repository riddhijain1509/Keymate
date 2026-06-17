import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    vaultMeta: null,
    vaultMetaLoaded: false,
    vaultKeyJwk: null,
    vaultReady: false,
    vaultMode: "uninitialized",
};

export const keySlice = createSlice({
    name: "vault",
    initialState,
    reducers: {
        setVaultMeta: (state, action) => {
            state.vaultMeta = action.payload;
            state.vaultMetaLoaded = true;
            state.vaultMode = action.payload?.mode || "uninitialized";
        },
        setVaultMetaLoaded: (state, action) => {
            state.vaultMetaLoaded = action.payload;
        },
        setVaultKeyJwk: (state, action) => {
            state.vaultKeyJwk = action.payload;
            state.vaultReady = !!action.payload;
        },
        clearVaultKey: (state) => {
            state.vaultKeyJwk = null;
            state.vaultReady = false;
        },
        clearVaultState: (state) => {
            state.vaultMeta = null;
            state.vaultMetaLoaded = false;
            state.vaultKeyJwk = null;
            state.vaultReady = false;
            state.vaultMode = "uninitialized";
        },
    },
});

export const {
    setVaultMeta,
    setVaultMetaLoaded,
    setVaultKeyJwk,
    clearVaultKey,
    clearVaultState,
} = keySlice.actions;

export default keySlice.reducer;
