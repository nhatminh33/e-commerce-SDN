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
  
      if (!sender || !receiver) return false;
  
      return allowedRoles.some(
        (roles) => sender.role === roles[0] && receiver.role === roles[1]
      );
    } catch (error) {
      console.error("Error in validateChat:", error);
      return false;
    }
  };

  customer_message_add = async (req, res) => {
    const { userId, text, sellerId, name } = req.body;
    try {
      const isValid = await this.validateChat(userId, sellerId, [["customer", "seller"]]);
      if (!isValid) return responseReturn(res, 403, { error: "Unauthorized chat." });
      
      const message = await sellerCustomerMessage.create({
        senderId: userId,
        senderName: name,
        receverId: sellerId,
        message: text,
      });
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error);
    }
  };

  message_add = async (req, res) => {
    const { senderId, receverId, text, name } = req.body;
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
      
      responseReturn(res, 200, { messages });
    } catch (error) {
      console.log(error);
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
      const sellers = await userModel.find({ role: 'seller' }).select('name email image shopInfo')
      
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
}

module.exports = new ChatController();
