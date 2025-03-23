import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const get_customers = createAsyncThunk(
    'chat/get_customers',
    async(_, {rejectWithValue, fulfillWithValue}) => {
        try {
            // Không cần sellerId nữa vì API sẽ lấy từ req.id
            const {data} = await api.get('/chat/seller/get-customers', {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const get_customer_message = createAsyncThunk(
    'chat/get_customer_message',
    async(customerId, {rejectWithValue, fulfillWithValue}) => {
        try {
            console.log('customerId', customerId);
            // Chỉ cần customerId, không cần sellerId
            const {data} = await api.get(`/chat/seller/get-customer-messages/${customerId.customerId}`, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const send_message = createAsyncThunk(
    'chat/send_message',
    async(info, {rejectWithValue, fulfillWithValue}) => {
        try {
            // Không cần gửi sellerId trong info nữa
            const messageData = {
                customerId: info.customerId,
                message: info.message,
                senderName: info.senderName // Tùy chọn
            };
            
            const {data} = await api.post('/chat/seller/send-message-to-customer', messageData, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const get_sellers = createAsyncThunk(
    'chat/get_sellers',
    async(_,{rejectWithValue, fulfillWithValue}) => {
        
        try {
            const {data} = await api.get(`/chat/admin/get-sellers` ,{withCredentials: true}) 
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 


export const send_message_seller_admin = createAsyncThunk(
    'chat/send_message_seller_admin',
    async(info,{rejectWithValue, fulfillWithValue}) => {
        
        try {
            const {data} = await api.post(`/chat/message-send-seller-admin`, info, {withCredentials: true}) 
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 


export const get_admin_message = createAsyncThunk(
    'chat/get_admin_message',
    async(receverId,{rejectWithValue, fulfillWithValue}) => {
        
        try {
            const {data} = await api.get(`/chat/get-admin-messages/${receverId}`, {withCredentials: true}) 
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 


export const get_seller_message = createAsyncThunk(
    'chat/get_seller_message',
    async(receverId,{rejectWithValue, fulfillWithValue}) => {
        
        try {
            const {data} = await api.get(`/chat/get-seller-messages`, {withCredentials: true}) 
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const get_unread_counts = createAsyncThunk(
    'chat/get_unread_counts',
    async(_, {rejectWithValue, fulfillWithValue}) => {
        try {
            // Lấy số lượng tin nhắn chưa đọc từ API
            const {data} = await api.get('/chat/seller/unread-counts', {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method

export const mark_as_read = createAsyncThunk(
    'chat/mark_as_read',
    async(customerId, {rejectWithValue, fulfillWithValue}) => {
        try {
            // Đánh dấu tin nhắn là đã đọc
            const {data} = await api.patch(`/chat/seller/mark-as-read/${customerId}`, {}, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) { 
            return rejectWithValue(error.response.data)
        }
    }
)

export const chatReducer = createSlice({
    name: 'chat',
    initialState:{
        successMessage :  '',
        errorMessage : '',
        customers: [],
        messages : [],
        activeCustomer: [],
        activeSeller : [],
        activeAdmin: "",
        friends: [],
        seller_admin_message: [],
        currentSeller: {},
        currentCustomer: {},
        sellers: [],
        adminInfo: {},
        unreadCounts: {},
        totalUnreadMessages: 0
    },
    reducers : {

        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        },
        updateMessage: (state, {payload}) => {
            state.messages = [...state.messages, payload]
        },
        updateSellers: (state, {payload}) => {
            state.activeSeller = payload
        },
        updateCustomer: (state, {payload}) => {
            state.activeCustomer = payload
        },
        updateAdminMessage: (state, {payload}) => {
            state.seller_admin_message = [...state.seller_admin_message, payload]
        },
        updateSellerMessage: (state, {payload}) => {
            state.seller_admin_message = [...state.seller_admin_message, payload]
        },

    },
    extraReducers: (builder) => {
        builder
       
        .addCase(get_customers.fulfilled, (state, { payload }) => { 
            state.customers = payload.customers 
        }) 
        .addCase(get_customer_message.fulfilled, (state, { payload }) => { 
            state.messages = payload.messages 
            state.currentCustomer = payload.currentCustomer 
        }) 
        .addCase(send_message.fulfilled, (state, { payload }) => { 
            let tempFriends = state.customers
            let index = tempFriends.findIndex(f => f.fdId === payload.message.receverId)
            while (index > 0) {
                let temp = tempFriends[index]
                tempFriends[index] = tempFriends[index - 1]
                tempFriends[index - 1] = temp
                index--
            }            
            state.customers = tempFriends;
            state.messages = [...state.messages, payload.message];
            state.successMessage = 'Message Send Success';
        })

        .addCase(get_sellers.fulfilled, (state, { payload }) => { 
            state.sellers = payload.sellers  
        }) 
        .addCase(send_message_seller_admin.fulfilled, (state, { payload }) => { 
            state.seller_admin_message = [...state.seller_admin_message, payload.message]  
            state.successMessage = 'Message Send Success';
        })

        .addCase(get_admin_message.fulfilled, (state, { payload }) => { 
            state.seller_admin_message = payload.messages  
            state.currentSeller = payload.currentSeller  
        })
        .addCase(get_seller_message.fulfilled, (state, { payload }) => { 
            state.seller_admin_message = payload.messages 
            state.adminInfo = payload.adminInfo
        })
        
        // New reducer for unread counts
        .addCase(get_unread_counts.fulfilled, (state, { payload }) => {
            state.unreadCounts = payload.unreadCounts
            state.totalUnreadMessages = Object.values(payload.unreadCounts).reduce((sum, count) => sum + count, 0)
        })
        
        // New reducer for mark as read
        .addCase(mark_as_read.fulfilled, (state, { payload }) => {
            // Đã đánh dấu tin nhắn là đã đọc, cần cập nhật lại state
            if (state.currentCustomer && state.currentCustomer.fdId) {
                const customerId = state.currentCustomer.fdId;
                // Xóa unread count cho customer này
                if (state.unreadCounts[customerId]) {
                    const oldCount = state.unreadCounts[customerId];
                    state.totalUnreadMessages -= oldCount;
                    delete state.unreadCounts[customerId];
                }
            }
        })
 
    }

})
export const {messageClear,updateMessage,updateSellers,updateCustomer,updateAdminMessage,updateSellerMessage} = chatReducer.actions
export default chatReducer.reducer