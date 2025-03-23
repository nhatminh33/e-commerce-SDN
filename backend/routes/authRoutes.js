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

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API quản lý xác thực người dùng
 */

/**
 * @swagger
 * /admin-login:
 *   post:
 *     summary: Đăng nhập dành cho quản trị viên
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Thông tin đăng nhập không hợp lệ
 */
router.post('/admin-login', admin_login);

/**
 * @swagger
 * /customer-register:
 *   post:
 *     summary: Đăng ký tài khoản khách hàng
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/customer-register', customer_register);

/**
 * @swagger
 * /customer-login:
 *   post:
 *     summary: Đăng nhập dành cho khách hàng
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Thông tin đăng nhập không hợp lệ
 */
router.post('/customer-login', customer_login);

/**
 * @swagger
 * /verify-email/{token}:
 *   get:
 *     summary: Xác thực email người dùng
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token xác thực
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
router.get('/verify-email/:token', verify_email);

/**
 * @swagger
 * /resend-verification:
 *   post:
 *     summary: Gửi lại email xác thực
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email xác thực đã được gửi lại
 *       400:
 *         description: Email không tồn tại
 */
router.post('/resend-verification', resend_verification_email);

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Làm mới token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token đã được làm mới
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/refresh-token', refresh_token);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post('/logout', logout);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Yêu cầu khôi phục mật khẩu
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email khôi phục mật khẩu đã được gửi
 *       404:
 *         description: Email không tồn tại
 */
router.post('/forgot-password', forgot_password);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt lại thành công
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
router.post('/reset-password', reset_password);

/**
 * @swagger
 * /verify-reset-token:
 *   post:
 *     summary: Xác minh token khôi phục mật khẩu
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token hợp lệ
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
router.post('/verify-reset-token', verify_reset_token);

/**
 * @swagger
 * /get-user:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *       401:
 *         description: Không được phép truy cập
 */
router.get('/get-user', authenticateToken, get_user);

/**
 * @swagger
 * /profile-image-upload:
 *   post:
 *     summary: Tải lên ảnh hồ sơ
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Ảnh đã được tải lên thành công
 *       400:
 *         description: Lỗi tải lên
 *       401:
 *         description: Không được phép truy cập
 */
router.post('/profile-image-upload', authenticateToken, profile_image_upload);

/**
 * @swagger
 * /update-profile:
 *   put:
 *     summary: Cập nhật thông tin hồ sơ
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Hồ sơ đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được phép truy cập
 */
router.put('/update-profile', authenticateToken, update_profile);

/**
 * @swagger
 * /change-password:
 *   put:
 *     summary: Thay đổi mật khẩu
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Mật khẩu đã được thay đổi thành công
 *       400:
 *         description: Mật khẩu cũ không đúng
 *       401:
 *         description: Không được phép truy cập
 */
router.put('/change-password', authenticateToken, change_password);
module.exports = router;