const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { responseReturn } = require("../utiles/response");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel")

const placeOrder = async (req, res) => {
    try {
        const { userId, shippingInfo, selectedItems } = req.body;

        if (!userId || !shippingInfo || !selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        const cartItems = await cartModel.find({
            userId,
            _id: { $in: selectedItems }
        }).populate("productId", "name price stock discount");

        if (!cartItems.length) {
            return res.status(400).json({ success: false, message: "Selected items not found in cart" });
        }

        let totalPrice = 0;
        let orderProducts = [];

        for (const cartItem of cartItems) {
            const product = cartItem.productId;

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

            const discount = product.discount && typeof product.discount === "number" ? product.discount : 0;
            const discountedPrice = product.price - (product.price * discount) / 100;
            const subTotal = discountedPrice * cartItem.quantity;

            if (isNaN(discountedPrice) || isNaN(subTotal)) {
                return res.status(400).json({ success: false, message: "Invalid price calculation" });
            }

            totalPrice += subTotal;

            orderProducts.push({
                productId: product._id,
                name: product.name,
                quantity: cartItem.quantity,
                price: discountedPrice,
                subTotal: subTotal
            });

            await productModel.findByIdAndUpdate(product._id, {
                $inc: { stock: -cartItem.quantity }
            });
        }

        if (isNaN(totalPrice) || totalPrice <= 0) {
            return res.status(400).json({ success: false, message: "Total price calculation error" });
        }

        const newOrder = new orderModel({
            userId,
            products: orderProducts,
            totalPrice,
            payment_status: "pending",
            shippingInfo,
            delivery_status: "pending",
            date: new Date(),
        });

        await newOrder.save();
        await cartModel.deleteMany({ _id: { $in: selectedItems } });

        // Get user info
        const user = await userModel.findById(userId).select("name email");

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: {
                _id: newOrder._id,
                user: {
                    name: user.name,
                    email: user.email
                },
                products: orderProducts,
                totalPrice: newOrder.totalPrice,
                payment_status: newOrder.payment_status,
                shippingInfo: newOrder.shippingInfo,
                delivery_status: newOrder.delivery_status,
                date: newOrder.date,
            }
        });

    } catch (error) {
        console.error("Error placing order:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Tìm đơn hàng
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Kiểm tra trạng thái đơn hàng
        if (order.delivery_status !== "pending") {
            return res.status(400).json({ success: false, message: "Only pending orders can be canceled" });
        }

        // Hoàn lại hàng vào kho
        for (const item of order.products) {  // Đã sửa ở đây
            const product = await productModel.findById(item.productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        // Cập nhật trạng thái đơn hàng
        order.delivery_status = "canceled";
        order.payment_status = "canceled"
        await order.save();

        return res.status(200).json({ success: true, message: "Order canceled successfully" });

    } catch (error) {
        console.error("Error canceling order:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Tìm đơn hàng
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Kiểm tra trạng thái
        if (order.delivery_status !== "pending") {
            return res.status(400).json({ success: false, message: "Order cannot be confirmed" });
        }

        // Cập nhật trạng thái đơn hàng
        order.delivery_status = "shipping";
        order.payment_status = "paid"
        await order.save();

        return res.status(200).json({ success: true, message: "Order confirmed successfully", order });

    } catch (error) {
        console.error("Error confirming order:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateOrderStatusDeliveried = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Kiểm tra trạng thái hợp lệ
        const status = "delivered"

        // Tìm đơn hàng
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if(order.delivery_status === "delivered" || order.delivery_status === "canceled"){
            return res.status(400).json({ success: false, message: "Order cannot be delivered" });
        }
        // Cập nhật trạng thái đơn hàng
        order.delivery_status = status;
        await order.save();

        return res.status(200).json({ success: true, message: "Order have been delivered", order });

    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports = { 
    placeOrder ,
    cancelOrder,
    confirmOrder,
    updateOrderStatusDeliveried
};