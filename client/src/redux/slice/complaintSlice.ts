import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface ComplaintState {
  complaints: any[];
  loading: boolean;
  error: any | null;
  message: string | null;
  totalResults: number;
  totalPages: number;
  page: number;
  limit: number;
}

const initialState: ComplaintState = {
  complaints: [],
  loading: false,
  error: null,
  message: null,
  totalResults: 0,
  totalPages: 1,
  page: 1,
  limit: 10,
};

export const fetchComplaints = createAsyncThunk<any, any>(
  'complaint/fetchComplaints',
  async (params = {}, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/complaints`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createComplaint = createAsyncThunk<any, any>(
  'complaint/createComplaint',
  async (complaintData, thunkApi) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/complaints`,
        complaintData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateComplaint = createAsyncThunk<any, { id: string; complaintData: any }>(
  'complaint/updateComplaint',
  async ({ id, complaintData }, thunkApi) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/complaints/${id}`,
        complaintData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteComplaint = createAsyncThunk<any, string>(
  'complaint/deleteComplaint',
  async (id, thunkApi) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/complaints/${id}`,
        { withCredentials: true }
      );
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    clearComplaintError: (state) => {
      state.error = null;
    },
    clearComplaintMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.complaints = action.payload.data;
        state.totalResults = action.payload.totalResults || action.payload.data?.length || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 10;
      })
      .addCase(fetchComplaints.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComplaint.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.complaints.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createComplaint.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateComplaint.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateComplaint.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.complaints.findIndex(
          (c) => c._id === action.payload.data._id
        );
        if (index !== -1) {
          state.complaints[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateComplaint.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteComplaint.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteComplaint.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.complaints = state.complaints.filter((c) => c._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteComplaint.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearComplaintError, clearComplaintMessage } = complaintSlice.actions;
export default complaintSlice.reducer;
