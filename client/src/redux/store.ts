import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slice/authSlice';
import roleReducer from './slice/roleSlice';
import flatReducer from './slice/flatSlice';
import userReducer from './slice/userSlice';
import complaintReducer from './slice/complaintSlice';
import noticeReducer from './slice/noticeSlice';
import billReducer from './slice/billSlice';


const store = configureStore({
    reducer : {
    auth : authReducer,
    role : roleReducer,
    flat : flatReducer,
    user : userReducer,
    complaint : complaintReducer,
    notice : noticeReducer,
    bill : billReducer
    }
})


export default store;