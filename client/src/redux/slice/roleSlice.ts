import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface RoleState {
  roles: any[];
  loading: boolean;
  error: any | null;
  message: string | null;
}

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchRoles = createAsyncThunk<any, void>(
  'role/fetchRoles',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/roles`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createRole = createAsyncThunk<any, any>(
  'role/createRole',
  async (roleData, thunkApi) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/roles`,
        roleData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateRole = createAsyncThunk<any, { id: string; roleData: any }>(
  'role/updateRole',
  async ({ id, roleData }, thunkApi) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/roles/${id}`,
        roleData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteRole = createAsyncThunk<any, string>(
  'role/deleteRole',
  async (id, thunkApi) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/roles/${id}`,
        { withCredentials: true }
      );
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
    clearRoleMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.roles = action.payload.data;
      })
      .addCase(fetchRoles.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.roles.push(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createRole.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.roles.findIndex(
          (role) => role._id === action.payload.data._id
        );
        if (index !== -1) {
          state.roles[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateRole.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.roles = state.roles.filter((role) => role._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteRole.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRoleError, clearRoleMessage } = roleSlice.actions;
export default roleSlice.reducer;
