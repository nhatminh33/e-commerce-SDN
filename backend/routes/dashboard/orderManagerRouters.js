const router = require("express").Router();
const orderManagerController = require("../../controllers/dashboard/orderManagerController");
const sellerMiddleware = require("../../middlewares/sellerMiddleware");

/**
 * @swagger
 * tags:
 *   name: OrderManager
 *   description: API quản lý đơn hàng cho người bán
 */

// Áp dụng middleware seller cho tất cả các route
router.use(sellerMiddleware);

/**
 * @swagger
 * /seller/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của người bán
 *     tags: [OrderManager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng đơn hàng mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, canceled]
 *         description: Lọc theo trạng thái đơn hàng
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo mã đơn hàng
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price-low-to-high, price-high-to-low]
 *         description: Sắp xếp đơn hàng
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID đơn hàng
 *                       customerId:
 *                         type: string
 *                         description: ID khách hàng
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                       status:
 *                         type: string
 *                         description: Trạng thái đơn hàng
 *                       totalPrice:
 *                         type: number
 *                         description: Tổng giá trị đơn hàng
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Thời gian tạo đơn hàng
 *                 totalOrders:
 *                   type: integer
 *                   description: Tổng số đơn hàng
 *                 currentPage:
 *                   type: integer
 *                   description: Trang hiện tại
 *                 totalPages:
 *                   type: integer
 *                   description: Tổng số trang
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/", orderManagerController.manageOrders);

/**
 * @swagger
 * /seller/orders/{orderId}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     tags: [OrderManager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.get("/:orderId", orderManagerController.getOrderDetails);

/**
 * @swagger
 * /seller/orders/update-status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [OrderManager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - status
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID đơn hàng
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, canceled]
 *                 description: Trạng thái đơn hàng mới
 *     responses:
 *       200:
 *         description: Trạng thái đơn hàng đã được cập nhật
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.put("/update-status", orderManagerController.updateDeliveryStatus);

module.exports = router; 