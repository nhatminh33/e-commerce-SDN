const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController')

paymentRouter.post('/create_payment_url', paymentController.createPayment);
paymentRouter.get('/vnpay_return', paymentController.returnVnpay);
paymentRouter.get('/vnpay_pin', paymentController.vnpayIpn);

module.exports = { paymentRouter }