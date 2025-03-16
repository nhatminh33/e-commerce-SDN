const router = require('express').Router();
const {
    admin_login,
    customer_login,
    customer_register,
    verify_email,
    resend_verification_email,
    update_profile,
    refresh_token,
    logout,
    get_user,
    profile_image_upload
} = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');

// Public routes
router.post('/admin-login', admin_login);
router.post('/customer-register', customer_register);
router.post('/customer-login', customer_login);
router.get('/verify-email/:token', verify_email);
router.post('/resend-verification', resend_verification_email);
router.post('/refresh-token', refresh_token);
router.post('/logout', logout);

// Protected routes
router.get('/get-user', authenticateToken, get_user);
router.post('/profile-image-upload', authenticateToken, profile_image_upload);
router.put('/update-profile', authenticateToken, update_profile);

module.exports = router;