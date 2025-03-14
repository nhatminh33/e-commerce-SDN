const userModel = require("../../models/userModel");
const sellerCustomerMessage = require("../../models/chat/sellerCustomerMessage");
const adminSellerMessage = require("../../models/chat/adminSellerMessage");
const { responseReturn } = require("../../utiles/response");

const { ObjectId } = require("mongoose").Types;
class ChatController {
  validateChat = async (req, receiverId, allowedRoles) => {
    try {
      const senderId = req.id;
      console.log("Raw Sender ID:", senderId);
      console.log("Raw Receiver ID:", receiverId);

      const sender = await userModel.findById(new ObjectId(senderId));
      const receiver = await userModel.findById(new ObjectId(receiverId));

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
    const { text, sellerId, name } = req.body;
    const userId = req.id;

    console.log("Request Body:", req.body);  // Debugging: Print entire request body
    console.log("Extracted sellerId:", sellerId);  // Debugging: Check if sellerId is defined

    if (!sellerId) {
        return responseReturn(res, 400, { error: "Missing sellerId in request" });
    }

    try {
        const isValid = await this.validateChat(req, sellerId, [["customer", "seller"]]);
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
        responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  message_add = async (req, res) => {
    const { text, receverId, name } = req.body;
    const senderId = req.id;

    try {
      const isValid = await this.validateChat(req, receverId, [
        ["customer", "seller"],
        ["seller", "customer"],
        ["seller", "admin"],
        ["admin", "seller"],
      ]);

      if (!isValid)
        return responseReturn(res, 403, { error: "Unauthorized chat." });

      const message = await sellerCustomerMessage.create({
        senderId,
        senderName: name,
        receverId,
        message: text,
      });
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  admin_message_add = async (req, res) => {
    const { receverId, message, senderName } = req.body;
    const senderId = req.id;

    try {
      const isValid = await this.validateChat(req, receverId, [
        ["admin", "seller"],
        ["seller", "admin"],
      ]);
      if (!isValid)
        return responseReturn(res, 403, { error: "Unauthorized chat." });

      const messageData = await adminSellerMessage.create({
        senderId,
        receverId,
        message,
        senderName,
      });
      responseReturn(res, 201, { message: messageData });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_messages = async (req, res) => {
    const { userId, otherUserId } = req.params;
    try {
      const customerSellerMessages = await sellerCustomerMessage
        .find({
          $or: [
            { senderId: userId, receverId: otherUserId },
            { senderId: otherUserId, receverId: userId },
          ],
        })
        .sort({ createdAt: 1 });

      const adminSellerMessages = await adminSellerMessage
        .find({
          $or: [
            { senderId: userId, receverId: otherUserId },
            { senderId: otherUserId, receverId: userId },
          ],
        })
        .sort({ createdAt: 1 });

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

      const participantIds = new Set(
        messages.map((msg) =>
          msg.senderId.toString() === userId
            ? msg.receverId.toString()
            : msg.senderId.toString()
        )
      );

      const participants = await userModel.find({
        _id: { $in: Array.from(participantIds) },
      });

      responseReturn(res, 200, { participants });
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new ChatController();
