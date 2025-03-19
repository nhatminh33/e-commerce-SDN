// Theo dõi người dùng đang kết nối
let activeSellers = [];
let activeAdmin = '';

const chatSocket = (socket, io) => {
  // Đăng ký seller khi kết nối
  socket.on('add_seller', (sellerId, sellerInfo) => {
    if (!sellerId) return;
    
    const existingSellerIndex = activeSellers.findIndex(s => s.sellerId === sellerId);
    
    if (existingSellerIndex !== -1) {
      activeSellers[existingSellerIndex].socketId = socket.id;
    } else {
      activeSellers.push({
        sellerId,
        socketId: socket.id,
        sellerInfo
      });
    }
    
    io.emit('activeSellers', activeSellers);
  });

  // Đăng ký admin khi kết nối
  socket.on('add_admin', (adminId) => {
    activeAdmin = socket.id;
    console.log('Admin đã kết nối với socket ID:', socket.id);
    
    // Thông báo cho admin biết danh sách seller đang hoạt động
    socket.emit('activeSellers', activeSellers);
  });

  // Xử lý tin nhắn từ seller đến admin
  socket.on('send_message_seller_to_admin', (message) => {
    // Đảm bảo tin nhắn có định dạng đúng
    if (!message || !message.senderId) {
      console.log('Tin nhắn không hợp lệ:', message);
      return;
    }
    
    console.log('Tin nhắn từ seller:', message.senderId, 'đến admin');
    console.log('Admin socket ID:', activeAdmin);
    
    if (activeAdmin) {
      console.log('Đang gửi tin nhắn đến admin');
      // Gửi tin nhắn đến tất cả các admin
      io.to(activeAdmin).emit('receved_seller_message', message);
    } else {
      console.log('Không có admin online để nhận tin nhắn');
    }
  });

  // Xử lý tin nhắn từ admin đến seller
  socket.on('send_message_admin_to_seller', (message) => {
    const seller = activeSellers.find(s => s.sellerId === message.receverId);
    
    if (seller) {
      io.to(seller.socketId).emit('receved_admin_message', message);
    }
  });

  // Xử lý khi người dùng ngắt kết nối
  socket.on('disconnect', () => {
    const sellerIndex = activeSellers.findIndex(s => s.socketId === socket.id);
    
    if (sellerIndex !== -1) {
      activeSellers.splice(sellerIndex, 1);
      io.emit('activeSellers', activeSellers);
    }
    
    if (activeAdmin === socket.id) {
      activeAdmin = '';
    }
  });
};

module.exports = chatSocket;