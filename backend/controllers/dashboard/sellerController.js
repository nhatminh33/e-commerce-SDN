const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const orderModel = require("../../models/orderModel");
const sellerCustomerMessage = require("../../models/chat/sellerCustomerMessage");
const { responseReturn } = require("../../utiles/response");
const bcrypt = require('bcrypt');
const { mongoose } = require("mongoose");

const create_seller = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        const existingSeller = await userModel.findOne({ email, role: "seller" });
        if (existingSeller) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const seller = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role: 'seller',
            status: 'active',
        });

        return res.status(201).json({ message: 'Seller created successfully', seller });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const get_seller = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = await userModel.findOne({ _id: id, role: "seller" }).select('-password');
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }
        responseReturn(res, 200, { seller });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const get_sellers = async (req, res) => {
    try {
        const { page, searchValue, status, parPage } = req.query;

        const pageNumber = parseInt(page) || 1;
        const perPageNumber = parseInt(parPage) || 5;

        const query = { role: "seller" };

        if (searchValue) {
            query.$or = [
                { name: { $regex: searchValue, $options: 'i' } },
                { email: { $regex: searchValue, $options: 'i' } }
            ];
        }

        if (status && status !== '' && status !== 'all') {
            query.status = status;
        }

        const totalSeller = await userModel.countDocuments(query);

        const sellers = await userModel.find(query)
            .skip((pageNumber - 1) * perPageNumber)
            .limit(perPageNumber)
            .sort({ createdAt: -1 });

        responseReturn(res, 200, { 
            sellers, 
            totalSeller,
            perPage: perPageNumber,
            page: pageNumber
        });
    } catch (error) {
        console.error('Get sellers error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

const update_seller_status = async (req, res) => {
    try {
        const { sellerId, status } = req.body;

        await userModel.findByIdAndUpdate(sellerId, { status });
        const seller = await userModel.findOne({ _id: sellerId, role: "seller" });

        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        responseReturn(res, 200, { seller, message: "Update seller status successfully" });
    } catch (error) {
        console.error('Update seller status error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

const update_seller_info = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, image, paymentMethod } = req.body;
        
        const seller = await userModel.findOne({ _id: id, role: "seller" });
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        if (name) seller.name = name;
        if (email) seller.email = email;
        if (password) seller.password = await bcrypt.hash(password, 10);
        if (image) seller.image = image;
        if (paymentMethod) seller.paymentMethod = paymentMethod;

        await seller.save();
        responseReturn(res, 200, { seller, message: "Update seller info successfully" });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const change_password = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const { id } = req.params;

        if (!id || !password || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        if (password === newPassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }

        const seller = await userModel.findOne({ _id: id, role: "seller" }).select('+password');
        if (!seller) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        seller.password = await bcrypt.hash(newPassword, 10);
        await seller.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message });
    }
};

const delete_seller = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return responseReturn(res, 400, { error: 'Seller ID is required' });
        }

        const deletedSeller = await userModel.findOneAndDelete({ _id: id, role: "seller" });

        if (!deletedSeller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        responseReturn(res, 200, { message: 'Seller deleted successfully' });
    } catch (error) {
        console.error('Delete seller error:', error);
        responseReturn(res, 500, { error: `Failed to delete seller: ${error.message}` });
    }
};

