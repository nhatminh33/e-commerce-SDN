const router = require('express').Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { get_dashboard_summary, get_admin_order_details, admin_order_status_update } = require('../../controllers/dashboard/statisticsController');
const { get_admin_products, admin_update_product, admin_delete_product } = require('../../controllers/dashboard/productController');
const { responseReturn } = require('../../utiles/response');

// API lấy dữ liệu tổng quan cho dashboard Admin
router.get('/get-dashboard-data', adminMiddleware, get_dashboard_summary);

// API xem chi tiết đơn hàng cho admin
router.get('/order/:orderId', adminMiddleware, get_admin_order_details);

// API cập nhật trạng thái đơn hàng cho admin
router.put('/order-status/update/:orderId', adminMiddleware, admin_order_status_update);

// API quản lý sản phẩm cho admin
router.get('/products', adminMiddleware, get_admin_products);
router.put('/product/update', adminMiddleware, admin_update_product);
router.delete('/product/delete/:productId', adminMiddleware, admin_delete_product);

module.exports = router; 