import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const place_order = createAsyncThunk(
    'order/place_order',
    async ({ userId, shippingInfo, selectedItems }, { rejectWithValue, fulfillWithValue }) => {
        try {
            console.log({ userId, shippingInfo, selectedItems });

            const { data } = await api.post("/customer/order", { userId, shippingInfo, selectedItems })
            console.log(data);

            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }

    }
)
// End Method 

export const get_orders = createAsyncThunk(
    'order/get_orders',
    async ({ customerId }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/customer/orders/${customerId}`)
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const get_order_details = createAsyncThunk(
    'order/get_order_details',
    async (orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/home/coustomer/get-order-details/${orderId}`)
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 



export const orderReducer = createSlice({
    name: 'order',
    initialState: {
        myOrders: [],
        errorMessage: '',
        successMessage: '',
        myOrder: {},
    },
    reducers: {

        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        },
        reset_count: (state, _) => {
            state.card_product_count = 0
            state.wishlist_count = 0
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(place_order.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                state.myOrder = payload.orders
            })
            .addCase(get_orders.fulfilled, (state, { payload }) => {
                state.myOrders = payload.orders;
            })
            .addCase(get_order_details.fulfilled, (state, { payload }) => {
                state.myOrder = payload.order;
            })

    }
})
export const { messageClear, reset_count } = orderReducer.actions
export default orderReducer.reducer