const sellerModel = require("../../models/sellerModel");
const customerModel = require("../../models/customerModel");
const sellerCustomerMessage = require("../../models/chat/sellerCustomerMessage");

const { responseReturn } = require("../../utils/response");

class ChatController {
  customer_message_add = async (req, res) => {
    const { userId, text, sellerId, name } = req.body;

    try {
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
  // End Method

  get_customers = async (req, res) => {
    const { sellerId } = req.params;
    try {
      const messages = await sellerCustomerMessage.find({
        $or: [{ receverId: sellerId }, { senderId: sellerId }],
      });

      const customerIds = new Set(
        messages.map((message) =>
          message.senderId === sellerId
            ? message.receverId.toString()
            : message.senderId.toString()
        )
      );

      const customers = await customerModel.find({
        _id: { $in: Array.from(customerIds) },
      });

      responseReturn(res, 200, {
        customers,
      });
    } catch (error) {
      console.log(error);
    }
  };
  // End Method

  get_customers_seller_message = async (req, res) => {
    const { customerId } = req.params;
    const { id } = req.body;
  
    console.log("customerId:", customerId);
    console.log("sellerId (id):", id);
  
    try {
      const messages = await sellerCustomerMessage.find({
        $or: [
          {
            $and: [
              { receverId: { $eq: customerId } },
              { senderId: { $eq: id } },
            ],
          },
          {
            $and: [
              { receverId: { $eq: id } },
              { senderId: { $eq: customerId } },
            ],
          },
        ],
      });
  
      console.log("Messages found:", messages);
  
      const currentCustomer = await customerModel.findById(customerId);
      responseReturn(res, 200, {
        messages,
        currentCustomer,
      });
    } catch (error) {
      console.log(error);
    }
  };
  // End Method

  seller_message_add = async (req, res) => {
    const { senderId, receverId, text, name } = req.body;
    try {
      const message = await sellerCustomerMessage.create({
        senderId: senderId,
        senderName: name,
        receverId: receverId,
        message: text,
      });

      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error);
    }
  };
  // End Method
}

module.exports = new ChatController();