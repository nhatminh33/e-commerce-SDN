// Track connected users
let activeSellers = [];
let activeCustomers = [];
let activeAdmin = '';

const chatSocket = (socket, io) => {
  console.log(`Socket connected: ${socket.id}`);

  // Register seller on connection
  socket.on('add_seller', (sellerId, sellerInfo) => {
    if (!sellerId) {
      console.log('Invalid seller ID in add_seller event');
      return;
    }
    
    console.log(`Seller ${sellerId} connected with socket ${socket.id}`);
    
    const existingSellerIndex = activeSellers.findIndex(s => String(s.sellerId) === String(sellerId));
    
    if (existingSellerIndex !== -1) {
      activeSellers[existingSellerIndex].socketId = socket.id;
      activeSellers[existingSellerIndex].sellerInfo = sellerInfo || activeSellers[existingSellerIndex].sellerInfo;
      console.log(`Updated existing seller: ${sellerId}`);
    } else {
      activeSellers.push({
        sellerId,
        socketId: socket.id,
        sellerInfo: sellerInfo || {}
      });
      console.log(`Added new seller: ${sellerId}`);
    }
    
    io.emit('activeSellers', activeSellers);
    console.log(`Total active sellers: ${activeSellers.length}`);
  });

  // Register customer on connection
  socket.on('add_customer', (customerId, customerInfo) => {
    if (!customerId) {
      console.log('Invalid customer ID in add_customer event');
      return;
    }
    
    console.log(`Customer ${customerId} connected with socket ${socket.id}`);
    
    const existingCustomerIndex = activeCustomers.findIndex(c => String(c.customerId) === String(customerId));
    
    if (existingCustomerIndex !== -1) {
      activeCustomers[existingCustomerIndex].socketId = socket.id;
      activeCustomers[existingCustomerIndex].customerInfo = customerInfo || activeCustomers[existingCustomerIndex].customerInfo;
      console.log(`Updated existing customer: ${customerId}`);
    } else {
      activeCustomers.push({
        customerId,
        socketId: socket.id,
        customerInfo: customerInfo || {}
      });
      console.log(`Added new customer: ${customerId}`);
    }
    
    io.emit('activeCustomers', activeCustomers);
    console.log(`Total active customers: ${activeCustomers.length}`);
  });

  // Register admin on connection
  socket.on('add_admin', (adminId) => {
    activeAdmin = socket.id;
    console.log(`Admin ${adminId} connected with socket ${socket.id}`);
    
    // Notify admin about active sellers
    socket.emit('activeSellers', activeSellers);
  });

  // Handle messages from seller to admin
  socket.on('send_message_seller_to_admin', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId) {
      console.log('Invalid message format in send_message_seller_to_admin');
      return;
    }
    
    console.log(`Sending message from seller ${message.senderId} to admin`);
    
    if (activeAdmin) {
      // Send message to all admins
      io.to(activeAdmin).emit('receved_seller_message', message);
    } else {
      console.log('No active admin to receive the message');
    }
  });

  // Handle messages from admin to seller
  socket.on('send_message_admin_to_seller', (message) => {
    if (!message || !message.receverId) {
      console.log('Invalid message format in send_message_admin_to_seller');
      return;
    }
    
    console.log(`Sending message from admin to seller ${message.receverId}`);
    
    const seller = activeSellers.find(s => String(s.sellerId) === String(message.receverId));
    
    if (seller) {
      console.log(`Found active seller ${seller.sellerId}, sending message`);
      io.to(seller.socketId).emit('receved_admin_message', message);
    } else {
      console.log(`Seller ${message.receverId} is not active or not found`);
    }
  });

  // Handle product messages from customer to seller
  socket.on('send_product_message_customer_to_seller', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId || !message.receverId) {
      console.log('Invalid message format in send_product_message_customer_to_seller', message);
      return;
    }
    
    console.log(`Sending product message from customer ${message.senderId} to seller ${message.receverId}`);
    
    // Use String comparison to handle different types
    const seller = activeSellers.find(s => String(s.sellerId) === String(message.receverId));
    
    if (seller) {
      console.log(`Found active seller ${seller.sellerId}, sending product message`);
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };
      io.to(seller.socketId).emit('receved_customer_message', messageWithTimestamp);
    } else {
      console.log(`Seller ${message.receverId} is not active or not found`);
    }
  });

  // Handle messages from seller to customer
  socket.on('send_message_seller_to_customer', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId || !message.receverId) {
      console.log('Invalid message format in send_message_seller_to_customer', message);
      return;
    }
    
    console.log(`Sending message from seller ${message.senderId} to customer ${message.receverId}`);
    
    // Use String comparison to handle different types
    const customer = activeCustomers.find(c => String(c.customerId) === String(message.receverId));
    
    if (customer) {
      console.log(`Found active customer ${customer.customerId}, sending message`);
      // Add timestamp to message for debugging
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };
      io.to(customer.socketId).emit('receved_seller_message', messageWithTimestamp);
    } else {
      console.log(`Customer ${message.receverId} is not active or not found`);
    }
  });

  // Handle messages from customer to seller
  socket.on('send_message_customer_to_seller', (message) => {
    // Ensure message has correct format
    if (!message || !message.senderId || !message.receverId) {
      console.log('Invalid message format in send_message_customer_to_seller', message);
      return;
    }
    
    console.log(`Sending message from customer ${message.senderId} to seller ${message.receverId}`);
    
    // Use String comparison to handle different types
    const seller = activeSellers.find(s => String(s.sellerId) === String(message.receverId));
    
    if (seller) {
      console.log(`Found active seller ${seller.sellerId}, sending message`);
      // Add timestamp to message for debugging
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      };
      io.to(seller.socketId).emit('receved_customer_message', messageWithTimestamp);
    } else {
      console.log(`Seller ${message.receverId} is not active or not found`);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    const sellerIndex = activeSellers.findIndex(s => s.socketId === socket.id);
    
    if (sellerIndex !== -1) {
      console.log(`Seller ${activeSellers[sellerIndex].sellerId} disconnected`);
      activeSellers.splice(sellerIndex, 1);
      io.emit('activeSellers', activeSellers);
    }

    const customerIndex = activeCustomers.findIndex(c => c.socketId === socket.id);
    
    if (customerIndex !== -1) {
      console.log(`Customer ${activeCustomers[customerIndex].customerId} disconnected`);
      activeCustomers.splice(customerIndex, 1);
      io.emit('activeCustomers', activeCustomers);
    }
    
    if (activeAdmin === socket.id) {
      console.log('Admin disconnected');
      activeAdmin = '';
    }
  });
};

module.exports = chatSocket;