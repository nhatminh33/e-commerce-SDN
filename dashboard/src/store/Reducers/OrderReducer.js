import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";  
 
export const get_admin_orders = createAsyncThunk(
    'orders/get_admin_orders',
    async({ 
        parPage = 5, 
        page = 1, 
        searchValue = "", 
        orderStatus = "", 
        paymentStatus = "", 
        startDate = "", 
        endDate = "" 
    }, {rejectWithValue, fulfillWithValue}) => {
        try {
            let url = `/statistics/get-orders?page=${page}&searchValue=${searchValue}&parPage=${parPage}`;
            
            // Add filters to URL if provided
            if (orderStatus) url += `&orderStatus=${orderStatus}`;
            if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
            
            const {data} = await api.get(url, {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) { 
            return rejectWithValue(error.response?.data || { error: "Failed to load orders" });
        }
    }
)

  // End Method  
 
  export const get_admin_order = createAsyncThunk(
    'orders/get_admin_order',
    async( orderId ,{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.get(`/admin/order/${orderId}`,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method  

  export const admin_order_status_update = createAsyncThunk(
    'orders/admin_order_status_update',
    async( {orderId,info} ,{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.put(`/admin/order-status/update/${orderId}`,info,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method  

  export const get_seller_orders = createAsyncThunk(
    'orders/get_seller_orders',
    async({ parPage,page,searchValue,sellerId },{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.get(`/seller/orders/${sellerId}?page=${page}&searchValue=${searchValue}&parPage=${parPage}`,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method 

  export const manage_seller_orders = createAsyncThunk(
    'orders/manage_seller_orders',
    async({ parPage = 5, page = 1, searchValue = "", delivery_status, payment_status, startDate, endDate },{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.get(`/seller/orders?page=${page}&searchValue=${searchValue}&perPage=${parPage}${delivery_status ? `&delivery_status=${delivery_status}` : ''}${payment_status ? `&payment_status=${payment_status}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
  // End Method 


  export const get_seller_order = createAsyncThunk(
    'orders/get_seller_order',
    async( orderId ,{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.get(`/seller/order/${orderId}`,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method  

  export const seller_order_status_update = createAsyncThunk(
    'orders/seller_order_status_update',
    async( {orderId,info} ,{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.put(`/seller/order-status/update/${orderId}`,info,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method  

  export const update_order_status = createAsyncThunk(
    'orders/update_order_status',
    async({ orderId, delivery_status }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put('/seller/orders/update-status', {
                orderId,
                delivery_status
            }, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Có lỗi xảy ra' })
        }
    }
)
  // End Method
 
export const OrderReducer = createSlice({
    name: 'order',
    initialState:{
        successMessage :  '',
        errorMessage : '',
        totalOrder: 0,
        order : {}, 
        myOrders: [],
        loading: false
    },
    reducers : {

        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: (builder) => {
        builder
        // GET SELLER ORDERS
        .addCase(get_seller_orders.pending, (state) => {
            state.loading = true
        })
        .addCase(get_seller_orders.fulfilled, (state, action) => {
            state.loading = false
            state.myOrders = action.payload.orders
            state.totalOrder = action.payload.totalOrder
        })
        .addCase(get_seller_orders.rejected, (state, action) => {
            state.loading = false
            state.errorMessage = action.payload?.error || "Có lỗi xảy ra"
        })

        // MANAGE SELLER ORDERS
        .addCase(manage_seller_orders.pending, (state) => {
            state.loading = true
        })
        .addCase(manage_seller_orders.fulfilled, (state, action) => {
            state.loading = false
            state.myOrders = action.payload.orders
            state.totalOrder = action.payload.totalOrder
        })
        .addCase(manage_seller_orders.rejected, (state, action) => {
            state.loading = false
            state.errorMessage = action.payload?.error || "Có lỗi xảy ra"
        })

        // UPDATE ORDER STATUS
        .addCase(update_order_status.pending, (state) => {
            state.loading = true
        })
        .addCase(update_order_status.fulfilled, (state, action) => {
            state.loading = false
            state.successMessage = action.payload.message
            // Cập nhật trạng thái đơn hàng trong danh sách
            const updatedOrder = action.payload.order
            state.myOrders = state.myOrders.map(order => 
                order._id === updatedOrder._id ? {...order, delivery_status: updatedOrder.delivery_status} : order
            )
            // Nếu đang xem chi tiết đơn hàng, cập nhật luôn state order
            if (state.order && state.order._id === updatedOrder._id) {
                state.order = {...state.order, delivery_status: updatedOrder.delivery_status}
            }
        })
        .addCase(update_order_status.rejected, (state, action) => {
            state.loading = false
            state.errorMessage = action.payload?.error || "Có lỗi xảy ra khi cập nhật trạng thái"
        })

        .addCase(get_admin_orders.fulfilled, (state, { payload }) => {
            state.myOrders = payload.orders;
            state.totalOrder = payload.totalOrder; 
        })
        .addCase(get_admin_order.fulfilled, (state, { payload }) => {
            state.order = payload.order; 
        })
        .addCase(admin_order_status_update.pending, (state) => {
            state.loading = true
        })
        .addCase(admin_order_status_update.rejected, (state, { payload }) => {
            state.loading = false
            state.errorMessage = payload.message; 
        })
        .addCase(admin_order_status_update.fulfilled, (state, { payload }) => {
            state.loading = false
            state.successMessage = payload.message;
            // Cập nhật trạng thái đơn hàng đang xem
            if (payload.order) {
                state.order = {...state.order, delivery_status: payload.order.delivery_status};
                
                // Cập nhật trạng thái trong danh sách đơn hàng nếu có
                state.myOrders = state.myOrders.map(order => 
                    order._id === payload.order._id ? 
                    {...order, delivery_status: payload.order.delivery_status} : 
                    order
                )
            } 
        })

        .addCase(get_seller_order.fulfilled, (state, { payload }) => {
            state.order = payload.order; 
        })

        .addCase(seller_order_status_update.rejected, (state, { payload }) => {
            state.errorMessage = payload.message; 
        })
        .addCase(seller_order_status_update.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message; 
        })
 

    }

})
export const {messageClear} = OrderReducer.actions
export default OrderReducer.reducer