const router = require("express").Router();
const orderManagerController = require("../../controllers/dashboard/orderManagerController");
const sellerMiddleware = require("../../middlewares/sellerMiddleware");

// Áp dụng middleware seller cho tất cả các route
router.use(sellerMiddleware);

// Lấy danh sách đơn hàng với phân trang và tìm kiếm/lọc
router.get("/", orderManagerController.manageOrders);

// Lấy chi tiết đơn hàng
router.get("/:orderId", orderManagerController.getOrderDetails);

// Cập nhật trạng thái giao hàng
router.put("/update-status", orderManagerController.updateDeliveryStatus);

module.exports = router; 