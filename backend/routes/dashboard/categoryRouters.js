const router = require('express').Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { add_category, update_category, get_categories, get_category, delete_category } = require('../../controllers/dashboard/categoryController');
const authMiddleware = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API quản lý danh mục sản phẩm
 */

/**
 * @swagger
 * /add-category:
 *   post:
 *     summary: Thêm danh mục mới
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên danh mục
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh danh mục
 *     responses:
 *       201:
 *         description: Danh mục đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/add-category', adminMiddleware, add_category)

/**
 * @swagger
 * /update-category/{id}:
 *   post:
 *     summary: Cập nhật danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên danh mục
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh danh mục
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Trạng thái danh mục
 *     responses:
 *       200:
 *         description: Danh mục đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy danh mục
 */
router.post('/update-category/:id', adminMiddleware, update_category)

/**
 * @swagger
 * /get-categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/get-categories', get_categories)

/**
 * @swagger
 * /get-category/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Thông tin chi tiết danh mục
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy danh mục
 */
router.get('/get-category/:id', get_category)

/**
 * @swagger
 * /delete-category/{id}:
 *   delete:
 *     summary: Xóa danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Danh mục đã được xóa thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy danh mục
 */
router.delete('/delete-category/:id', adminMiddleware, delete_category)

module.exports = router;