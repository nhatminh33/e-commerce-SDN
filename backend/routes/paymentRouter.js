const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController')

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: API quản lý thanh toán
 */

/**
 * @swagger
 * /create_payment_url:
 *   post:
 *     summary: Tạo URL thanh toán VNPay
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - orderInfo
 *               - returnUrl
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Số tiền thanh toán
 *               orderInfo:
 *                 type: string
 *                 description: Thông tin đơn hàng
 *               orderType:
 *                 type: string
 *                 default: billpayment
 *                 description: Loại đơn hàng
 *               language:
 *                 type: string
 *                 default: vn
 *                 description: Ngôn ngữ
 *               returnUrl:
 *                 type: string
 *                 description: URL callback sau khi thanh toán
 *     responses:
 *       200:
 *         description: URL thanh toán đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Mã trạng thái
 *                 message:
 *                   type: string
 *                   description: Thông báo
 *                 data:
 *                   type: string
 *                   description: URL thanh toán
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
paymentRouter.post('/create_payment_url', paymentController.createPayment);

/**
 * @swagger
 * /vnpay_return:
 *   get:
 *     summary: Xử lý callback từ VNPay
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *         description: Số tiền thanh toán
 *       - in: query
 *         name: vnp_BankCode
 *         schema:
 *           type: string
 *         description: Mã ngân hàng
 *       - in: query
 *         name: vnp_OrderInfo
 *         schema:
 *           type: string
 *         description: Thông tin đơn hàng
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: Mã phản hồi
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Mã tham chiếu giao dịch
 *     responses:
 *       200:
 *         description: Xử lý callback thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
paymentRouter.get('/vnpay_return', paymentController.returnVnpay);

/**
 * @swagger
 * /vnpay_pin:
 *   get:
 *     summary: Xử lý IPN (Instant Payment Notification) từ VNPay
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *         description: Số tiền thanh toán
 *       - in: query
 *         name: vnp_BankCode
 *         schema:
 *           type: string
 *         description: Mã ngân hàng
 *       - in: query
 *         name: vnp_OrderInfo
 *         schema:
 *           type: string
 *         description: Thông tin đơn hàng
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: Mã phản hồi
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Mã tham chiếu giao dịch
 *     responses:
 *       200:
 *         description: Xử lý IPN thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
paymentRouter.get('/vnpay_pin', paymentController.vnpayIpn);

module.exports = { paymentRouter }