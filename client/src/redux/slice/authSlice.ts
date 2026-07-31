import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import axios from 'axios';

interface AuthState {
  loading: boolean;
  message: string | null;
  isAuthenticated: string | null;
  name: string | null;
  email: string | null;
  username: string | null;
  role: 'Admin' | 'Staff' | 'Resident' | null;
  profilePhoto: string | null;
  error: any | null;
}

const initialState: AuthState = {
  loading: false,
  message: null,
  isAuthenticated: Cookies.get('isAuthenticated') || null,
  name: Cookies.get('name') || null,
  email: Cookies.get('email') || null,
  username: Cookies.get('username') || null,
  role: (Cookies.get('role') as any) || null,
  profilePhoto: Cookies.get('profilePhoto') || null,
  error: null,
};

export const login = createAsyncThunk(
  '/auth_login',
  async ({ formData }: { formData: any }, thunkApi) => {
    try {
      console.log(formData);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData,
        {
          withCredentials: true,
        }
      );
      const verifyRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify`,
        null,
        {
          withCredentials: true,
        }
      );
      return { ...res.data, ...verifyRes.data };
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      return thunkApi.rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const firebaseLoginThunk = createAsyncThunk(
  '/auth_firebase_login',
  async (idToken: string, thunkApi) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/firebase-login`,
        { idToken },
        {
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      return thunkApi.rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const Signout = createAsyncThunk('/auth_logout', async (_, thunkApi) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      null,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    // catch silently
  }
});

export const updateSelfProfileThunk = createAsyncThunk(
  '/auth_updateSelfProfile',
  async (formData: any, thunkApi) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/profile`,
        formData,
        { withCredentials: true }
      );
      return res.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateProfilePhotoSuccess: (state, action: PayloadAction<string>) => {
      state.profilePhoto = action.payload;
      Cookies.set('profilePhoto', action.payload || '');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateSelfProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSelfProfileThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.message = action.payload.message;
        const { name, email } = action.payload.data;
        state.name = name;
        state.email = email;
        Cookies.set('name', name);
        Cookies.set('email', email);
      })
      .addCase(updateSelfProfileThunk.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.message = action.payload.message;
        state.isAuthenticated = action.payload.authenticated;
        const { name, email, username, role, id, profilePhoto } = action.payload.data;
        state.name = name;
        state.role = role;
        state.email = email;
        state.username = username || '';
        state.profilePhoto = profilePhoto;
        Cookies.set('name', name);
        Cookies.set('email', email);
        Cookies.set('username', username || '');
        Cookies.set('id', id);
        Cookies.set('role', role);
        Cookies.set('profilePhoto', profilePhoto || '');
        Cookies.set('isAuthenticated', action.payload.authenticated);
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(firebaseLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(firebaseLoginThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.message = action.payload.message;
        state.isAuthenticated = action.payload.authenticated;
        const { name, email, username, role, id, profilePhoto } = action.payload.data;
        state.name = name;
        state.role = role;
        state.email = email;
        state.username = username || '';
        state.profilePhoto = profilePhoto;
        Cookies.set('name', name);
        Cookies.set('email', email);
        Cookies.set('username', username || '');
        Cookies.set('id', id);
        Cookies.set('role', role);
        Cookies.set('profilePhoto', profilePhoto || '');
        Cookies.set('isAuthenticated', action.payload.authenticated);
      })
      .addCase(firebaseLoginThunk.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(Signout.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        console.log(action.payload);
      })
      .addCase(Signout.pending, (state) => {
        state.loading = true;
      })
      .addCase(Signout.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isAuthenticated = null;
        Cookies.remove('isAuthenticated');
        state.name = null;
        state.email = null;
        state.username = null;
        state.role = null;
        state.profilePhoto = null;
        
        Cookies.remove('name');
        Cookies.remove('email');
        Cookies.remove('username');
        Cookies.remove('role');
        Cookies.remove('profilePhoto');
        Cookies.remove('id');
      });
  },
});

export const { updateProfilePhotoSuccess } = authSlice.actions;
export default authSlice.reducer;