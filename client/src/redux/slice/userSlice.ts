import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface UserState {
  users: any[];
  loading: boolean;
  error: any | null;
  message: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchUsers = createAsyncThunk<any, void>(
  'user/fetchUsers',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createUser = createAsyncThunk<any, any>(
  'user/createUser',
  async (userData, thunkApi) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users`,
        userData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUser = createAsyncThunk<any, { id: string; userData: any }>(
  'user/updateUser',
  async ({ id, userData }, thunkApi) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${id}`,
        userData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateUser = createAsyncThunk<any, string>(
  'user/deactivateUser',
  async (id, thunkApi) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${id}/deactivate`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.users = action.payload.data;
      })
      .addCase(fetchUsers.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.users.push(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.users.findIndex((user) => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deactivateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deactivateUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.users.findIndex((user) => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(deactivateUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, clearUserMessage } = userSlice.actions;
export default userSlice.reducer;
