import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  error: string;
  userLogado: boolean;
  user: { uid: string; email: string } | null;
  loading: boolean;
}


const initialState: UserState = {
  error: '',
  userLogado: false,
  user: null,
  loading: false
};

/**
* Redux Slice para gerenciar o estado do usuário.
*  @param email - O email do usuário.
*  @param password - A senha do usuário.
*  @param error - Mensagem de erro, caso ocorra.
*  @param userLogado - Indica se o usuário está logado ou não.
*  @param user - O objeto de usuário.
*  @param loading - Indica se o estado está em processo de carregamento.
*  @returns O reducer do estado do usuário.
*/

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setuserLogado: (state, action: PayloadAction<boolean>) => {
      state.userLogado = action.payload;
    },
    setUser: (state, action: PayloadAction<{ uid: string; email: string } | null>) => {
        state.user = action.payload;
      },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});
export const {  setError, setuserLogado, setUser,setLoading } = userSlice.actions;

export default userSlice.reducer;
