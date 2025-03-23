const router = require('express').Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { get_seller, create_seller, update_seller_status, get_sellers, update_seller_info, change_password, delete_seller, update_order_status, get_dashboard_data } = require('../../controllers/dashboard/sellerController');
const systemMiddleware = require('../../middlewares/adminMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const sellerMiddleware = require('../../middlewares/sellerMiddleware');

router.post('/create-seller', adminMiddleware, create_seller)
router.get('/get-seller/:id', authMiddleware, get_seller)   
router.post('/update-seller-status', adminMiddleware, update_seller_status)
router.get('/get-sellers', adminMiddleware, get_sellers)
router.post('/update-seller-info/:id', systemMiddleware, update_seller_info)
router.post('/change-password/:id', authMiddleware, change_password)
router.delete('/delete-seller/:id', adminMiddleware, delete_seller)
router.post('/update-order-status', sellerMiddleware, update_order_status)
router.get('/seller/dashboard/data', sellerMiddleware, get_dashboard_data)

module.exports = router;