const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { responseReturn } = require("../utiles/response");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel")

const placeOrder = async (req, res) => {
    try {
        const { userId, shippingInfo, selectedItems } = req.body;

        // Validate input
        if (!userId || !shippingInfo || !selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        // Get cart items with product details
        const cartItems = await cartModel.find({
            userId,
            _id: { $in: selectedItems }
        }).populate("productId", "name price stock discount sellerId");

        if (!cartItems.length) {
            return res.status(400).json({ success: false, message: "Selected items not found in cart" });
        }

        // Group items by seller
        const ordersBySeller = {};

        for (const cartItem of cartItems) {
            const product = cartItem.productId;
            
            // Validate product data
            if (!product || typeof product.price !== "number" || isNaN(product.price)) {
                return res.status(400).json({ success: false, message: "Invalid product price in cart" });
            }
            if (!cartItem.quantity || isNaN(cartItem.quantity) || cartItem.quantity <= 0) {
                return res.status(400).json({ success: false, message: "Invalid quantity for product" });
            }
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for product ${product.name}. Available: ${product.stock}`,
                });
            }

            // Calculate prices
            const discount = product.discount && typeof product.discount === "number" ? product.discount : 0;
            const discountedPrice = product.price - (product.price * discount) / 100;
            const subTotal = discountedPrice * cartItem.quantity;

            // Group by seller ID
            if (!ordersBySeller[product.sellerId]) {
                ordersBySeller[product.sellerId] = {
                    products: [],
                    totalPrice: 0
                };
            }

            // Add product to seller's order
            ordersBySeller[product.sellerId].products.push({
                productId: product._id,
                name: product.name,
                quantity: cartItem.quantity,
                price: discountedPrice,
                subTotal: subTotal
            });

            // Update total price for this seller
            ordersBySeller[product.sellerId].totalPrice += subTotal;

            // Update product stock
            await productModel.findByIdAndUpdate(product._id, {
                $inc: { stock: -cartItem.quantity }
            });
        }

        // Create separate orders for each seller
        const createdOrders = [];

        for (const sellerId in ordersBySeller) {
            const newOrder = new orderModel({
                userId,
                products: ordersBySeller[sellerId].products,
                totalPrice: ordersBySeller[sellerId].totalPrice,
                payment_status: "pending",
                shippingInfo,
                delivery_status: "pending",
                date: new Date(),
                sellerId
            });
            await newOrder.save();
            createdOrders.push(newOrder);
        }

        // Remove ordered items from cart
        await cartModel.deleteMany({ _id: { $in: selectedItems } });
        
        // Get user information
        const user = await userModel.findById(userId).select("name email");

        // Return success response
        return res.status(201).json({
            success: true,
            message: "Orders placed successfully",
            orders: createdOrders.map(order => ({
                _id: order._id,
                sellerId: order.sellerId,
                user: {
                    name: user.name,
                    email: user.email
                },
                products: order.products,
                totalPrice: order.totalPrice,
                payment_status: order.payment_status,
                shippingInfo: order.shippingInfo,
                delivery_status: order.delivery_status,
                date: order.date,
            }))
        });
    } catch (error) {
        console.error("Error placing order:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Tìm đơn hàng
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Xử lý từng trạng thái cụ thể
        if (status === "canceled") {
            if (order.delivery_status !== "pending") {
                return res.status(400).json({ success: false, message: "Only pending orders can be canceled" });
            }
            
            // Hoàn lại hàng vào kho
            for (const item of order.products) {
                const product = await productModel.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
            order.payment_status = "canceled";
        } else if (status === "shipping") {
            if (order.delivery_status !== "pending") {
                return res.status(400).json({ success: false, message: "Order cannot be confirmed" });
            }
            order.payment_status = "paid";
        } else if (status === "delivered") {
            if (order.delivery_status === "delivered" || order.delivery_status === "canceled") {
                return res.status(400).json({ success: false, message: "Order cannot be delivered" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        // Cập nhật trạng thái đơn hàng
        order.delivery_status = status;
        await order.save();

        return res.status(200).json({ success: true, message: `Order status updated to ${status}`, order });

    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getOrdersByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await orderModel.find({ userId });
        return res.status(200).json({ success: true, message: "Orders retrieved successfully", orders });
    } catch (error) {
        console.error("Error retrieving orders:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getDetailOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json({ success: true, message: "Order retrieved successfully", order });
    } catch (error) {
        console.error("Error retrieving order:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getOrdersBySeller = async (req, res) => {
    try {
        let sellerId = req.seller?._id || req.params.sellerId || req.query.sellerId;

        if (!sellerId) {
            return res.status(400).json({ success: false, message: "Seller ID is required" });
        }

        // Chuyển đổi sellerId thành ObjectId
        const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
            ? new mongoose.Types.ObjectId(sellerId)
            : null;

        if (!sellerObjectId) {
            return res.status(400).json({ success: false, message: "Invalid Seller ID format" });
        }

        console.log("[INFO] Converted sellerObjectId:", sellerObjectId);

        // Kiểm tra seller có tồn tại không
        const sellerExists = await userModel.findById(sellerObjectId).select("_id name");
        if (!sellerExists) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        // Đếm số lượng sản phẩm của seller
        const productCount = await productModel.countDocuments({ sellerId: sellerObjectId });
        if (productCount === 0) {
            return res.status(200).json({ success: true, message: "No products found for this seller", orders: [] });
        }

        // Lấy danh sách sản phẩm của seller
        const sellerProducts = await productModel.find({ sellerId: sellerObjectId }).lean();
        const sellerProductIds = sellerProducts.map((product) => product._id);

        // Tìm tất cả các đơn hàng chứa sản phẩm của seller
        const orders = await orderModel
            .find({ "products.productId": { $in: sellerProductIds } })
            .populate({
                path: "products.productId",
                select: "name images price slug sellerId",
            })
            .populate({
                path: "userId",
                select: "name email phoneNumber",
            })
            .sort({ date: -1 })
            .lean();

        // Lọc các đơn hàng để chỉ giữ lại sản phẩm thuộc seller này
        const sellerOrders = orders
            .map((order) => {
                order.products = order.products.filter(
                    (product) =>
                        product.productId?.sellerId?.toString() === sellerObjectId.toString()
                );

                if (order.products.length === 0) return null;

                // Tính tổng doanh thu của seller trong đơn hàng này
                order.sellerTotal = order.products.reduce((total, product) => total + product.subTotal, 0);
                return order;
            })
            .filter(Boolean); // Loại bỏ null values

        return res.status(200).json({ success: true, message: "Orders retrieved successfully", sellerOrders });
    } catch (error) {
        console.error("[ERROR] Failed to get seller orders:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { 
    placeOrder ,
    getOrdersByUserId,
    updateOrderStatus,
    getDetailOrder,
    getOrdersBySeller
};