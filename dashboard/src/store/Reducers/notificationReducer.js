import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Thunk to get notifications for specific user
export const getNotificationsAsync = createAsyncThunk(
  'notification/getNotifications',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const { page = 1, limit = 10, search = '', status = 'all' } = params;
      
      const queryString = `page=${page}&limit=${limit}&search=${search}&status=${status}`;
      
      const { data } = await api.get(`/notify?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching notifications');
    }
  }
);

// Thunk to get all notifications (admin only)
export const getAllNotificationsAsync = createAsyncThunk(
  'notification/getAllNotifications',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = 'all', 
        receiver = '' 
      } = params;
      
      const queryString = `page=${page}&limit=${limit}&search=${search}&status=${status}&receiver=${receiver}`;
      
      const { data } = await api.get(`/notify/all?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching all notifications');
    }
  }
);

// Thunk to get all sellers
export const getSellerListAsync = createAsyncThunk(
  'notification/getSellerList',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      const { data } = await api.get(`/notify/sellers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching sellers list');
    }
  }
);

// Thunk to delete notification
export const deleteNotificationAsync = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const { data } = await api.delete(`/notify/delete/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return { id: notificationId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting notification');
    }
  }
);

// Thunk to create new notification
export const createNotificationAsync = createAsyncThunk(
  'notification/createNotification',
  async (notificationData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const { data } = await api.post(`/notify/create`, notificationData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating notification');
    }
  }
);

// Thunk to update notification
export const updateNotificationAsync = createAsyncThunk(
  'notification/updateNotification',
  async ({ id, message, receiver }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      // Chuẩn bị dữ liệu cập nhật
      const updateData = { message };
      
      // Nếu có receiver, thêm vào dữ liệu cập nhật
      if (receiver) {
        // Có thể receiver là "all", một ID đơn lẻ, hoặc một mảng các ID
        updateData.receiver = receiver;
      }
      
      const { data } = await api.put(`/notify/update/${id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    sellers: [],
    pagination: null,
    loading: false,
    error: null,
    success: false,
    message: ''
  },
  reducers: {
    clearMessage: (state) => {
      state.message = '';
      state.success = false;
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    // Thêm reducer để cập nhật viewer của một thông báo
    updateNotificationViewers: (state, action) => {
      const { notificationId, notification } = action.payload;
      
      // Nếu có thông báo mới đến từ socket, cập nhật viewers trong state
      if (notificationId && notification) {
        state.notifications = state.notifications.map(item => 
          item._id === notificationId 
            ? { ...item, viewers: notification.viewers } 
            : item
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle get notifications for user
      .addCase(getNotificationsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotificationsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(getNotificationsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle get all notifications (admin)
      .addCase(getAllNotificationsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllNotificationsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(getAllNotificationsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle get seller list
      .addCase(getSellerListAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSellerListAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.sellers = action.payload.sellers || [];
        state.error = null;
      })
      .addCase(getSellerListAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle delete notification
      .addCase(deleteNotificationAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.filter(
          notification => notification._id !== action.payload.id
        );
        state.success = true;
        state.message = 'Notification deleted';
      })
      .addCase(deleteNotificationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle create notification
      .addCase(createNotificationAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNotificationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'New notification created';
      })
      .addCase(createNotificationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle update notification
      .addCase(updateNotificationAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateNotificationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Notification updated';
      })
      .addCase(updateNotificationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { clearMessage, addNotification, updateNotificationViewers } = notificationSlice.actions;

export default notificationSlice.reducer; 