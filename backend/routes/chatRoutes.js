const ChatController = require("../controllers/chat/chatController");
const router = require("express").Router();

router.post("/chat/customer/send-message-to-seller", ChatController.customer_message_add);
router.post("/chat/send-message", ChatController.message_add);
router.post("/chat/admin/send-message", ChatController.admin_message_insert);

router.get("/chat/get-messages/:otherUserId", ChatController.get_messages);
router.get("/chat/get-chat-participants", ChatController.get_chat_participants);

module.exports = router;
