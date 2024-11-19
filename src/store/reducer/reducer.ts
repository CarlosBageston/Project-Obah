import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  message: string;
  userLogado: boolean;
  user: { uid: string; email: string } | null;
}


const initialState: UserState = {
  message: '',
  userLogado: false,
  user: null,
};

/**
* Redux Slice para gerenciar o estado do usuário.
*  @param email - O email do usuário.
*  @param password - A senha do usuário.
*  @param message - Mensagem de erro, caso ocorra.
*  @param userLogado - Indica se o usuário está logado ou não.
*  @param user - O objeto de usuário.
*  @param loading - Indica se o estado está em processo de carregamento.
*  @returns O reducer do estado do usuário.
*/

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    setuserLogado: (state, action: PayloadAction<boolean>) => {
      state.userLogado = action.payload;
    },
    setUser: (state, action: PayloadAction<{ uid: string; email: string } | null>) => {
        state.user = action.payload;
    },
  },
});
export const {  setMessage, setuserLogado, setUser } = userSlice.actions;

export default userSlice.reducer;
