import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi, loadTokens, setTokens } from '../services/api';
import type { Tokens } from '../services/api';

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'collaborator' | 'viewer';
}

interface AuthState {
  user: UserProfile | null;
  tokens: Tokens | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: loadTokens(),
  loading: false,
  error: null,
};

export const fetchMe = createAsyncThunk<UserProfile>(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.me();
      return data as UserProfile;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.detail ?? 'Failed to fetch profile');
    }
  }
);

export const login = createAsyncThunk<tokensWithUser, { username: string; password: string }>(
  'auth/login',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload);
      const tokens = { access: data.access as string, refresh: data.refresh as string };
      setTokens(tokens);
      await dispatch(fetchMe()).unwrap();
      return { tokens } as tokensWithUser;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data ?? 'Invalid credentials');
    }
  }
);

export const register = createAsyncThunk<unknown, {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password2: string;
}>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(payload);
      return data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data ?? 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk<unknown, void>(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const refresh = state.auth.tokens?.refresh;
    if (refresh) {
      try { await authApi.logout(refresh); } catch { /* ignore */ }
    }
    setTokens(null);
  }
);

type tokensWithUser = { tokens: Tokens };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(fetchMe.rejected, (state, action) => { state.loading = false; state.error = String(action.payload ?? 'Error'); })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.tokens = action.payload.tokens; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = String(action.payload ?? 'Login failed'); })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.loading = false; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = String(action.payload ?? 'Register failed'); })
      .addCase(logout.fulfilled, (state) => { state.user = null; state.tokens = null; });
  }
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
