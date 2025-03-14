const ChatController = require("../controllers/chat/chatController");
const authenticateToken = require("../middlewares/authenticateToken");
const adminMiddleware = require("../middlewares/adminMiddleware");
const router = require("express").Router();

router.post("/chat/customer/send-message-to-seller", authenticateToken, ChatController.customer_message_add);
router.post("/chat/send-message", authenticateToken, ChatController.message_add);
router.post("/chat/admin/send-message",adminMiddleware , ChatController.admin_message_add);
router.get("/chat/get-messages/:userId/:otherUserId", authenticateToken, ChatController.get_messages);
router.get("/chat/get-chat-participants/:userId", authenticateToken, ChatController.get_chat_participants);

module.exports = router;
