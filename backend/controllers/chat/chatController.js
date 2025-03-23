const userModel = require("../../models/userModel");
const sellerCustomerMessage = require("../../models/chat/sellerCustomerMessage");
const adminSellerMessage = require("../../models/chat/adminSellerMessage");
const { responseReturn } = require("../../utiles/response");

const { ObjectId } = require("mongoose").Types;
class ChatController {
  validateChat = async (senderId, receiverId, allowedRoles) => {
    try {
      console.log("Raw Sender ID:", senderId);
      console.log("Raw Receiver ID:", receiverId);
  
      const sender = await userModel.findById(senderId);
      const receiver = await userModel.findById(receiverId);
  
      console.log("Sender:", sender);
      console.log("Receiver:", receiver);

      if (!sender) {
        console.error("Sender not found with ID:", senderId);
        return false;
      }
      
      if (!receiver) {
        console.error("Receiver not found with ID:", receiverId);
        return false;
      }

      console.log("Sender role:", sender.role);
      console.log("Receiver role:", receiver.role);
      console.log("Allowed roles:", allowedRoles);
  
      const isValid = allowedRoles.some(
        (roles) => sender.role === roles[0] && receiver.role === roles[1]
      );
      
      console.log("Is valid chat:", isValid);
      return isValid;
    } catch (error) {
      console.error("Error in validateChat:", error);
      return false;
    }
  };

  customer_message_add = async (req, res) => {
    const { userId, text, sellerId, name, productId, productName } = req.body;
    try {
      console.log("Request body:", req.body);
      
      const isValid = await this.validateChat(userId, sellerId, [["customer", "seller"]]);
      if (!isValid) return responseReturn(res, 403, { error: "Unauthorized chat." });
      
      // Nếu không có name, lấy tên từ database
      let senderName = name;
      if (!senderName) {
        const sender = await userModel.findById(userId);
        senderName = sender ? sender.name : "Customer";
        console.log("Using fallback sender name:", senderName);
      }
      
      const message = await sellerCustomerMessage.create({
        senderId: userId,
        senderName: senderName,
        receverId: sellerId,
        message: text,
        productId,
        productName
      });
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Error sending message" });
    }
  };

