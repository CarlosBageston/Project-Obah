import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducer';

/**
* Configuração da store do Redux.
* @param reducer - O reducer responsável por gerenciar o estado do usuário.
* @returns A store configurada.
*/

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;