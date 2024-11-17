import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EmpresaState {
    id?: string;
    passwordDashboard: string;
    cnpjEmpresa: string;
    nmEmpresa: string;
    tfEmpresa: string;
    cepEmpresa: string;
    ruaEmpresa: string;
    bairroEmpresa: string;
    cidadeEmpresa: string;
    estadoEmpresa: string;
    numeroEmpresa: string;
    isAdmin?: boolean;
}

const initialState: EmpresaState = {
    passwordDashboard: '',
    cnpjEmpresa: '',
    nmEmpresa: '',
    tfEmpresa: '',
    cepEmpresa: '',
    ruaEmpresa: '',
    bairroEmpresa: '',
    cidadeEmpresa: '',
    estadoEmpresa: '',
    numeroEmpresa: '',
    isAdmin: false,
    id: ''
};

const empresaOnline = createSlice({
    name: 'empresaOnline',
    initialState,
    reducers: {
        setPasswordDashboard(state, action: PayloadAction<string>) {
            state.passwordDashboard = action.payload;
        },
        setCnpjEmpresa(state, action: PayloadAction<string>) {
            state.cnpjEmpresa = action.payload;
        },
        setNmEmpresa(state, action: PayloadAction<string>) {
            state.nmEmpresa = action.payload;
        },
        setTfEmpresa(state, action: PayloadAction<string>) {
            state.tfEmpresa = action.payload;
        },
        setCepEmpresa(state, action: PayloadAction<string>) {
            state.cepEmpresa = action.payload;
        },
        setRuaEmpresa(state, action: PayloadAction<string>) {
            state.ruaEmpresa = action.payload;
        },
        setBairroEmpresa(state, action: PayloadAction<string>) {
            state.bairroEmpresa = action.payload;
        },
        setCidadeEmpresa(state, action: PayloadAction<string>) {
            state.cidadeEmpresa = action.payload;
        },
        setEstadoEmpresa(state, action: PayloadAction<string>) {
            state.estadoEmpresa = action.payload;
        },
        setNumeroEmpresa(state, action: PayloadAction<string>) {
            state.numeroEmpresa = action.payload;
        },
        setIsAdmin(state, action: PayloadAction<boolean | undefined>) {
            state.isAdmin = action.payload;
        },
        setId(state, action: PayloadAction<string>) {
            state.id = action.payload;
        }
    },
});

export const {
    setPasswordDashboard,
    setCnpjEmpresa,
    setNmEmpresa,
    setTfEmpresa,    
    setCepEmpresa,
    setRuaEmpresa,
    setBairroEmpresa,
    setCidadeEmpresa,
    setEstadoEmpresa,
    setNumeroEmpresa,
    setIsAdmin,
    setId
} = empresaOnline.actions;

export default empresaOnline.reducer;
