import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { jwtDecode } from "jwt-decode";

export const customer_register = createAsyncThunk(
    'auth/customer_register',
    async(info, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.post('/customer-register',info)
            // Don't store token for new registrations as they need email verification
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const customer_login = createAsyncThunk(
    'auth/customer_login',
    async(info, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.post('/customer-login',info)
            // If there's a verification problem, the error will be thrown in the catch block
            // So if we get here, we can safely store the token
            localStorage.setItem('customerToken',data.token)
            return fulfillWithValue(data)
        } catch (error) {
            // Check if the error is related to email verification
            if (error.response.data?.isEmailVerified === false) {
                return rejectWithValue({
                    error: "Please verify your email before logging in",
                    isEmailVerified: false
                })
            }
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

const decodeToken = (token) => {
    if (token) {
        const userInfo = jwtDecode(token)
        return userInfo
    } else {
        return ''
    }
}
// End Method 

export const change_password = createAsyncThunk(
    'auth/change_password',
    async(info, { rejectWithValue, fulfillWithValue }) => {
        try {
            // Không gửi confirm_password lên server vì backend không xử lý trường này
            const { oldPassword, newPassword } = info;
            const {data} = await api.put('/change-password', { oldPassword, newPassword })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const authReducer = createSlice({
    name: 'auth',
    initialState:{
        loader : false,
        userInfo : decodeToken(localStorage.getItem('customerToken')),
        errorMessage : '',
        successMessage: '', 
    },
    reducers : {
        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        },
        user_reset: (state,_) => {
            state.userInfo = ""
        },
        user_update: (state, action) => {
            state.userInfo = action.payload
        },
        setError: (state, action) => {
            state.errorMessage = action.payload.error
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(customer_register.pending, (state, { payload }) => {
            state.loader = true;
        })
        .addCase(customer_register.rejected, (state, { payload }) => {
            state.errorMessage = payload.error;
            state.loader = false;
        })
        .addCase(customer_register.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || "Registration successful. Please check your email to verify your account.";
            state.loader = false;
            // Don't set userInfo for new registrations since they need email verification
        })

        .addCase(customer_login.pending, (state, { payload }) => {
            state.loader = true;
        })
        .addCase(customer_login.rejected, (state, { payload }) => {
            state.errorMessage = payload.error;
            state.loader = false;
        })
        .addCase(customer_login.fulfilled, (state, { payload }) => {
            const userInfo = decodeToken(payload.token)
            state.successMessage = payload.message;
            state.loader = false;
            state.userInfo = userInfo
        })
        .addCase(change_password.pending, (state, { payload }) => {
            state.loader = true;
        })
        .addCase(change_password.rejected, (state, { payload }) => {
            state.errorMessage = payload.error;
            state.loader = false;
        })
        .addCase(change_password.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message;
            state.loader = false;
        })
    }
})
export const {messageClear, user_reset, user_update} = authReducer.actions
export default authReducer.reducer