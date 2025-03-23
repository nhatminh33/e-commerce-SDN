import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const add_friend = createAsyncThunk(
    'chat/add_friend',
    async(info, { rejectWithValue,fulfillWithValue }) => {
        try {
            const {data} = await api.post('/chat/customer/add-customer-friend',info)
           // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// End Method 

export const send_message = createAsyncThunk(
    'chat/send_message',
    async(info, { rejectWithValue, fulfillWithValue }) => {
        try {
            console.log('Sending chat data to API:', info);
            
            // Đảm bảo có đủ thông tin cần thiết
            if (!info.userId || !info.sellerId || !info.text) {
                return rejectWithValue({
                    error: 'Missing required fields (userId, sellerId, text)'
                });
            }
            
            // Đảm bảo có senderName
            const dataToSend = {
                ...info,
                name: info.name || 'Customer'
            };
            
            const {data} = await api.post('/chat/customer/send-message-to-seller', dataToSend);
            console.log('Chat API response:', data);
            return fulfillWithValue(data);
        } catch (error) {
            console.error('Chat API error:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data || { error: 'Failed to send message' });
        }
    }
)
// End Method 

export const get_sellers = createAsyncThunk(
    'chat/customer/get_sellers',
    async(_, { rejectWithValue, fulfillWithValue }) => {
        try {
            console.log("Fetching sellers from API");
            const {data} = await api.get('/chat/customer/get-sellers');
            
            console.log("Received sellers data:", data);
            
            // Kiểm tra và chuẩn hóa dữ liệu
            if (data && data.sellers) {
                // Đảm bảo mỗi seller có thuộc tính sellerId và image
                const processedSellers = data.sellers.map(seller => ({
                    ...seller,
                    sellerId: seller.sellerId || seller._id,
                    image: seller.image || seller.avatar || '/images/seller.png'
                }));
                
                console.log("Processed sellers:", processedSellers);
                return fulfillWithValue({
                    ...data,
                    sellers: processedSellers
                });
            }
            
            return fulfillWithValue(data);
        } catch (error) {
            console.error("Error fetching sellers:", error);
            return rejectWithValue(error.response?.data || { error: "Không thể tải danh sách người bán" });
        }
    }
)
// End Method

export const get_seller_messages = createAsyncThunk(
    'chat/customer/get_seller_messages',
    async(params, { rejectWithValue, fulfillWithValue }) => {
        try {
            console.log("API call - get_seller_messages params:", params);
            
            // Kiểm tra tham số
            if (!params.userId || !params.sellerId) {
                console.error("Missing required parameters:", params);
                return rejectWithValue({
                    error: "Thiếu thông tin người dùng hoặc người bán"
                });
            }
            
            const endpoint = `/chat/get-messages/${params.userId}/${params.sellerId}`;
            console.log("API endpoint:", endpoint);
            
            const {data} = await api.get(endpoint);
            console.log("API response - get_seller_messages:", data);
            
            // Kiểm tra phản hồi
            if (!data || !data.messages) {
                console.warn("API response missing expected data:", data);
                
                // Tạo dữ liệu mặc định nếu thiếu
                return fulfillWithValue({
                    messages: [],
                    currentSeller: data.currentSeller || {
                        sellerId: params.sellerId,
                        name: "Seller",
                        image: '/images/seller.png'
                    }
                });
            }
            
            return fulfillWithValue(data);
        } catch (error) {
            console.error("API error - get_seller_messages:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data || {
                error: "Không thể tải tin nhắn"
            });
        }
    }
)
// End Method

export const get_unread_seller_counts = createAsyncThunk(
    'chat/customer/get_unread_counts',
    async(_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const {data} = await api.get('/chat/customer/unread-counts');
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)
// End Method

export const mark_seller_messages_as_read = createAsyncThunk(
    'chat/customer/mark_as_read',
    async(sellerId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const {data} = await api.patch(`/chat/customer/mark-as-read/${sellerId}`, {});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)
// End Method

export const chatReducer = createSlice({
    name: 'chat',
    initialState: {
        friends: [],
        my_friends: [],
        fb_messages: [],
        messages: [],
        currentSeller: null,
        currentMessages: [],
        sellers: [],
        seller_messages: [],
        seller_message_counts: 0,
        successMessage: '',
        error: '',
        myFriendMessages: [],
        currentFriend: {},
        currentFriends: [],
        typingMessage: '',
        activeUsers: [],
        loadingMessageSend: false,
        messageSuccess: false,
        loading: false,
        sellerUnreadCounts: {},
        isOpenMessageBox: false,
    },
    reducers: {
        messageClear: (state) => {
            state.successMessage = '';
            state.error = '';
            state.messageSuccess = false;
        },
        updateMessage: (state, action) => {
            const message = action.payload;
            if (state.fb_messages && Array.isArray(state.fb_messages)) {
                state.fb_messages = [...state.fb_messages, message];
            } else {
                state.fb_messages = [message];
            }
        },
        setIsOpenMessageBox: (state, action) => {
            state.isOpenMessageBox = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder 
        .addCase(add_friend.fulfilled, (state, { payload }) => { 
            state.messages = payload.messages;
            state.currentFd = payload.currentFd;
            state.currentFriends = payload.MyFriends;
        })
        .addCase(send_message.fulfilled, (state, { payload }) => { 
            if (state.currentFriends && Array.isArray(state.currentFriends)) {
                let tempFriends = state.currentFriends;
                if (payload.message && payload.message.receverId) {
                    let index = tempFriends.findIndex(f => f.fdId === payload.message.receverId);
                    while (index > 0) {
                        let temp = tempFriends[index];
                        tempFriends[index] = tempFriends[index - 1];
                        tempFriends[index - 1] = temp;
                        index--;
                    }
                    state.currentFriends = tempFriends;
                }
            }

            if (payload.message) {
                if (!state.messages) {
                    state.messages = [];
                }
                state.messages = [...state.messages, payload.message];
            }
            
            state.successMessage = 'Message Send Success';
        })

        // Customer gets sellers
        .addCase(get_sellers.pending, (state) => {
            state.loader = true;
        })
        
        .addCase(get_sellers.fulfilled, (state, action) => {
            state.loader = false;
            state.sellers = action.payload.sellers;
        })

        .addCase(get_sellers.rejected, (state, action) => {
            state.loader = false;
            state.errorMessage = action.payload.error;
        })

        // Customer gets unread counts
        .addCase(get_unread_seller_counts.pending, (state) => {
            state.loader = true;
        })
        
        .addCase(get_unread_seller_counts.fulfilled, (state, action) => {
            state.loader = false;
            state.sellerUnreadCounts = action.payload.unreadCounts;
        })

        .addCase(get_unread_seller_counts.rejected, (state, action) => {
            state.loader = false;
            state.errorMessage = action.payload.error;
        })

        // Customer mark seller messages as read
        .addCase(mark_seller_messages_as_read.fulfilled, (state, action) => {
            const sellerId = action.meta.arg;
            if (state.sellerUnreadCounts[sellerId]) {
                state.sellerUnreadCounts[sellerId] = 0;
            }
        })
        
        // Customer gets seller messages
        .addCase(get_seller_messages.pending, (state) => {
            state.loader = true;
        })
        
        .addCase(get_seller_messages.fulfilled, (state, action) => {
            state.loader = false;
            state.messages = action.payload.messages;
            state.currentSeller = action.payload.currentSeller;
            
            // Lưu thông tin currentCustomer nếu có
            if (action.payload.currentCustomer) {
                state.currentCustomer = action.payload.currentCustomer;
            }
        })
        
        .addCase(get_seller_messages.rejected, (state, action) => {
            state.loader = false;
            state.errorMessage = action.payload.error;
        })
    }
})
export const {messageClear,updateMessage,setIsOpenMessageBox} = chatReducer.actions
export default chatReducer.reducer