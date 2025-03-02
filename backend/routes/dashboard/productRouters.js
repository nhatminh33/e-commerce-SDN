const router = require('express').Router();
const sellerMiddleware = require('../../middlewares/sellerMiddleware');
const { add_product, get_products, get_product, update_product, update_product_image, delete_product } = require('../../controllers/dashboard/productController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/add-product/:sellerId', sellerMiddleware, add_product)
router.get('/get-products', get_products)
router.get('/get-product/:id', get_product)
router.post('/update-product/:id', sellerMiddleware, update_product)
router.post('/update-product-image/:id', sellerMiddleware, update_product_image)
router.delete('/delete-product/:id', sellerMiddleware, delete_product)

module.exports = router;