  message_add = async (req, res) => {
    const { senderId, receverId, text, name, productId, productName } = req.body;
    try {
      const isValid = await this.validateChat(senderId, receverId, [
        ["customer", "seller"],
        ["seller", "customer"],
        ["seller", "admin"],
        ["admin", "seller"]
      ]);
      if (!isValid) return responseReturn(res, 403, { error: "Unauthorized chat." });
      
      const message = await sellerCustomerMessage.create({
        senderId,
        senderName: name,
        receverId,
        message: text,
        productId,
        productName
      });
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error);
    }
  };

  admin_message_insert = async (req, res) => {
    const senderId = req.id
    const { receverId, message, senderName } = req.body;
    
    try {
      // Kiểm tra nếu là admin gửi tin nhắn (senderId là rỗng hoặc null trong body)
      if (req.body.senderId === '') {
        const messageData = await adminSellerMessage.create({
          senderId: '',
          receverId,
          message,
          senderName: 'Admin Support'
        });
        return responseReturn(res, 200, { message: messageData });
      }
      
      // Nếu là seller gửi tin nhắn
      const sender = await userModel.findById(senderId);
      if (!sender) {
        return responseReturn(res, 404, { error: "Sender not found" });
      }
      
      const messageData = await adminSellerMessage.create({
        senderId,
        receverId,
        message,
        senderName: sender.name,
      });
      responseReturn(res, 200, { message: messageData });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Server error" });
    }
  };

  get_messages = async (req, res) => {
    const { userId, otherUserId } = req.params;
    try {
        console.log(`Getting messages between ${userId} and ${otherUserId}`);
        
        // Tìm tin nhắn giữa hai người dùng
        const customerSellerMessages = await sellerCustomerMessage.find({
            $or: [
                { senderId: userId, receverId: otherUserId },
                { senderId: otherUserId, receverId: userId },
            ],
        }).sort({ createdAt: 1 });
        
        const adminSellerMessages = await adminSellerMessage.find({
            $or: [
                { senderId: userId, receverId: otherUserId },
                { senderId: otherUserId, receverId: userId },
            ],
        }).sort({ createdAt: 1 });
        
        const messages = [...customerSellerMessages, ...adminSellerMessages].sort(
            (a, b) => a.createdAt - b.createdAt
        );
        
        // Lấy thông tin của seller (otherUserId) để trả về frontend
        const currentSeller = await userModel.findById(otherUserId);
        
        if (!currentSeller) {
            console.log(`Seller ${otherUserId} not found`);
            return responseReturn(res, 404, { error: "Seller not found" });
        }
        
        // Lấy thông tin của customer (userId) để trả về frontend
        const customer = await userModel.findById(userId);
        
        if (!customer) {
            console.log(`Customer ${userId} not found`);
            return responseReturn(res, 404, { error: "Customer not found" });
        }
        
        console.log(`Found ${messages.length} messages`);
        
        // Trả về cả tin nhắn, thông tin người bán và thông tin khách hàng
        responseReturn(res, 200, { 
            messages,
            currentSeller: {
                sellerId: currentSeller._id.toString(),
                name: currentSeller.name,
                email: currentSeller.email,
                shopName: currentSeller.shopInfo?.shopName || currentSeller.name,
                image: currentSeller.image || '/images/seller.png'
            },
            currentCustomer: {
                userId: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                image: customer.image || '/images/user.png'
            }
        });
    } catch (error) {
        console.error("Error in get_messages:", error);
        responseReturn(res, 500, { error: "Server error" });
    }
  };

  get_chat_participants = async (req, res) => {
    const { userId } = req.params;
    try {
      const messages = await sellerCustomerMessage.find({
        $or: [{ senderId: userId }, { receverId: userId }],
      });
      
      const participantIds = new Set(messages.map(msg =>
        msg.senderId.toString() === userId ? msg.receverId.toString() : msg.senderId.toString()
      ));
      
      const participants = await userModel.find({ _id: { $in: Array.from(participantIds) } });
      
      responseReturn(res, 200, { participants });
    } catch (error) {
      console.log(error);
    }
  };

  // Lấy tất cả seller cho admin
  get_sellers = async (req, res) => {
    try {
      const sellers = await userModel.find({ role: 'seller' }).select('name email image')
      
      responseReturn(res, 200, { 
        sellers
      })
    } catch (error) {
      console.log(error)
    }
  }

  // Lấy tin nhắn giữa admin và một seller cụ thể
  get_admin_messages = async (req, res) => {
    const { receverId } = req.params
    
    try {
      const messages = await adminSellerMessage.find({
        $or: [
          { $and: [{ senderId: '' }, { receverId }] },
          { $and: [{ senderId: receverId }, { receverId: '' }] }
        ]
      }).sort({ createdAt: 1 })

      const currentSeller = await userModel.findById(receverId).select('name email image shopInfo')
      
      responseReturn(res, 200, { 
        messages,
        currentSeller
      })
    } catch (error) {
      console.log(error)
    }
  }

  // Lấy tin nhắn giữa seller và admin
  get_seller_messages = async (req, res) => {
    const sellerId = req.id
    
    try {
      const messages = await adminSellerMessage.find({
        $or: [
          { $and: [{ senderId: '' }, { receverId: sellerId }] },
          { $and: [{ senderId: sellerId }, { receverId: '' }] }
        ]
      }).sort({ createdAt: 1 })
      
      // Lấy thông tin admin để hiển thị
      const adminInfo = {
        name: 'Admin Support',
        image: 'http://localhost:3001/images/admin.jpg'
      }
      
      responseReturn(res, 200, { 
        messages,
        adminInfo
      })
    } catch (error) {
      console.log(error)
      responseReturn(res, 500, { error: "Server error" })
    }
  }

  // Lấy danh sách khách hàng đã chat với người bán
  get_seller_customers = async (req, res) => {
    // Lấy sellerId từ req.id thay vì params
    const sellerId = req.id;
    
    try {
      console.log(`Getting customers for seller: ${sellerId}`);
      
      // Tìm tất cả tin nhắn mà sellerId là người gửi hoặc người nhận
      const messages = await sellerCustomerMessage.find({
        $or: [
          { senderId: sellerId },
          { receverId: sellerId }
        ]
      });
      
      console.log('messages', messages);

      // Lấy danh sách ID của những customer đã chat với seller này
      const customerIds = new Set();
      
      messages.forEach(msg => {
        if (msg.senderId !== sellerId) {
          customerIds.add(msg.senderId);
        } else if (msg.receverId !== sellerId) {
          customerIds.add(msg.receverId);
        }
      });
      
      console.log(`Found ${customerIds.size} unique customers`);
      
      if (customerIds.size === 0) {
        return responseReturn(res, 200, { customers: [] });
      }
      
      // Lấy thông tin chi tiết của các customer
      const customers = await userModel.find({ 
        _id: { $in: Array.from(customerIds) },
        role: 'customer'
      }).select('_id name email image');
      
      // Định dạng lại thông tin customer để phù hợp với frontend
      const formattedCustomers = customers.map(c => ({
        fdId: c._id.toString(),
        name: c.name,
        email: c.email,
        image: c.image || 'http://localhost:3000/images/user.png'
      }));
      
      console.log(`Returning ${formattedCustomers.length} customers`);
      responseReturn(res, 200, { customers: formattedCustomers });
      
    } catch (error) {
      console.error('Error in get_seller_customers:', error);
      responseReturn(res, 500, { error: 'Server error' });
    }
  };

  // Lấy tin nhắn giữa seller và customer
  get_seller_customer_messages = async (req, res) => {
    // Lấy sellerId từ req.id
    const sellerId = req.id;
    const { customerId } = req.params;
    
    try {
      console.log(`Getting messages between seller ${sellerId} and customer ${customerId}`);
      
      // Không cần kiểm tra quyền truy cập nữa vì đã lấy sellerId từ req.id
      
      // Tìm tin nhắn giữa seller và customer
      const messages = await sellerCustomerMessage.find({
        $or: [
          { senderId: sellerId, receverId: customerId },
          { senderId: customerId, receverId: sellerId }
        ]
      }).sort({ createdAt: 1 });
      
      // Lấy thông tin customer
      const customer = await userModel.findById(customerId).select('name email image');
      
      if (!customer) {
        return responseReturn(res, 404, { error: 'Customer not found' });
      }
      
      // Định dạng thông tin customer
      const currentCustomer = {
        fdId: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        image: customer.image || 'http://localhost:3000/images/user.png'
      };
      
      console.log(`Found ${messages.length} messages with customer ${customerId}`);
      responseReturn(res, 200, { 
        messages,
        currentCustomer
      });
      
    } catch (error) {
      console.error('Error in get_seller_customer_messages:', error);
      responseReturn(res, 500, { error: 'Server error' });
    }
  };

  // Gửi tin nhắn từ seller đến customer
  seller_message_add = async (req, res) => {
    // Lấy sellerId từ req.id
    const sellerId = req.id;
    const { customerId, message, senderName } = req.body;
    
    try {
      console.log("Seller send message request body:", req.body);
      
      // Không cần kiểm tra quyền truy cập nữa vì đã lấy sellerId từ req.id
      
      const isValid = await this.validateChat(sellerId, customerId, [["seller", "customer"]]);
      if (!isValid) return responseReturn(res, 403, { error: "Unauthorized chat." });
      
      // Lấy tên người gửi nếu không được cung cấp
      let finalSenderName = senderName;
      if (!finalSenderName) {
        const seller = await userModel.findById(sellerId);
        finalSenderName = seller ? seller.name : "Seller";
        console.log("Using fallback sender name:", finalSenderName);
      }
      
      // Tạo tin nhắn mới
      const newMessage = await sellerCustomerMessage.create({
        senderId: sellerId,
        senderName: finalSenderName,
        receverId: customerId,
        message,
      });
      
      responseReturn(res, 201, { message: newMessage });
    } catch (error) {
      console.error("Error in seller_message_add:", error);
      responseReturn(res, 500, { error: "Error sending message" });
    }
  };

  // Đếm số lượng tin nhắn chưa đọc của mỗi customer
  count_unread_customer_messages = async (req, res) => {
    const sellerId = req.id;
    
    try {
      // Tìm tất cả tin nhắn chưa đọc gửi đến seller
      const messages = await sellerCustomerMessage.find({
        receverId: sellerId,
        status: 'unseen'
      });
      
      // Tính tổng số tin nhắn chưa đọc theo customer
      const unreadCounts = {};
      
      messages.forEach(msg => {
        if (unreadCounts[msg.senderId]) {
          unreadCounts[msg.senderId] += 1;
        } else {
          unreadCounts[msg.senderId] = 1;
        }
      });
      
      // Tính tổng số customer có tin nhắn chưa đọc
      const totalCustomersWithUnread = Object.keys(unreadCounts).length;
      
      responseReturn(res, 200, { 
        unreadCounts,
        totalCustomersWithUnread
      });
      
    } catch (error) {
      console.error('Error in count_unread_customer_messages:', error);
      responseReturn(res, 500, { error: 'Server error' });
    }
  };

  // Cập nhật trạng thái tin nhắn thành đã đọc
  mark_message_as_read = async (req, res) => {
    const sellerId = req.id;
    const { customerId } = req.params;
    
    try {
      // Tìm và cập nhật tất cả tin nhắn chưa đọc từ customer cụ thể
      const result = await sellerCustomerMessage.updateMany(
        {
          senderId: customerId,
          receverId: sellerId,
          status: 'unseen'
        },
        {
          $set: { status: 'seen' }
        }
      );
      
      console.log(`Đã đánh dấu ${result.modifiedCount} tin nhắn là đã đọc`);
      
      responseReturn(res, 200, { 
        success: true,
        markedCount: result.modifiedCount
      });
      
    } catch (error) {
      console.error('Error in mark_message_as_read:', error);
      responseReturn(res, 500, { error: 'Server error' });
    }
  };

  // Đếm số lượng tin nhắn chưa đọc của mỗi seller dành cho customer
  count_unread_seller_messages = async (req, res) => {
    const customerId = req.id;
    
    try {
      // Tìm tất cả tin nhắn chưa đọc gửi đến customer
      const messages = await sellerCustomerMessage.find({
        receverId: customerId,
        status: 'unseen'
      });
      
      // Tính tổng số tin nhắn chưa đọc theo seller
      const unreadCounts = {};
      
      messages.forEach(msg => {
        if (unreadCounts[msg.senderId]) {
          unreadCounts[msg.senderId] += 1;
        } else {
          unreadCounts[msg.senderId] = 1;
        }
      });
      
      // Tính tổng số seller có tin nhắn chưa đọc
      const totalSellersWithUnread = Object.keys(unreadCounts).length;
      
      responseReturn(res, 200, { 
        unreadCounts,
        totalSellersWithUnread
      });
      
    } catch (error) {
      console.error('Error in count_unread_seller_messages:', error);
      responseReturn(res, 500, { error: 'Server error' });
    }
  };

  // Cập nhật trạng thái tin nhắn thành đã đọc cho customer
  customer_mark_as_read = async (req, res) => {
    const customerId = req.id;
    const { sellerId } = req.params;
    
    try {
      // Tìm và cập nhật tất cả tin nhắn chưa đọc từ seller cụ thể
      const result = await sellerCustomerMessage.updateMany(
        {
          senderId: sellerId,
          receverId: customerId,
          status: 'unseen'
        },
        {
          $set: { status: 'seen' }
        }
      );
      
      console.log(`Đã đánh dấu ${result.modifiedCount} tin nhắn là đã đọc cho customer`);
      
      responseReturn(res, 200, { 
        success: true,
        markedCount: result.modifiedCount
      });
      
    } catch (error) {
      console.error('Error in customer_mark_as_read:', error);
      responseReturn(res, 500, { error: 'Server error' });
    }
  };
  
  // Lấy danh sách người bán đã chat với customer
  get_customer_sellers = async (req, res) => {
    const customerId = req.id;
    
    try {
      console.log(`Getting sellers for customer: ${customerId}`);
      
      // Tìm tất cả tin nhắn mà customerId là người gửi hoặc người nhận
      const messages = await sellerCustomerMessage.find({
        $or: [
          { senderId: customerId },
          { receverId: customerId }
        ]
      });
      
      // Lấy danh sách ID của những seller đã chat với customer này
      const sellerIds = new Set();
      
      messages.forEach(msg => {
        if (msg.senderId !== customerId) {
          sellerIds.add(msg.senderId);
        } else if (msg.receverId !== customerId) {
          sellerIds.add(msg.receverId);
        }
      });
      
      console.log(`Found ${sellerIds.size} unique sellers`);
      
      if (sellerIds.size === 0) {
        return responseReturn(res, 200, { sellers: [] });
      }
      
      // Lấy thông tin chi tiết của các seller
      const sellers = await userModel.find({ 
        _id: { $in: Array.from(sellerIds) },
        role: 'seller'
      }).select('_id name email image shopInfo');
      
      // Định dạng lại thông tin seller để phù hợp với frontend
      const formattedSellers = sellers.map(s => ({
        sellerId: s._id.toString(),
        _id: s._id.toString(),
        name: s.name,
        email: s.email,
        shopName: s.shopInfo?.shopName || s.name,
        image: s.image || 'http://localhost:3000/images/user.png',
        avatar: s.image || 'http://localhost:3000/images/user.png'
      }));
      
      console.log(`Returning ${formattedSellers.length} sellers`);
      responseReturn(res, 200, { sellers: formattedSellers });
      
    } catch (error) {
      console.error('Error in get_customer_sellers:', error);
      responseReturn(res, 500, { error: 'Server error' });
    }
  };

  /**
   * @desc Get unread message counts for customer from all sellers
   * @route GET /api/chat/customer/unread-counts
   * @access private
   */
  get_unread_counts = async (req, res) => {
    try {
      const customerId = req.userId;
      
      // Find all sellers this customer has chatted with
      const distinctSellers = await sellerCustomerMessage.distinct('receverId', { senderId: customerId });
      
      // Count unread messages for each seller
      const unreadCounts = {};
      
      await Promise.all(
        distinctSellers.map(async (sellerId) => {
          const count = await sellerCustomerMessage.countDocuments({
            customerId,
            receverId: sellerId,
            status: 'unseen'
          });
          
          if (count > 0) {
            unreadCounts[sellerId] = count;
          }
        })
      );
      
      res.status(200).json({ unreadCounts });
    } catch (error) {
      console.error('Error in get_unread_counts:', error);
      res.status(500).json({
        error: error.message
      });
    }
  };

  /**
   * @desc Mark all messages from a seller as read
   * @route PATCH /api/chat/customer/mark-as-read/:sellerId
   * @access private
   */
  mark_as_read = async (req, res) => {
    try {
      const { sellerId } = req.params;
      const customerId = req.userId;
      
      // Validate seller ID
      if (!ObjectId.isValid(sellerId)) {
        return res.status(400).json({ error: 'Mã người bán không hợp lệ' });
      }
      
      // Update all unread messages from this seller to this customer
      const result = await sellerCustomerMessage.updateMany(
        {
          customerId,
          receverId: sellerId,
          status: 'unseen'
        },
        {
          $set: { status: 'seen' }
        }
      );
      
      res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả tin nhắn là đã đọc' });
    } catch (error) {
      console.error('Error in mark_as_read:', error);
      res.status(500).json({
        error: error.message
      });
    }
  };
}

module.exports = new ChatController();
