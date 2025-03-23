const router = require('express').Router();
const sellerMiddleware = require('../../middlewares/sellerMiddleware');
const { add_product, get_products, get_product, update_product, product_image_update, delete_product, seller_manage_products } = require('../../controllers/dashboard/productController');
const authMiddleware = require('../../middlewares/authMiddleware');
const systemMiddleware = require('../../middlewares/systemMiddleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API quản lý sản phẩm
 */

/**
 * @swagger
 * /product-add/{sellerId}:
 *   post:
 *     summary: Thêm sản phẩm mới
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người bán
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - description
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *               discount:
 *                 type: number
 *                 description: Phần trăm giảm giá
 *               category:
 *                 type: string
 *                 description: ID danh mục sản phẩm
 *               description:
 *                 type: string
 *                 description: Mô tả sản phẩm
 *               stock:
 *                 type: number
 *                 description: Số lượng trong kho
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *                 description: Danh sách ảnh sản phẩm
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/product-add/:sellerId', sellerMiddleware, add_product);

/**
 * @swagger
 * /products-get:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng sản phẩm mỗi trang
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sản phẩm
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, price-low-to-high, price-high-to-low]
 *         description: Sắp xếp sản phẩm
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 totalProducts:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get('/products-get', get_products);

/**
 * @swagger
 * /product-get/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin chi tiết sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get('/product-get/:id', get_product);

/**
 * @swagger
 * /product-update:
 *   post:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *               discount:
 *                 type: number
 *                 description: Phần trăm giảm giá
 *               category:
 *                 type: string
 *                 description: ID danh mục sản phẩm
 *               description:
 *                 type: string
 *                 description: Mô tả sản phẩm
 *               stock:
 *                 type: number
 *                 description: Số lượng trong kho
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.post('/product-update', sellerMiddleware, update_product);

/**
 * @swagger
 * /product-image-update:
 *   post:
 *     summary: Cập nhật hình ảnh sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - images
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *                 description: Danh sách ảnh sản phẩm mới
 *     responses:
 *       200:
 *         description: Hình ảnh sản phẩm đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.post('/product-image-update', systemMiddleware, product_image_update);

/**
 * @swagger
 * /product-delete/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.delete('/product-delete/:id', sellerMiddleware, delete_product);

/**
 * @swagger
 * /seller-products:
 *   get:
 *     summary: Lấy danh sách sản phẩm của người bán
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng sản phẩm mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm của người bán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 totalProducts:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/seller-products', sellerMiddleware, seller_manage_products);

module.exports = router;