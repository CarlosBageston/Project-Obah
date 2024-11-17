import { configureStore } from '@reduxjs/toolkit';
import userReducer, { UserState } from './reducer';
import loadingSlice, { LoadingState } from './loadingSlice';
import empresaOnline, { EmpresaState } from './empresaOnline';

export interface RootState {
    user: UserState;
    loading: LoadingState;
    empresaOnline: EmpresaState;
  }

/**
* Configuração da store do Redux.
* @param reducer - O reducer responsável por gerenciar o estado do usuário.
* @returns A store configurada.
*/
const store = configureStore({
  reducer: {
    user: userReducer,
    loading: loadingSlice,
    empresaOnline: empresaOnline
  },
});

export default store;