const update_order_status = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const sellerId = req.seller._id;
        
        if (!orderId || !status) {
            return responseReturn(res, 400, { error: 'Order ID and new status are required' });
        }
        
        // Tìm đơn hàng và kiểm tra nó thuộc về seller này không
        const order = await orderModel.findOne({ _id: orderId, sellerId });
        
        if (!order) {
            return responseReturn(res, 404, { error: 'Order not found or does not belong to you' });
        }
        
        // Cập nhật trạng thái
        order.status = status;
        await order.save();
        
        responseReturn(res, 200, { 
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

const get_dashboard_data = async (req, res) => {
    try {
        const sellerId = req.id; // Get seller ID from token

        // 1. Get total number of products
        const totalProduct = await productModel.countDocuments({ sellerId });

        // 2. Get list of seller's products
        const sellerProducts = await productModel.find({ sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map(product => product._id);

        // 3. Get order data containing seller's products
        const orders = await orderModel.find({
            "products.productId": { $in: sellerProductIds }
        });

        // 4. Calculate total orders
        const totalOrder = orders.length;
        
        // 5. Count pending orders
        const totalPendingOrder = orders.filter(order => 
            order.delivery_status === 'pending' || 
            order.delivery_status === 'processing'
        ).length;
        
        // 6. Calculate total sales
        let totalSale = 0;
        orders.forEach(order => {
            if (order.payment_status === 'paid') {
                order.products.forEach(p => {
                    // Check if product in the order belongs to this seller
                    if (sellerProductIds.some(id => id.toString() === p.productId.toString())) {
                        totalSale += p.subTotal || 0;
                    }
                });
            }
        });
        
        // 7. Get 5 most recent orders
        const recentOrder = await orderModel.find({
            "products.productId": { $in: sellerProductIds }
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id totalPrice payment_status delivery_status date');
        
        // 8. Get recent messages from customers
        const messages = await sellerCustomerMessage.find({
            $or: [
                { senderId: sellerId },
                { receverId: sellerId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(5);

        // Process sender and receiver information
        const messageUserIds = [
            ...new Set([
                ...messages.map(m => m.senderId),
                ...messages.map(m => m.receverId)
            ].filter(id => id !== sellerId))
        ];

        const messageUsers = await userModel.find({
            _id: { $in: messageUserIds }
        }).select('name image');

        const userMap = {};
        messageUsers.forEach(user => {
            userMap[user._id.toString()] = {
                name: user.name,
                image: user.image
            };
        });

        const recentMessage = messages.map(m => {
            const otherUserId = m.senderId === sellerId ? m.receverId : m.senderId;
            const userInfo = userMap[otherUserId] || { name: "Unknown User", image: "" };
            
            return {
                _id: m._id,
                senderId: m.senderId,
                senderName: m.senderId === sellerId ? 'You' : userInfo.name,
                message: m.message,
                createdAt: m.createdAt
            };
        });
        
        // 9. Calculate monthly chart data
        const currentYear = new Date().getFullYear();
        const monthlyData = await generateMonthlyData(sellerId, sellerProductIds, currentYear);
        
        responseReturn(res, 200, {
            totalSale,
            totalOrder,
            totalProduct,
            totalPendingOrder,
            recentOrder,
            recentMessage,
            chartData: monthlyData
        });
        
    } catch (error) {
        console.error("Seller dashboard error:", error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Function to calculate monthly data
const generateMonthlyData = async (sellerId, sellerProductIds, year) => {
    const monthlyData = {
        orders: Array(12).fill(0),
        revenue: Array(12).fill(0),
        sales: Array(12).fill(0)
    };
    
    // Get all orders from the current year
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    // Create filter condition for orders by seller's products and year
    const query = {
        "products.productId": { $in: sellerProductIds },
        $or: [
            {
                createdAt: { $gte: startDate, $lte: endDate }
            },
            {
                // For old orders without createdAt, use date field
                date: { $regex: new RegExp(`${year}`) }
            }
        ]
    };
    
    const orders = await orderModel.find(query);
    
    orders.forEach(order => {
        // Determine month from createdAt or date field
        let month;
        if (order.createdAt) {
            month = new Date(order.createdAt).getMonth();
        } else if (order.date) {
            // Extract month from date field (assuming format is DD-MM-YYYY or YYYY-MM-DD)
            const dateMatch = order.date.match(/(\d{2})-(\d{2})-(\d{4})|(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
                // If format is DD-MM-YYYY
                if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
                    month = parseInt(dateMatch[2]) - 1; // subtract 1 because JS months are 0-11
                } 
                // If format is YYYY-MM-DD
                else if (dateMatch[4] && dateMatch[5] && dateMatch[6]) {
                    month = parseInt(dateMatch[5]) - 1;
                }
            } else {
                // If month cannot be determined, use current month
                month = new Date().getMonth();
            }
        } else {
            // Default to current month
            month = new Date().getMonth();
        }
        
        // Increment order count
        monthlyData.orders[month]++;
        
        // Calculate revenue and sales
        if (order.payment_status === 'paid') {
            order.products.forEach(product => {
                // Check if product in order belongs to this seller
                if (sellerProductIds.some(id => id.toString() === product.productId.toString())) {
                    // Revenue: total money earned
                    monthlyData.revenue[month] += product.subTotal || 0;
                    
                    // Sales: number of products sold
                    monthlyData.sales[month] += product.quantity || 0;
                }
            });
        }
    });
    
    return {
        labels: ['Jan', 'Feb', 'Mar', 'Apl', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        orders: monthlyData.orders,
        revenue: monthlyData.revenue,
        sales: monthlyData.sales
    };
};

module.exports = {
    create_seller,
    get_seller,
    get_sellers,
    update_seller_status,
    update_seller_info,
    change_password,
    delete_seller,
    update_order_status,
    get_dashboard_data
};
