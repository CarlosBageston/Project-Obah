import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';

export interface State {
  user: UserState;
}

interface UserState {
  email: string;
  password: string;
  error: string;
  userLogado: boolean;
  user: User | null;
  loading: boolean;
}


const initialState: UserState = {
  email: '', 
  password: '',
  error: '',
  userLogado: false,
  user: null,
  loading: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setuserLogado: (state, action: PayloadAction<boolean>) => {
      state.userLogado = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});
export const { setEmail, setPassword, setError, setuserLogado, setUser,setLoading } = userSlice.actions;

export default userSlice.reducer;
