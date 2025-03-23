const ChatController = require("../controllers/chat/chatController");
const authenticateToken = require("../middlewares/authenticateToken");
const router = require("express").Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

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
 *               - userId
 *               - sellerId
 *               - text
 *               - name
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID người gửi
 *               sellerId:
 *                 type: string
 *                 description: ID người nhận
 *               text:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *               name:
 *                 type: string
 *                 description: Tên người gửi
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm (nếu có)
 *               productName:
 *                 type: string
 *                 description: Tên sản phẩm (nếu có)
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

/**
 * @swagger
 * /chat/seller/get-customers:
 *   get:
 *     summary: Lấy danh sách khách hàng đã chat với người bán đang đăng nhập
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khách hàng đã chat với người bán
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.get("/chat/seller/get-customers", authenticateToken, ChatController.get_seller_customers);

/**
 * @swagger
 * /chat/seller/get-customer-messages/{customerId}:
 *   get:
 *     summary: Lấy tin nhắn giữa seller đang đăng nhập và một customer cụ thể
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khách hàng
 *     responses:
 *       200:
 *         description: Tin nhắn giữa seller và customer
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.get("/chat/seller/get-customer-messages/:customerId", authenticateToken, ChatController.get_seller_customer_messages);

/**
 * @swagger
 * /chat/seller/send-message-to-customer:
 *   post:
 *     summary: Gửi tin nhắn từ seller đang đăng nhập đến customer
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
 *               - customerId
 *               - message
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: ID của khách hàng
 *               message:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *               senderName:
 *                 type: string
 *                 description: Tên người gửi (tùy chọn)
 *     responses:
 *       201:
 *         description: Tin nhắn đã được gửi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post("/chat/seller/send-message-to-customer", authenticateToken, ChatController.seller_message_add);

/**
 * @swagger
 * /chat/seller/unread-counts:
 *   get:
 *     summary: Lấy số lượng tin nhắn chưa đọc của mỗi customer
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Số lượng tin nhắn chưa đọc
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/chat/seller/unread-counts", authenticateToken, ChatController.count_unread_customer_messages);

/**
 * @swagger
 * /chat/seller/mark-as-read/{customerId}:
 *   patch:
 *     summary: Đánh dấu tin nhắn của một customer là đã đọc
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khách hàng
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái tin nhắn thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch("/chat/seller/mark-as-read/:customerId", authenticateToken, ChatController.mark_message_as_read);

/**
 * @swagger
 * /chat/customer/get-sellers:
 *   get:
 *     summary: Lấy danh sách người bán đã chat với khách hàng đang đăng nhập
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người bán đã chat với khách hàng
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.get("/chat/customer/get-sellers", authenticateToken, ChatController.get_customer_sellers);

/**
 * @swagger
 * /chat/customer/unread-counts:
 *   get:
 *     summary: Lấy số lượng tin nhắn chưa đọc của khách hàng từ mỗi người bán
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Số lượng tin nhắn chưa đọc
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/chat/customer/unread-counts", authenticateToken, ChatController.count_unread_seller_messages);

/**
 * @swagger
 * /chat/customer/mark-as-read/{sellerId}:
 *   patch:
 *     summary: Đánh dấu tin nhắn từ một người bán là đã đọc
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người bán
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái tin nhắn thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch("/chat/customer/mark-as-read/:sellerId", authenticateToken, ChatController.customer_mark_as_read);

module.exports = router;
