const router = require('express').Router();
const {
    get_addresses,
    add_address,
    update_address,
    delete_address,
    set_default_address
} = require('../controllers/addressController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: API quản lý địa chỉ người dùng
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /address/get-all:
 *   get:
 *     summary: Lấy tất cả địa chỉ của người dùng
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách địa chỉ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID địa chỉ
 *                   userId:
 *                     type: string
 *                     description: ID người dùng
 *                   fullName:
 *                     type: string
 *                     description: Tên đầy đủ
 *                   phone:
 *                     type: string
 *                     description: Số điện thoại
 *                   country:
 *                     type: string
 *                     description: Quốc gia
 *                   city:
 *                     type: string
 *                     description: Thành phố
 *                   district:
 *                     type: string
 *                     description: Quận/huyện
 *                   ward:
 *                     type: string
 *                     description: Phường/xã
 *                   street:
 *                     type: string
 *                     description: Đường phố
 *                   isDefault:
 *                     type: boolean
 *                     description: Là địa chỉ mặc định
 *       401:
 *         description: Không được phép truy cập
 */
router.get('/get-all', get_addresses);

/**
 * @swagger
 * /address/add:
 *   post:
 *     summary: Thêm địa chỉ mới
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - country
 *               - city
 *               - district
 *               - ward
 *               - street
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Tên đầy đủ
 *               phone:
 *                 type: string
 *                 description: Số điện thoại
 *               country:
 *                 type: string
 *                 description: Quốc gia
 *               city:
 *                 type: string
 *                 description: Thành phố
 *               district:
 *                 type: string
 *                 description: Quận/huyện
 *               ward:
 *                 type: string
 *                 description: Phường/xã
 *               street:
 *                 type: string
 *                 description: Đường phố
 *               isDefault:
 *                 type: boolean
 *                 description: Đặt làm địa chỉ mặc định
 *     responses:
 *       201:
 *         description: Địa chỉ đã được thêm thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được phép truy cập
 */
router.post('/add', add_address);

/**
 * @swagger
 * /address/update/{addressId}:
 *   put:
 *     summary: Cập nhật địa chỉ
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID địa chỉ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Tên đầy đủ
 *               phone:
 *                 type: string
 *                 description: Số điện thoại
 *               country:
 *                 type: string
 *                 description: Quốc gia
 *               city:
 *                 type: string
 *                 description: Thành phố
 *               district:
 *                 type: string
 *                 description: Quận/huyện
 *               ward:
 *                 type: string
 *                 description: Phường/xã
 *               street:
 *                 type: string
 *                 description: Đường phố
 *               isDefault:
 *                 type: boolean
 *                 description: Đặt làm địa chỉ mặc định
 *     responses:
 *       200:
 *         description: Địa chỉ đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được phép truy cập
 *       404:
 *         description: Không tìm thấy địa chỉ
 */
router.put('/update/:addressId', update_address);

/**
 * @swagger
 * /address/delete/{addressId}:
 *   delete:
 *     summary: Xóa địa chỉ
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID địa chỉ
 *     responses:
 *       200:
 *         description: Địa chỉ đã được xóa thành công
 *       401:
 *         description: Không được phép truy cập
 *       404:
 *         description: Không tìm thấy địa chỉ
 */
router.delete('/delete/:addressId', delete_address);

/**
 * @swagger
 * /address/set-default/{addressId}:
 *   put:
 *     summary: Đặt địa chỉ mặc định
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID địa chỉ
 *     responses:
 *       200:
 *         description: Địa chỉ mặc định đã được cập nhật
 *       401:
 *         description: Không được phép truy cập
 *       404:
 *         description: Không tìm thấy địa chỉ
 */
router.put('/set-default/:addressId', set_default_address);

module.exports = router; 