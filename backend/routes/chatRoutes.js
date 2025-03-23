const ChatController = require("../controllers/chat/chatController");
const authenticateToken = require("../middlewares/authenticateToken");
const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API quản lý tin nhắn và cuộc trò chuyện
 */

/**
 * @swagger
 * /chat/customer/send-message-to-seller:
 *   post:
 *     summary: Gửi tin nhắn từ khách hàng đến người bán
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - receiverId
 *               - message
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: ID người gửi
 *               receiverId:
 *                 type: string
 *                 description: ID người nhận
 *               message:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *     responses:
 *       201:
 *         description: Tin nhắn đã được gửi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post("/chat/customer/send-message-to-seller", authenticateToken, ChatController.customer_message_add);

/**
 * @swagger
 * /chat/send-message:
 *   post:
 *     summary: Gửi tin nhắn
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - receiverId
 *               - message
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: ID người gửi
 *               receiverId:
 *                 type: string
 *                 description: ID người nhận
 *               message:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *     responses:
 *       201:
 *         description: Tin nhắn đã được gửi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post("/chat/send-message", authenticateToken, ChatController.message_add);

/**
 * @swagger
 * /chat/get-messages/{userId}/{otherUserId}:
 *   get:
 *     summary: Lấy lịch sử tin nhắn giữa hai người dùng
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID người dùng
 *       - in: path
 *         name: otherUserId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID người dùng khác
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID tin nhắn
 *                   senderId:
 *                     type: string
 *                     description: ID người gửi
 *                   receiverId:
 *                     type: string
 *                     description: ID người nhận
 *                   message:
 *                     type: string
 *                     description: Nội dung tin nhắn
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Thời gian gửi tin nhắn
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/chat/get-messages/:userId/:otherUserId", authenticateToken, ChatController.get_messages);

/**
 * @swagger
 * /chat/get-chat-participants/{userId}:
 *   get:
 *     summary: Lấy danh sách người đã trò chuyện với người dùng
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Danh sách người tham gia trò chuyện
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/chat/get-chat-participants/:userId", authenticateToken, ChatController.get_chat_participants);

/**
 * @swagger
 * /chat/message-send-seller-admin:
 *   post:
 *     summary: Gửi tin nhắn giữa người bán và quản trị viên
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - receiverId
 *               - message
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: ID người gửi
 *               receiverId:
 *                 type: string
 *                 description: ID người nhận
 *               message:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *     responses:
 *       201:
 *         description: Tin nhắn đã được gửi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post("/chat/message-send-seller-admin", authenticateToken, ChatController.admin_message_insert);

/**
 * @swagger
 * /chat/admin/get-sellers:
 *   get:
 *     summary: Lấy danh sách người bán (cho quản trị viên)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người bán
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/chat/admin/get-sellers", authenticateToken, ChatController.get_sellers);

/**
 * @swagger
 * /chat/get-admin-messages/{receverId}:
 *   get:
 *     summary: Lấy tin nhắn giữa quản trị viên và người bán
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receverId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID người nhận
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/chat/get-admin-messages/:receverId", authenticateToken, ChatController.get_admin_messages);

/**
 * @swagger
 * /chat/get-seller-messages:
 *   get:
 *     summary: Lấy tin nhắn của người bán
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/chat/get-seller-messages", authenticateToken, ChatController.get_seller_messages);

module.exports = router;
