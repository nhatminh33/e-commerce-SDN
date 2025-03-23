const mongoose = require("mongoose");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const categoryModel = require("../../models/categoryModel");
const { responseReturn } = require("../../utiles/response");

/**
 * Get list of orders managed by seller with filter and search options
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Returns list of orders and pagination details
 */
const manageOrders = async (req, res) => {
    try {
        const sellerId = req.id;
        let { 
            page = 1, 
            perPage = 10, 
            searchValue = "", 
            delivery_status, 
            payment_status,
            startDate,
            endDate
        } = req.query;

        // Ensure page and perPage are valid numbers
        page = parseInt(page) || 1;
        perPage = parseInt(perPage) || 10;

        // Build query to find seller's products
        const sellerProducts = await productModel.find({ sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map(product => product._id);

        // Basic condition: only get orders containing seller's products
        const matchQuery = {
            "products.productId": { $in: sellerProductIds }
        };

        // Add filter conditions if provided
        if (delivery_status) {
            matchQuery.delivery_status = delivery_status;
        }
        
        if (payment_status) {
            matchQuery.payment_status = payment_status;
        }

        // Filter by date range
        if (startDate && endDate) {
            try {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Set to end of day

                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    // If the order has a createdAt field, use it
                    // Otherwise, try to use the date field
                    matchQuery.$or = [
                        {
                            createdAt: {
                                $gte: start,
                                $lte: end
                            }
                        },
                        {
                            // For old orders without createdAt, try to convert from date field
                            date: {
                                $regex: new RegExp(`${start.getFullYear()}|${end.getFullYear()}`)
                            }
                        }
                    ];
                }
            } catch (error) {
                console.error("Error parsing dates:", error);
                // Skip date filtering if there's an error
            }
        }

        // Create pipeline for advanced search and filtering
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

        // Add search by searchValue
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

        // Add pagination
        const skip = (page - 1) * perPage;
        
        // Count total orders matching the criteria
        const totalOrders = await orderModel.aggregate([...pipeline, { $count: "total" }]);
        const total = totalOrders.length > 0 ? totalOrders[0].total : 0;
        
        // Add pagination to pipeline
        pipeline.push(
            { $skip: skip },
            { $limit: perPage }
        );

        // Execute query
        const orders = await orderModel.aggregate(pipeline);

        // Filter products in each order to only show seller's products
        const filteredOrders = orders.map(order => {
            // Filter products in the order to only include those from this seller
            const sellerProducts = order.products.filter(product => 
                sellerProductIds.some(id => id.equals(product.productId))
            );
            
            // Calculate total value of this seller's products
            const sellerTotal = sellerProducts.reduce((sum, product) => sum + product.subTotal, 0);
            
            return {
                ...order,
                products: sellerProducts,
                sellerTotal
            };
        });

        return responseReturn(res, 200, {
            orders: filteredOrders,
            totalOrder: total
        });

    } catch (error) {
        console.error("Error fetching seller orders:", error);
        return responseReturn(res, 500, { error: error.message });
    }
};

/**
 * Get details of a specific order
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Returns order details
 */
const getOrderDetails = async (req, res) => {
    try {
        const sellerId = req.id;
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return responseReturn(res, 400, { error: "Invalid order ID" });
        }

        // Get seller's products
        const sellerProducts = await productModel.find({ sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map(product => product._id);

        // Get order information
        const order = await orderModel.findById(orderId)
            .populate("userId", "name email phoneNumber")
            .populate("products.productId", "name images price discount");

        if (!order) {
            return responseReturn(res, 404, { error: "Order not found" });
        }

        // Check if order contains seller's products
        const hasSellerProducts = order.products.some(product => 
            sellerProductIds.some(id => id.equals(product.productId._id))
        );

        if (!hasSellerProducts) {
            return responseReturn(res, 403, { error: "Access denied. This order does not contain your products." });
        }

        // Filter products to only show seller's products
        const filteredProducts = order.products.filter(product => 
            sellerProductIds.some(id => id.equals(product.productId._id))
        );
        
        // Calculate total value of seller's products
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
        return responseReturn(res, 500, { error: "Internal server error" });
    }
};

/**
 * Update the delivery status of an order
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Returns result message
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

        // Validate status
        const validStatuses = ["pending", "shipping", "delivered", "canceled"];
        if (!validStatuses.includes(delivery_status)) {
            return responseReturn(res, 400, { error: "Invalid delivery status" });
        }

        // Get seller's products
        const sellerProducts = await productModel.find({ sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map(product => product._id);

        // Get order details
        const order = await orderModel.findById(orderId);

        if (!order) {
            return responseReturn(res, 404, { error: "Order not found" });
        }

        // Check if order contains seller's products
        const hasSellerProducts = order.products.some(product => 
            sellerProductIds.some(id => id.equals(product.productId))
        );

        if (!hasSellerProducts) {
            return responseReturn(res, 403, { error: "Access denied. This order does not contain your products." });
        }

        // If order is canceled, don't allow updates
        if (order.delivery_status === "canceled") {
            return responseReturn(res, 400, { error: "Cannot update a canceled order" });
        }

        // If changing status to "canceled", restore stock
        if (delivery_status === "canceled" && order.delivery_status !== "canceled") {
            // Only restore stock for seller's products
            for (const item of order.products) {
                if (sellerProductIds.some(id => id.equals(item.productId))) {
                    await productModel.findByIdAndUpdate(
                        item.productId,
                        { $inc: { stock: item.quantity } }
                    );
                }
            }
        }

        // Update order status
        order.delivery_status = delivery_status;
        await order.save();

        return responseReturn(res, 200, { 
            message: `Order status updated to ${delivery_status} successfully`,
            order
        });

    } catch (error) {
        return responseReturn(res, 500, { error: "Internal server error" });
    }
};

module.exports = {
    manageOrders,
    getOrderDetails,
    updateDeliveryStatus
}; 