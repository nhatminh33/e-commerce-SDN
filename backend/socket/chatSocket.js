// Track connected users
let activeSellers = [];
let activeCustomers = [];
let activeAdmin = '';

const chatSocket = (socket, io) => {
  // Register seller on connection
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

  // Register customer on connection
  socket.on('add_customer', (customerId, customerInfo) => {
    if (!customerId) return;
    
    const existingCustomerIndex = activeCustomers.findIndex(c => c.customerId === customerId);
    
    if (existingCustomerIndex !== -1) {
      activeCustomers[existingCustomerIndex].socketId = socket.id;
    } else {
      activeCustomers.push({
        customerId,
        socketId: socket.id,
        customerInfo
      });
    }
    
    io.emit('activeCustomers', activeCustomers);
  });

  // Register admin on connection
  socket.on('add_admin', (adminId) => {
    activeAdmin = socket.id;
    
    // Notify admin about active sellers
    socket.emit('activeSellers', activeSellers);
  });

  // Handle messages from seller to admin
  socket.on('send_message_seller_to_admin', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId) return;
    
    if (activeAdmin) {
      // Send message to all admins
      io.to(activeAdmin).emit('receved_seller_message', message);
    }
  });

  // Handle messages from admin to seller
  socket.on('send_message_admin_to_seller', (message) => {
    const seller = activeSellers.find(s => s.sellerId === message.receverId);
    
    if (seller) {
      io.to(seller.socketId).emit('receved_admin_message', message);
    }
  });

  // Handle product messages from customer to seller
  socket.on('send_product_message_customer_to_seller', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId || !message.receverId) return;
    
    const seller = activeSellers.find(s => s.sellerId === message.receverId);
    
    if (seller) {
      io.to(seller.socketId).emit('receved_product_message', message);
    }
  });

  // Handle messages from seller to customer
  socket.on('send_message_seller_to_customer', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId || !message.receverId) return;
    
    const customer = activeCustomers.find(c => c.customerId === message.receverId);
    
    if (customer) {
      // Add timestamp to message for debugging
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };
      io.to(customer.socketId).emit('receved_seller_message', messageWithTimestamp);
    }
  });

  // Handle messages from customer to seller
  socket.on('send_message_customer_to_seller', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId || !message.receverId) return;
    
    const seller = activeSellers.find(s => s.sellerId === message.receverId);
    
    if (seller) {
      // Add timestamp to message for debugging
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      };
      io.to(seller.socketId).emit('receved_customer_message', messageWithTimestamp);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const sellerIndex = activeSellers.findIndex(s => s.socketId === socket.id);
    
    if (sellerIndex !== -1) {
      activeSellers.splice(sellerIndex, 1);
      io.emit('activeSellers', activeSellers);
    }

    const customerIndex = activeCustomers.findIndex(c => c.socketId === socket.id);
    
    if (customerIndex !== -1) {
      activeCustomers.splice(customerIndex, 1);
      io.emit('activeCustomers', activeCustomers);
    }
    
    if (activeAdmin === socket.id) {
      activeAdmin = '';
    }
  });
};

module.exports = chatSocket;