const router = require('express').Router();
const {
    admin_login,
    customer_login,
    customer_register,
    verify_email,
    verify_reset_token,
    resend_verification_email,
    update_profile,
    refresh_token,
    logout,
    get_user,
    profile_image_upload,
    change_password,
    reset_password,
    forgot_password
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
router.post('/forgot-password', forgot_password);
router.post('/reset-password', reset_password);
router.post('/verify-reset-token', verify_reset_token);

// Protected routes
router.get('/get-user', authenticateToken, get_user);
router.post('/profile-image-upload', authenticateToken, profile_image_upload);
router.put('/update-profile', authenticateToken, update_profile);
router.put('/change-password', authenticateToken, change_password);
module.exports = router;