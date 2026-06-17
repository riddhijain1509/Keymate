import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    vaultKeyJwk: null,
    vaultReady: false,
    vaultMode: "local-dev-dek",
};

export const keySlice = createSlice({
    name: "vault",
    initialState,
    reducers: {
        setVaultKeyJwk: (state, action) => {
            state.vaultKeyJwk = action.payload;
            state.vaultReady = !!action.payload;
        },
        clearVaultKey: (state) => {
            state.vaultKeyJwk = null;
            state.vaultReady = false;
        },
        setVaultReady: (state, action) => {
            state.vaultReady = action.payload;
        },
        setVaultMode: (state, action) => {
            state.vaultMode = action.payload;
        },
    },
});

export const {
    setVaultKeyJwk,
    clearVaultKey,
    setVaultReady,
    setVaultMode,
} = keySlice.actions;

export default keySlice.reducer;
