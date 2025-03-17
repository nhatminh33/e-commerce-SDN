import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";



export const get_seller_request = createAsyncThunk(
    'seller/get_seller_request',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue }) => {

        try {

            const { data } = await api.get(`/request-seller-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, { withCredentials: true })
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 


export const get_seller = createAsyncThunk(
    'seller/get_seller',
    async (sellerId, { rejectWithValue, fulfillWithValue }) => {

        try {

            const { data } = await api.get(`/get-seller/${sellerId}`, { withCredentials: true })
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 


export const seller_status_update = createAsyncThunk(
    'seller/seller_status_update',
    async (info, { rejectWithValue, fulfillWithValue }) => {

        try {

            const { data } = await api.post(`/update-seller-status`, info, { withCredentials: true })
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 


export const get_active_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue }) => {

        try {

            const { data } = await api.get(`/get-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, { withCredentials: true })

            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 

export const get_sellers = createAsyncThunk(
    'seller/get_sellers',
    async ({ perPage, page, searchValue, status }, { rejectWithValue, fulfillWithValue }) => {

        try {

            const { data } = await api.get(`/get-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${perPage}&&status=${status}`, { withCredentials: true })

            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 

export const create_stripe_connect_account = createAsyncThunk(
    'seller/create_stripe_connect_account',
    async () => {
        try {
            const { data: { url } } = await api.get(`/payment/create-stripe-connect-account`, { withCredentials: true })
            window.location.href = url
        } catch (error) {
            // console.log(error.response.data) 
        }
    }
)

// End Method 

export const active_stripe_connect_account = createAsyncThunk(
    'seller/active_stripe_connect_account',
    async (activeCode, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/payment/active-stripe-connect-account/${activeCode}`, {}, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data) 
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 

export const createSeller = createAsyncThunk(
    'seller/createSeller',
    async (sellerData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/create-seller', sellerData, { withCredentials: true })
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const update_seller_info = createAsyncThunk(
    'seller/update_seller_info',
    async ({id, info}, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post(`/update-seller-info/${id}`, info, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const sellerReducer = createSlice({
    name: 'seller',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        sellers: [],
        totalSeller: 0,
        seller: ''
    },
    reducers: {

        messageClear: (state, _) => {
            state.successMessage = ""
            state.errorMessage = ""
        }

    },
    extraReducers: (builder) => {
        builder

            .addCase(get_seller_request.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers;
                state.totalSeller = payload.totalSeller;
            })
            .addCase(createSeller.pending, (state) => {
                state.loader = true;
            })
            .addCase(createSeller.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message;
            })
            .addCase(createSeller.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(get_seller.fulfilled, (state, { payload }) => {
                state.seller = payload.seller;
            })
            .addCase(seller_status_update.fulfilled, (state, { payload }) => {
                state.seller = payload.seller;
                state.successMessage = payload.message;
            })
            .addCase(get_sellers.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers;
                state.totalSeller = payload.totalSeller;
            })
            .addCase(active_stripe_connect_account.pending, (state, { payload }) => {
                state.loader = true;
            })
            .addCase(active_stripe_connect_account.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message;
            })
            .addCase(active_stripe_connect_account.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(update_seller_info.fulfilled, (state, { payload }) => {
                state.seller = payload.seller;
                state.successMessage = payload.message;
            })


    }

})
export const { messageClear } = sellerReducer.actions
export default sellerReducer.reducer