import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

interface FlatState {
  flats: any[];
  flat: any | null;
  loading: boolean;
  error: any | null;
  message: string | null;
}

const initialState: FlatState = {
  flats: [],
  flat: null,
  loading: false,
  error: null,
  message: null,
};

export const fetchFlats = createAsyncThunk<any, void>(
  'flat/fetchFlats',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/flats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAvailableFlats = createAsyncThunk<any, void>(
  'flat/fetchAvailableFlats',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/flats/available`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getResidentFlat = createAsyncThunk<any, void>(
  'flat/getResidentFlat',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/flats/${Cookies.get('id')}`, {
        withCredentials: true,
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFlat = createAsyncThunk<any, any>(
  'flat/createFlat',
  async (flatData, thunkApi) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/flats`,
        flatData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFlat = createAsyncThunk<any, { id: string; flatData: any }>(
  'flat/updateFlat',
  async ({ id, flatData }, thunkApi) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/flats/${id}`,
        flatData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFlat = createAsyncThunk<any, string>(
  'flat/deleteFlat',
  async (id, thunkApi) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/flats/${id}`,
        { withCredentials: true }
      );
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const flatSlice = createSlice({
  name: 'flat',
  initialState,
  reducers: {
    clearFlatError: (state) => {
      state.error = null;
    },
    clearFlatMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlats.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.flats = action.payload.data;
      })
      .addCase(fetchFlats.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailableFlats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableFlats.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.flats = action.payload.data;
      })
      .addCase(fetchAvailableFlats.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFlat.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.flats.push(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createFlat.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFlat.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.flats.findIndex(
          (flat) => flat._id === action.payload.data._id
        );
        if (index !== -1) {
          state.flats[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateFlat.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFlat.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.flats = state.flats.filter((flat) => flat._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteFlat.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getResidentFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(getResidentFlat.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.flat = action.payload;
        state.message = action.payload.message;
      })
      .addCase(getResidentFlat.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFlatError, clearFlatMessage } = flatSlice.actions;
export default flatSlice.reducer;
