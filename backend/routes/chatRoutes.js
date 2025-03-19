const ChatController = require("../controllers/chat/chatController");
const authenticateToken = require("../middlewares/authenticateToken");
const router = require("express").Router();

router.post("/chat/customer/send-message-to-seller", authenticateToken, ChatController.customer_message_add);
router.post("/chat/send-message", authenticateToken, ChatController.message_add);
router.get("/chat/get-messages/:userId/:otherUserId", authenticateToken, ChatController.get_messages);
router.get("/chat/get-chat-participants/:userId", authenticateToken, ChatController.get_chat_participants);

// Admin-Seller chat routes
router.post("/chat/message-send-seller-admin", authenticateToken, ChatController.admin_message_insert);
router.get("/chat/admin/get-sellers", authenticateToken, ChatController.get_sellers);
router.get("/chat/get-admin-messages/:receverId", authenticateToken, ChatController.get_admin_messages);
router.get("/chat/get-seller-messages", authenticateToken, ChatController.get_seller_messages);

module.exports = router;
