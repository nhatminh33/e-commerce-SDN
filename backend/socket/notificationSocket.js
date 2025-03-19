const Notification = require('../models/adminNotification');
const User = require('../models/userModel');

// Theo dõi người dùng đang hoạt động
let activeUsers = [];

// Hàm so sánh ID an toàn
const compareUserId = (id1, id2) => {
  if (!id1 || !id2) return false;
  
  try {
    const str1 = id1.toString ? id1.toString() : String(id1);
    const str2 = id2.toString ? id2.toString() : String(id2);
    return str1 === str2;
  } catch (error) {
    console.error('Error comparing user IDs:', error);
    return false;
  }
};

const logEvent = (socketId, event, data = {}) => {
  console.log(`[Socket:${socketId}] ${event}:`, typeof data === 'object' ? JSON.stringify(data).substring(0, 100) : data);
};

const notificationSocket = (socket, io) => {
  logEvent(socket.id, 'Connected', socket.handshake.query);

  // Xử lý khi người dùng đăng ký
  socket.on('add_user', (userId, userInfo) => {
    // Kiểm tra nếu người dùng đã tồn tại
    const existingUserIndex = activeUsers.findIndex(user => compareUserId(user.userId, userId));
    
    if (existingUserIndex !== -1) {
      // Cập nhật thông tin người dùng
      activeUsers[existingUserIndex].socketId = socket.id;
      activeUsers[existingUserIndex].userInfo = userInfo;
      activeUsers[existingUserIndex].connectedAt = new Date();
      logEvent(socket.id, 'User updated', { userId, role: userInfo?.role });
    } else {
      // Thêm người dùng mới
      activeUsers.push({
        userId,
        socketId: socket.id,
        userInfo,
        connectedAt: new Date()
      });
      logEvent(socket.id, 'User added', { userId, role: userInfo?.role });
    }
    
    // Gửi danh sách người dùng đang hoạt động
    io.emit('activeUsers', activeUsers);
  });

  // Gửi thông báo từ admin đến seller
  socket.on('sendNotification', async (data) => {
    logEvent(socket.id, 'sendNotification', data);
    const { sender, receiver, message } = data;

    try {
      // Xác định danh sách người nhận
      let sellerIds = [];
      let sellerSocketIds = [];
      
      if (receiver === 'all') {
        // Gửi đến tất cả người bán
        const sellers = await User.find({ role: 'seller' }).select('_id');
        sellerIds = sellers.map(seller => seller._id);
        
        // Tìm socket ID của các sellers đang online
        sellerSocketIds = activeUsers
          .filter(user => user.userInfo && user.userInfo.role === 'seller')
          .map(user => user.socketId);
      } else if (Array.isArray(receiver)) {
        // Gửi đến danh sách cụ thể
        sellerIds = receiver;
        
        // Tìm socket ID của các sellers cụ thể đang online
        sellerSocketIds = activeUsers
          .filter(user => receiver.some(id => compareUserId(user.userId, id)))
          .map(user => user.socketId);
      } else if (receiver) {
        // Gửi đến một người dùng cụ thể
        sellerIds = [receiver];
        
        // Tìm socket ID của seller cụ thể nếu đang online
        const sellerUser = activeUsers.find(user => compareUserId(user.userId, receiver));
        if (sellerUser) {
          sellerSocketIds = [sellerUser.socketId];
        }
      }
      
      // Gửi thông báo đến tất cả người nhận đang online
      if (sellerSocketIds.length > 0) {
        sellerSocketIds.forEach(socketId => {
          io.to(socketId).emit('newNotification', {
            sender,
            message
          });
        });
        
        logEvent(socket.id, 'Notifications sent', { 
          count: sellerSocketIds.length, 
          total: sellerIds.length 
        });
      }
      
      // Gửi thông báo xác nhận đến tất cả admin
      const adminSocketIds = activeUsers
        .filter(user => user.userInfo && user.userInfo.role === 'admin')
        .map(admin => admin.socketId);
      
      adminSocketIds.forEach(adminSocketId => {
        io.to(adminSocketId).emit('notificationSent', { success: true });
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      socket.emit('notificationSent', { 
        success: false, 
        error: error.message 
      });
    }
  });

  // Xử lý khi seller đọc thông báo
  socket.on('markNotificationAsRead', async (data, callback) => {
    logEvent(socket.id, 'markNotificationAsRead', data);
    const { notificationId, userId, userInfo } = data;
    
    try {
      if (!notificationId || !userId) {
        if (typeof callback === 'function') {
          callback({ 
            success: false, 
            error: 'Missing required data' 
          });
        }
        return;
      }
      
      // First, find the notification to check if the user is already a viewer
      const existingNotification = await Notification.findById(notificationId);
      
      if (!existingNotification) {
        if (typeof callback === 'function') {
          callback({ 
            success: false, 
            error: 'Notification not found' 
          });
        }
        return;
      }
      
      // Check if user is already a viewer (to avoid duplicate)
      const isAlreadyViewer = existingNotification.viewers.some(
        viewerId => compareUserId(viewerId.toString(), userId)
      );
      
      if (!isAlreadyViewer) {
        // Add user to viewers (only storing the ID, not the entire object)
        existingNotification.viewers.push(userId);
        await existingNotification.save();
        
        console.log(`User ${userId} added to viewers for notification ${notificationId}`);
      } else {
        console.log(`User ${userId} is already a viewer for notification ${notificationId}`);
      }
      
      // Get the updated notification with populated data
      const notification = await Notification.findById(notificationId)
        .populate('sender', 'name email image')
        .populate('receiver', 'name email image')
        .populate('viewers', 'name email image');
      
      // Notify all admins about the updated viewers
      const adminSocketIds = activeUsers
        .filter(user => user.userInfo && user.userInfo.role === 'admin')
        .map(admin => admin.socketId);
      
      if (adminSocketIds.length > 0) {
        console.log(`Sending notificationViewed event to ${adminSocketIds.length} admins`);
        
        adminSocketIds.forEach(adminSocketId => {
          io.to(adminSocketId).emit('notificationViewed', {
            notificationId,
            viewerId: userId,
            notification
          });
        });
      } else {
        console.log('No admin users online to receive viewer update');
      }
      
      // Send acknowledgment back to client
      if (typeof callback === 'function') {
        callback({ 
          success: true,
          notification
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (typeof callback === 'function') {
        callback({ 
          success: false, 
          error: error.message 
        });
      }
    }
  });

  // Xử lý khi admin xóa thông báo
  socket.on('deleteNotification', async (data) => {
    logEvent(socket.id, 'deleteNotification', data);
    const { notificationId, receivers } = data;
    
    try {
      if (!notificationId) {
        return socket.emit('deleteNotificationResponse', {
          success: false,
          error: 'Invalid notification ID'
        });
      }
      
      // Gửi thông báo đến tất cả người nhận bị ảnh hưởng
      if (Array.isArray(receivers) && receivers.length > 0) {
        // Lấy danh sách socketId của các người nhận đang online
        const receiverSocketIds = activeUsers
          .filter(user => receivers.some(id => compareUserId(user.userId, id)))
          .map(user => user.socketId);
        
        // Gửi sự kiện xóa đến tất cả người nhận
        receiverSocketIds.forEach(receiverSocketId => {
          io.to(receiverSocketId).emit('notificationDeleted', {
            notificationId
          });
        });
        
        logEvent(socket.id, 'Deletion notification sent', {
          count: receiverSocketIds.length,
          total: receivers.length
        });
      }
      
      // Thông báo đến các admin khác
      const adminSocketIds = activeUsers
        .filter(user => 
          user.userInfo && 
          user.userInfo.role === 'admin' && 
          user.socketId !== socket.id
        )
        .map(admin => admin.socketId);
      
      adminSocketIds.forEach(adminSocketId => {
        io.to(adminSocketId).emit('notificationDeleted', {
          notificationId
        });
      });
      
      socket.emit('deleteNotificationResponse', { 
        success: true, 
        notificationId,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      socket.emit('deleteNotificationResponse', { 
        success: false, 
        error: error.message 
      });
    }
  });

  // Xử lý khi admin cập nhật thông báo
  socket.on('updateNotification', async (data) => {
    logEvent(socket.id, 'updateNotification', data);
    const { notificationId, message, oldReceivers, newReceivers } = data;
    
    try {
      if (!notificationId) {
        return socket.emit('updateNotificationResponse', {
          success: false,
          error: 'Invalid notification ID'
        });
      }
      
      // Gửi thông báo đến những người trong danh sách mới
      if (Array.isArray(newReceivers) && newReceivers.length > 0) {
        const receiverSocketIds = activeUsers
          .filter(user => newReceivers.some(id => compareUserId(user.userId, id)))
          .map(user => user.socketId);
        
        receiverSocketIds.forEach(receiverSocketId => {
          io.to(receiverSocketId).emit('notificationUpdated', {
            notificationId,
            message
          });
        });
        
        logEvent(socket.id, 'Update notification sent', {
          count: receiverSocketIds.length,
          total: newReceivers.length
        });
      }
      
      // Gửi thông báo xóa đến những người đã bị loại khỏi danh sách
      if (Array.isArray(oldReceivers) && Array.isArray(newReceivers)) {
        const removedReceivers = oldReceivers.filter(
          id => !newReceivers.some(newId => compareUserId(id, newId))
        );
        
        if (removedReceivers.length > 0) {
          const removedSocketIds = activeUsers
            .filter(user => removedReceivers.some(id => compareUserId(user.userId, id)))
            .map(user => user.socketId);
          
          removedSocketIds.forEach(receiverSocketId => {
            io.to(receiverSocketId).emit('notificationDeleted', {
              notificationId
            });
          });
          
          logEvent(socket.id, 'Deletion notification sent to removed users', {
            count: removedSocketIds.length,
            total: removedReceivers.length
          });
        }
      }
      
      // Thông báo đến các admin khác
      const adminSocketIds = activeUsers
        .filter(user => 
          user.userInfo && 
          user.userInfo.role === 'admin' && 
          user.socketId !== socket.id
        )
        .map(admin => admin.socketId);
      
      adminSocketIds.forEach(adminSocketId => {
        io.to(adminSocketId).emit('notificationUpdated', {
          notificationId,
          message
        });
      });
      
      socket.emit('updateNotificationResponse', { 
        success: true, 
        notificationId,
        message: 'Notification updated successfully'
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      socket.emit('updateNotificationResponse', { 
        success: false, 
        error: error.message 
      });
    }
  });

  // Xử lý khi người dùng ngắt kết nối
  socket.on('disconnect', () => {
    const disconnectedUser = activeUsers.find(user => user.socketId === socket.id);
    if (disconnectedUser) {
      logEvent(socket.id, 'User disconnected', { 
        userId: disconnectedUser.userId,
        role: disconnectedUser.userInfo?.role 
      });
    }
    
    // Xóa người dùng khỏi danh sách
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    io.emit('activeUsers', activeUsers);
  });
};

module.exports = notificationSocket; 