const ChatController = require('../controllers/chat/chatController')

const router = require('express').Router()

router.post('/chat/customer/send-message-to-seller',ChatController.customer_message_add)

router.get('/chat/seller/get-customers/:sellerId',ChatController.get_customers)
router.get('/chat/seller/get-customer-message/:customerId',ChatController.get_customers_seller_message)
router.post('/chat/seller/send-message-to-customer',ChatController.seller_message_add)

 
module.exports = router 