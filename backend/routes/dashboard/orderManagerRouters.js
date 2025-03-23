const router = require("express").Router();
const orderManagerController = require("../../controllers/dashboard/orderManagerController");
const sellerMiddleware = require("../../middlewares/sellerMiddleware");

/**
 * @swagger
 * tags:
 *   name: OrderManager
 *   description: API for order management by sellers
 */

// Apply seller middleware to all routes
router.use(sellerMiddleware);

/**
 * @swagger
 * /seller/orders:
 *   get:
 *     summary: Get list of orders managed by seller
 *     tags: [OrderManager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, canceled]
 *         description: Filter by order status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price-low-to-high, price-high-to-low]
 *         description: Sort orders
 *     responses:
 *       200:
 *         description: List of orders
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
 *                         description: Order ID
 *                       customerId:
 *                         type: string
 *                         description: Customer ID
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                       status:
 *                         type: string
 *                         description: Order status
 *                       totalPrice:
 *                         type: number
 *                         description: Total order value
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Order creation time
 *                 totalOrders:
 *                   type: integer
 *                   description: Total number of orders
 *                 currentPage:
 *                   type: integer
 *                   description: Current page
 *                 totalPages:
 *                   type: integer
 *                   description: Total pages
 *       401:
 *         description: Unauthorized access
 */
router.get("/", orderManagerController.manageOrders);

/**
 * @swagger
 * /seller/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [OrderManager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Order not found
 */
router.get("/:orderId", orderManagerController.getOrderDetails);

/**
 * @swagger
 * /seller/orders/update-status:
 *   put:
 *     summary: Update order status
 *     tags: [OrderManager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID
 *               delivery_status:
 *                 type: string
 *                 description: New order status
 *                 enum: [pending, shipping, delivered, canceled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Order not found
 */
router.put("/update-status", orderManagerController.updateDeliveryStatus);

module.exports = router; 