const {admin_login, seller_login, create_seller, logout, get_user, profile_image_upload} = require('../controllers/authController');
const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/admin-login',  admin_login)
router.post('/seller-login',  seller_login)
router.post('/logout', authMiddleware, logout)
router.get('/get-user', get_user)
router.post('/profile-image-upload',authMiddleware, profile_image_upload)


module.exports = router;