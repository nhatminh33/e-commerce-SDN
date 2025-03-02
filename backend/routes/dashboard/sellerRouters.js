const router = require('express').Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { get_seller, create_seller, update_seller_status, get_sellers, update_seller_info, change_password, delete_seller } = require('../../controllers/dashboard/sellerController');
const systemMiddleware = require('../../middlewares/adminMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/create-seller', adminMiddleware, create_seller)
router.get('/get-seller/:id', authMiddleware, get_seller)
router.post('/update-seller-status', adminMiddleware, update_seller_status)
router.get('/get-sellers', adminMiddleware, get_sellers)
router.post('/update-seller-info/:id', systemMiddleware, update_seller_info)
router.post('/change-password/:id', authMiddleware, change_password)
router.delete('/delete-seller/:id', adminMiddleware, delete_seller)

module.exports = router;