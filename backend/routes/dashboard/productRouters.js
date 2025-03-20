const router = require('express').Router();
const sellerMiddleware = require('../../middlewares/sellerMiddleware');
const { add_product, get_products, get_product, update_product, product_image_update, delete_product, seller_manage_products } = require('../../controllers/dashboard/productController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Thêm sản phẩm mới (seller)
router.post('/product-add/:sellerId', sellerMiddleware, add_product);

// Lấy danh sách sản phẩm 
router.get('/products-get', get_products);

// Lấy thông tin chi tiết sản phẩm
router.get('/product-get/:id', get_product);

// Cập nhật thông tin sản phẩm
router.post('/product-update', sellerMiddleware, update_product);

// Cập nhật hình ảnh sản phẩm
router.post('/product-image-update', sellerMiddleware, product_image_update);

// Xóa sản phẩm
router.delete('/product-delete/:id', sellerMiddleware, delete_product);

// API quản lý sản phẩm của seller
router.get('/seller-products', sellerMiddleware, seller_manage_products);

module.exports = router;