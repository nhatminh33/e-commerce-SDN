import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { jwtDecode } from "jwt-decode";

export const admin_login = createAsyncThunk(
    'auth/admin_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        console.log(info)
        try {
            const { data } = await api.post('/admin-login', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

export const seller_login = createAsyncThunk(
    'auth/seller_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        console.log(info)
        try {
            const { data } = await api.post('/admin-login', info, { withCredentials: true })
            console.log(data)
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_user_info = createAsyncThunk(
    'auth/get_user_info',
    async (_, { rejectWithValue, fulfillWithValue }) => {

        try {
            const { data } = await api.get('/get-user', { withCredentials: true })
            // console.log(data)            
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)


export const profile_image_upload = createAsyncThunk(
    'auth/profile_image_upload',
    async (image, { rejectWithValue, fulfillWithValue }) => {

        try {
            const { data } = await api.post('/profile-image-upload', image, { withCredentials: true })
            // console.log(data)            
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 

export const seller_register = createAsyncThunk(
    'auth/seller_register',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            console.log(info)
            const { data } = await api.post('/seller-register', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            //  console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

// end method 

export const profile_info_add = createAsyncThunk(
    'auth/profile_info_add',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/profile-info-add', info, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 



const returnRole = (token) => {
    if (token) {
        const decodeToken = jwtDecode(token)
        const expireTime = new Date(decodeToken.exp * 1000)
        if (new Date() > expireTime) {
            localStorage.removeItem('accessToken')
            return ''
        } else {
            return decodeToken.role
        }

    } else {
        return ''
    }
}

// end Method 

export const logout = createAsyncThunk(
    'auth/logout',
    async ({ navigate }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/logout', {}, { withCredentials: true })
            localStorage.removeItem('accessToken')
            navigate('/login')
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// end Method 


export const authReducer = createSlice({
    name: 'auth',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        userInfo: '',
        role: returnRole(localStorage.getItem('accessToken')),
        token: localStorage.getItem('accessToken')
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: (builder) => {
        builder
            // Admin login cases
            .addCase(admin_login.pending, (state, _) => {
                state.loader = true;
            })
            .addCase(admin_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(admin_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message
                state.token = payload.token
                state.role = returnRole(payload.token)
            })
            
            // Seller login cases
            .addCase(seller_login.pending, (state, _) => {
                state.loader = true;
            })
            .addCase(seller_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(seller_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message
                state.token = payload.token
                state.role = returnRole(payload.token)
            })
            
            // Get user info cases
            .addCase(get_user_info.pending, (state, _) => {
                state.loader = true;
            })
            .addCase(get_user_info.rejected, (state, _) => {
                state.loader = false;
            })
            .addCase(get_user_info.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo
            })

            // Profile image upload cases
            .addCase(profile_image_upload.pending, (state, _) => {
                state.loader = true;
            })
            .addCase(profile_image_upload.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(profile_image_upload.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo
                state.successMessage = payload.message
            })

            // Seller register cases
            .addCase(seller_register.pending, (state, _) => {
                state.loader = true;
            })
            .addCase(seller_register.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(seller_register.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message
                state.token = payload.token
                state.role = returnRole(payload.token)
            })

            // Profile info add cases
            .addCase(profile_info_add.pending, (state, _) => {
                state.loader = true;
            })
            .addCase(profile_info_add.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(profile_info_add.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo
                state.successMessage = payload.message
            })
            
            // Logout cases
            .addCase(logout.pending, (state, _) => {
                state.loader = true;
            })
            .addCase(logout.rejected, (state, _) => {
                state.loader = false;
            })
            .addCase(logout.fulfilled, (state, _) => {
                state.loader = false;
                state.successMessage = '';
                state.errorMessage = '';
                state.userInfo = '';
                state.role = '';
                state.token = null;
            })
    }
})
export const { messageClear } = authReducer.actions
export default authReducer.reducer