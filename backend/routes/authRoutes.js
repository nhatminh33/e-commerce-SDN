const router = require('express').Router();
const {admin_login, seller_login, logout, get_user, profile_image_upload} = require('../controllers/authController');

router.post('/admin-login', admin_login)
router.post('/logout', logout)
router.get('/get-user', get_user)
router.post('/profile-image-upload', profile_image_upload)

module.exports = router;