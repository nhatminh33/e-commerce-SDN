const mongoose = require("mongoose");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const categoryModel = require("../../models/categoryModel");
const { responseReturn } = require("../../utiles/response");

/**
 * Lấy danh sách đơn hàng của seller với các tùy chọn lọc và tìm kiếm
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Trả về danh sách đơn hàng và thông tin phân trang
 */
const manageOrders = async (req, res) => {
    try {
        const sellerId = req.id;
        const { 
            page = 1, 
            perPage = 10, 
            searchValue = "", 
            delivery_status, 
            payment_status,
            startDate,
            endDate
        } = req.query;

        // Xây dựng query tìm các sản phẩm của seller
        const sellerProducts = await productModel.find({ sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map(product => product._id);

        // Điều kiện cơ bản: chỉ lấy đơn hàng có sản phẩm của seller này
        const matchQuery = {
            "products.productId": { $in: sellerProductIds }
        };

        // Thêm các điều kiện lọc nếu có
        if (delivery_status) {
            matchQuery.delivery_status = delivery_status;
        }
        
        if (payment_status) {
            matchQuery.payment_status = payment_status;
        }

        // Lọc theo khoảng thời gian
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Đặt về cuối ngày

            matchQuery.createdAt = {
                $gte: start,
                $lte: end
            };
        }

        // Tạo pipeline cho tìm kiếm và lọc nâng cao
        const pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $match: matchQuery
            }
        ];

        // Thêm tìm kiếm theo searchValue
        if (searchValue && searchValue.trim() !== '') {
            pipeline.push({
                $match: {
                    $or: [
                        { "user.name": { $regex: searchValue, $options: "i" } },
                        { "productDetails.name": { $regex: searchValue, $options: "i" } },
                        { "categories.name": { $regex: searchValue, $options: "i" } }
                    ]
                }
            });
        }

        // Thêm phân trang
        const skip = (parseInt(page) - 1) * parseInt(perPage);
        
        // Đếm tổng số đơn hàng thỏa mãn điều kiện
        const totalOrders = await orderModel.aggregate([...pipeline, { $count: "total" }]);
        const total = totalOrders.length > 0 ? totalOrders[0].total : 0;
        
        // Thêm phân trang vào pipeline
        pipeline.push(
            { $skip: skip },
            { $limit: parseInt(perPage) }
        );

        // Thực hiện truy vấn
        const orders = await orderModel.aggregate(pipeline);

        // Lọc sản phẩm trong mỗi đơn hàng để chỉ hiển thị sản phẩm của seller này
        const filteredOrders = orders.map(order => {
            // Lọc các sản phẩm trong đơn hàng chỉ lấy của seller này
            const sellerProducts = order.products.filter(product => 
                sellerProductIds.some(id => id.equals(product.productId))
            );
            
            // Tính lại tổng giá trị của các sản phẩm của seller này
            const sellerTotal = sellerProducts.reduce((sum, product) => sum + product.subTotal, 0);
            
            return {
                ...order,
                products: sellerProducts,
                sellerTotal
            };
        });

        return responseReturn(res, 200, {
            orders: filteredOrders,
            pagination: {
                totalOrders: total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(perPage))
            }
        });

    } catch (error) {
        console.error("Error fetching seller orders:", error);
        return responseReturn(res, 500, { error: "Internal server error" });
    }
};

/**
 * Lấy chi tiết một đơn hàng
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Trả về thông tin chi tiết của đơn hàng
 */
const getOrderDetails = async (req, res) => {
    try {
        const sellerId = req.id;
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return responseReturn(res, 400, { error: "Invalid order ID" });
        }

        // Lấy danh sách sản phẩm của seller
        const sellerProducts = await productModel.find({ sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map(product => product._id);

        // Lấy thông tin đơn hàng
        const order = await orderModel.findById(orderId)
            .populate("userId", "name email phoneNumber")
            .populate("products.productId", "name images price discount");

        if (!order) {
            return responseReturn(res, 404, { error: "Order not found" });
        }

        // Kiểm tra xem đơn hàng có chứa sản phẩm của seller này không
        const hasSellerProducts = order.products.some(product => 
            sellerProductIds.some(id => id.equals(product.productId._id))
        );

        if (!hasSellerProducts) {
            return responseReturn(res, 403, { error: "Access denied. This order does not contain your products." });
        }

        // Lọc sản phẩm chỉ hiển thị của seller này
        const filteredProducts = order.products.filter(product => 
            sellerProductIds.some(id => id.equals(product.productId._id))
        );
        
        // Tính tổng giá trị các sản phẩm của seller
        const sellerTotal = filteredProducts.reduce((sum, product) => sum + product.subTotal, 0);

        const orderDetails = {
            _id: order._id,
            userId: order.userId,
            products: filteredProducts,
            sellerTotal,
            payment_status: order.payment_status,
            delivery_status: order.delivery_status,
            shippingInfo: order.shippingInfo,
            date: order.date,
            createdAt: order.createdAt
        };

        return responseReturn(res, 200, { order: orderDetails });

    } catch (error) {
        console.error("Error fetching order details:", error);
        return responseReturn(res, 500, { error: "Internal server error" });
    }
};

/**
 * Cập nhật trạng thái giao hàng của đơn hàng
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Trả về thông báo kết quả cập nhật
 */
const updateDeliveryStatus = async (req, res) => {
    try {
        const sellerId = req.id;
        const { orderId, delivery_status } = req.body;

        if (!orderId || !delivery_status) {
            return responseReturn(res, 400, { error: "Order ID and delivery status are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return responseReturn(res, 400, { error: "Invalid order ID" });
        }

        // Kiểm tra trạng thái hợp lệ
        const validStatuses = ["pending", "shipping", "delivered", "canceled"];
        if (!validStatuses.includes(delivery_status)) {
            return responseReturn(res, 400, { error: "Invalid delivery status" });
        }

        // Lấy danh sách sản phẩm của seller
        const sellerProducts = await productModel.find({ sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map(product => product._id);

        // Lấy thông tin đơn hàng
        const order = await orderModel.findById(orderId);

        if (!order) {
            return responseReturn(res, 404, { error: "Order not found" });
        }

        // Kiểm tra xem đơn hàng có chứa sản phẩm của seller này không
        const hasSellerProducts = order.products.some(product => 
            sellerProductIds.some(id => id.equals(product.productId))
        );

        if (!hasSellerProducts) {
            return responseReturn(res, 403, { error: "Access denied. This order does not contain your products." });
        }

        // Nếu đơn hàng đã bị hủy, không cho phép cập nhật
        if (order.delivery_status === "canceled") {
            return responseReturn(res, 400, { error: "Cannot update a canceled order" });
        }

        // Nếu thay đổi trạng thái thành "canceled", cần hoàn lại stock
        if (delivery_status === "canceled" && order.delivery_status !== "canceled") {
            // Chỉ hoàn lại stock cho sản phẩm của seller này
            for (const item of order.products) {
                if (sellerProductIds.some(id => id.equals(item.productId))) {
                    await productModel.findByIdAndUpdate(
                        item.productId,
                        { $inc: { stock: item.quantity } }
                    );
                }
            }
        }

        // Cập nhật trạng thái đơn hàng
        order.delivery_status = delivery_status;

        await order.save();

        return responseReturn(res, 200, { 
            message: `Order status updated to ${delivery_status} successfully`,
            order
        });

    } catch (error) {
        console.error("Error updating delivery status:", error);
        return responseReturn(res, 500, { error: "Internal server error" });
    }
};

module.exports = {
    manageOrders,
    getOrderDetails,
    updateDeliveryStatus
}; 