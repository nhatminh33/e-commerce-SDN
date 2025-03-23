const mongoose = require("mongoose");
const { responseReturn } = require("../../utiles/response");
const orderModel = require("../../models/orderModel");
const myShopWallet = require("../../models/myShopWallet");
const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");

// Flexible revenue statistics API with multiple parameters
const get_revenue = async (req, res) => {
    try {
        const {
            // Pagination parameters
            page = 1,
            perPage = 10,
            
            // General time parameters
            startDate,
            endDate,
            
            // Advanced filter parameters
            categoryId,
            productId,
            orderStatus,
            sellerId,
            
            // Search parameter
            searchQuery,
            
            // Sort parameters
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.body;

        // Initialize result object
        const result = {
            summary: {}
        };

        // Initialize basic query for orders
        let query = {
            // payment_status: "paid"
        };

        // Exclude canceled orders by default unless explicitly requested
        if (orderStatus) {
            query.delivery_status = orderStatus;
        } else {
            query.delivery_status = { $ne: "canceled" };
        }

        // Set time range for search
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return responseReturn(res, 400, { error: 'Invalid date format' });
            }
            
            // Đặt giờ của end date thành cuối ngày để bao gồm toàn bộ ngày kết thúc
            end.setHours(23, 59, 59, 999);
            
            query.createdAt = {
                $gte: start,
                $lte: end
            };
        }

        // Xử lý tìm kiếm theo từ khóa và các bộ lọc
        let productIds = [];
        let sellerIds = [];

        // Lọc theo danh mục sản phẩm nếu cung cấp
        if (categoryId) {
            // Lấy tất cả sản phẩm trong danh mục
            const categoryProducts = await productModel.find({ categoryId }).select('_id');
            productIds = categoryProducts.map(p => p._id.toString());
        }

        // Lọc theo sellerId nếu cung cấp
        if (sellerId) {
            // Lấy tất cả sản phẩm của người bán này
            const sellerProducts = await productModel.find({ sellerId }).select('_id');
            const sellerProductIds = sellerProducts.map(product => product._id.toString());
            
            // Nếu đã có danh sách sản phẩm từ bộ lọc danh mục, lấy giao của 2 danh sách
            if (productIds.length > 0) {
                productIds = productIds.filter(id => sellerProductIds.includes(id));
            } else {
                productIds = sellerProductIds;
            }
            
            sellerIds = [sellerId];
        }

        // Lọc theo productId nếu cung cấp (ghi đè lên các bộ lọc sản phẩm khác)
        if (productId) {
            productIds = [productId];
        }

        // Chuyển danh sách productIds sang đối tượng MongoDB
        if (productIds.length > 0) {
            query['products.productId'] = { 
                $in: productIds.map(id => mongoose.Types.ObjectId.isValid(id) ? 
                    new mongoose.Types.ObjectId(id) : id) 
            };
        }

        // Xử lý tìm kiếm theo từ khóa (tên sản phẩm, danh mục, người bán)
        if (searchQuery) {
            // 1. Tìm kiếm theo tên sản phẩm
            const matchedProducts = await productModel.find({
                name: { $regex: searchQuery, $options: 'i' }
            }).select('_id');
            const searchProductIds = matchedProducts.map(p => p._id.toString());

            // 2. Tìm kiếm theo tên người bán
            const matchedSellers = await userModel.find({
                role: 'seller',
                name: { $regex: searchQuery, $options: 'i' }
            }).select('_id');
            const searchSellerIds = matchedSellers.map(s => s._id.toString());

            // 3. Tìm kiếm sản phẩm theo người bán đã tìm thấy
            if (searchSellerIds.length > 0) {
                const sellerProducts = await productModel.find({
                    sellerId: { $in: searchSellerIds }
                }).select('_id');
                searchProductIds.push(...sellerProducts.map(p => p._id.toString()));
            }

            // 4. Tìm kiếm theo tên danh mục
            const categoryProducts = await productModel.find().populate({
                path: 'categoryId',
                match: { name: { $regex: searchQuery, $options: 'i' } }
            });
            
            const productsInMatchedCategories = categoryProducts
                .filter(p => p.categoryId) // Lọc bỏ null
                .map(p => p._id.toString());
            
            searchProductIds.push(...productsInMatchedCategories);

            // Thêm bộ lọc sản phẩm tìm kiếm vào query
            if (searchProductIds.length > 0) {
                // Nếu đã có bộ lọc sản phẩm, lấy giao của 2 danh sách
                if (query['products.productId']) {
                    const existingIds = query['products.productId'].$in.map(id => id.toString());
                    const filteredIds = searchProductIds.filter(id => existingIds.includes(id));
                    
                    if (filteredIds.length > 0) {
                        query['products.productId'] = { 
                            $in: filteredIds.map(id => mongoose.Types.ObjectId.isValid(id) ? 
                                new mongoose.Types.ObjectId(id) : id) 
                        };
                    } else {
                        // Nếu không có sản phẩm nào khớp cả 2 điều kiện, đảm bảo không có kết quả nào trả về
                        query['products.productId'] = { $in: [] };
                    }
                } else {
                    query['products.productId'] = { 
                        $in: searchProductIds.map(id => mongoose.Types.ObjectId.isValid(id) ? 
                            new mongoose.Types.ObjectId(id) : id) 
                    };
                }
            }
        }

        // Đếm tổng số lượng đơn hàng thỏa mãn điều kiện
        const total = await orderModel.countDocuments(query);
        
        // Xác định cách sắp xếp
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Mặc định sắp xếp theo thời gian nếu sortBy không tồn tại trong model
        if (!['createdAt', 'date', 'totalPrice', 'delivery_status', 'payment_status'].includes(sortBy)) {
            sortOptions.createdAt = -1; // Mặc định mới nhất lên đầu
        }

        // Lấy đơn hàng với phân trang
        const skip = (Number(page) - 1) * Number(perPage);
        const orders = await orderModel.find(query)
            .populate('userId', 'name email')
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(perPage));
            
        // Đây là mảng để lưu trữ thông tin chi tiết hơn về đơn hàng
        const enhancedOrders = [];

        // Trả về thông tin chi tiết hơn cho mỗi đơn hàng
        for (const order of orders) {
            const orderData = order.toObject();
            
            // Thêm thông tin chi tiết về sản phẩm (tên danh mục, người bán) nếu cần
            const productDetails = [];
            
            for (const product of orderData.products) {
                const productInfo = await productModel.findById(product.productId)
                    .select('name categoryId sellerId')
                    .populate('categoryId', 'name')
                    .populate('sellerId', 'name shopInfo');
                
                if (productInfo) {
                    productDetails.push({
                        ...product,
                        categoryName: productInfo.categoryId ? productInfo.categoryId.name : 'Unknown',
                        categoryId: productInfo.categoryId ? productInfo.categoryId._id : null,
                        sellerName: productInfo.sellerId ? productInfo.sellerId.name : 'Unknown',
                        sellerId: productInfo.sellerId ? productInfo.sellerId._id : null,
                        shopName: productInfo.sellerId && productInfo.sellerId.shopInfo ? 
                            productInfo.sellerId.shopInfo.shopName : 'Unknown'
                    });
                } else {
                    productDetails.push(product);
                }
            }
            
            orderData.products = productDetails;
            enhancedOrders.push(orderData);
        }

        // Calculate total revenue and order count
        const allOrders = await orderModel.find(query);
        const totalRevenue = allOrders.reduce((total, order) => total + order.totalPrice, 0);
        const orderCount = allOrders.length;
        
        // Add summary information to result
        result.summary = {
            totalRevenue,
            orderCount,
            averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0
        };

        // Trả về kết quả với phân trang
        result.orders = enhancedOrders;
        result.pagination = {
            totalPages: Math.ceil(total / Number(perPage)),
            total,
            currentPage: Number(page),
            perPage: Number(perPage)
        };

        responseReturn(res, 200, result);
    } catch (error) {
        console.error(`Get revenue error: ${error.message}`, error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Get dashboard summary statistics
const get_dashboard_summary = async (req, res) => {
    try {
        // Get total orders
        const totalOrders = await orderModel.countDocuments();
        
        // Get total paid orders
        const paidOrders = await orderModel.countDocuments({ payment_status: "paid" });
        
        // Get total delivered orders
        const deliveredOrders = await orderModel.countDocuments({ 
            payment_status: "paid", 
            delivery_status: "delivered" 
        });
        
        // Get total shipping orders
        const shippingOrders = await orderModel.countDocuments({ 
            payment_status: "paid", 
            delivery_status: "shipping" 
        });
        
        // Get total pending orders
        const pendingOrders = await orderModel.countDocuments({ 
            payment_status: "paid", 
            delivery_status: "pending" 
        });
        
        // Get total canceled orders
        const canceledOrders = await orderModel.countDocuments({ 
            $or: [
                { payment_status: "canceled" },
                { delivery_status: "canceled" }
            ]
        });
        
        // Get total revenue from paid orders
        const revenueResult = await orderModel.aggregate([
            { $match: { payment_status: "paid" } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
        ]);
        
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        
        // Get revenue for current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const monthlyRevenueResult = await orderModel.aggregate([
            { 
                $match: { 
                    payment_status: "paid",
                    date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
                } 
            },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
        ]);
        
        const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].totalRevenue : 0;
        
        // Get revenue for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const dailyRevenueResult = await orderModel.aggregate([
            { 
                $match: { 
                    payment_status: "paid",
                    date: { $gte: startOfDay, $lte: endOfDay }
                } 
            },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
        ]);
        
        const dailyRevenue = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].totalRevenue : 0;
        
        // Get customer count
        const totalCustomers = await userModel.countDocuments({ role: "customer" });
        
        // Get seller count
        const totalSellers = await userModel.countDocuments({ role: "seller" });

        // Get recent orders
        const recentOrders = await orderModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id totalPrice payment_status delivery_status date')
            .lean()
            .exec();

        // Get recent messages from sellers to admin
        const messages = await userModel.aggregate([
            { $match: { role: "seller" } },
            { $limit: 5 },
            { 
                $project: { 
                    _id: 1, 
                    name: 1, 
                    image: 1, 
                    createdAt: 1,
                    message: { $literal: "Hello Admin, I'm a seller" },
                    senderId: "$_id",
                    senderName: "$name"
                } 
            }
        ]);
        
        responseReturn(res, 200, {
            orders: {
                total: totalOrders,
                paid: paidOrders,
                delivered: deliveredOrders,
                shipping: shippingOrders,
                pending: pendingOrders,
                canceled: canceledOrders
            },
            revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue,
                daily: dailyRevenue
            },
            users: {
                customers: totalCustomers,
                sellers: totalSellers
            },
            totalSale: totalRevenue,
            totalOrder: totalOrders,
            totalProduct: await productModel.countDocuments(),
            totalSeller: totalSellers,
            recentOrders,
            messages
        });
    } catch (error) {
        console.error('Get dashboard summary error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

/**
 * API thống kê khách hàng với phân trang và bộ lọc
 * 
 * @route POST /api/get-customer-statistics
 * @access Admin
 * 
 * @param {Object} req.body - Các tham số truyền vào từ client
 * 
 * @param {Number} [req.body.page=1] - Số trang hiện tại, mặc định là 1
 * @param {Number} [req.body.perPage=10] - Số khách hàng hiển thị trên một trang, mặc định là 10
 * 
 * @param {String} [req.body.startDate] - Ngày bắt đầu khoảng thời gian thống kê (định dạng YYYY-MM-DD)
 * @param {String} [req.body.endDate] - Ngày kết thúc khoảng thời gian thống kê (định dạng YYYY-MM-DD)
 * 
 * @param {Number} [req.body.minSpent] - Số tiền chi tiêu tối thiểu của khách hàng, đơn vị VND
 * @param {Number} [req.body.maxSpent] - Số tiền chi tiêu tối đa của khách hàng, đơn vị VND
 * @param {Number} [req.body.minOrders] - Số lượng đơn hàng tối thiểu của khách hàng
 * @param {Number} [req.body.maxOrders] - Số lượng đơn hàng tối đa của khách hàng
 * @param {String} [req.body.searchQuery] - Từ khóa tìm kiếm theo tên hoặc email của khách hàng
 * 
 * @param {String} [req.body.sortBy='totalSpent'] - Trường để sắp xếp kết quả:
 *   - 'totalSpent': Sắp xếp theo tổng tiền chi tiêu
 *   - 'orderCount': Sắp xếp theo số lượng đơn hàng
 *   - 'averageOrderValue': Sắp xếp theo giá trị đơn hàng trung bình
 *   - 'name': Sắp xếp theo tên khách hàng
 *   - 'email': Sắp xếp theo email khách hàng
 * 
 * @param {String} [req.body.sortOrder='desc'] - Thứ tự sắp xếp:
 *   - 'desc': Giảm dần (lớn → nhỏ) - Mặc định
 *   - 'asc': Tăng dần (nhỏ → lớn)
 * 
 * @returns {Object} Dữ liệu thống kê khách hàng với phân trang và phân phối tần suất mua hàng
 */
const get_customer_statistics = async (req, res) => {
    try {
        const { 
            // Pagination parameters
            page = 1, 
            perPage = 10, 
            
            // Time range parameters
            startDate, 
            endDate,
            
            // Filter parameters
            minSpent,
            maxSpent,
            minOrders,
            maxOrders,
            searchQuery,
            
            // Sort parameters
            sortBy = 'totalSpent',
            sortOrder = 'desc'
        } = req.body;

        // Lấy tổng số khách hàng
        const totalCustomers = await userModel.countDocuments({ role: "customer" });
        
        // Tạo query đơn giản để lấy tất cả khách hàng
        let query = { role: "customer" };
        
        // Thêm tìm kiếm nếu có
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ];
        }
        
        // Lấy danh sách khách hàng (chưa phân trang)
        const customers = await userModel.find(query)
            .select('name email image createdAt');
        
        // Tạo query để lấy đơn hàng
        let orderQuery = { payment_status: "paid" };
        let timeRangeInfo = 'all time';
        
        // Thêm lọc theo thời gian nếu có
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Kiểm tra định dạng ngày hợp lệ
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return responseReturn(res, 400, { error: 'Invalid date format' });
            }
            
            orderQuery.date = {
                $gte: start,
                $lte: end
            };
            
            timeRangeInfo = { startDate, endDate };
        }
        
        // Lấy tất cả đơn hàng theo điều kiện
        const orders = await orderModel.find(orderQuery).select('userId totalPrice products');
        
        // Tính số khách hàng mới trong khoảng thời gian
        const newCustomerQuery = { role: "customer" };
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            newCustomerQuery.createdAt = { $gte: start, $lte: end };
        }
        const newCustomers = await userModel.countDocuments(newCustomerQuery);
        
        // Tạo Map để lưu thông tin mua hàng của từng khách hàng
        const customerStatsMap = new Map();
        
        // Khởi tạo Map với tất cả khách hàng
        customers.forEach(customer => {
            customerStatsMap.set(customer._id.toString(), {
                customerId: customer._id,
                name: customer.name || 'Unknown',
                email: customer.email || 'Unknown',
                image: customer.image || '',
                totalSpent: 0,
                orderCount: 0,
                averageOrderValue: 0,
                createdAt: customer.createdAt
            });
        });
        
        // Đếm khách hàng có hoạt động trong khoảng thời gian
        const activeCustomerIds = new Set();
        
        // Tính toán thống kê cho từng khách hàng dựa trên đơn hàng
        orders.forEach(order => {
            if (order.userId) {
                const customerId = order.userId.toString();
                
                // Đánh dấu khách hàng đã mua hàng
                activeCustomerIds.add(customerId);
                
                // Nếu khách hàng này trong danh sách chúng ta đang xem
                if (customerStatsMap.has(customerId)) {
                    const customerStats = customerStatsMap.get(customerId);
                    
                    // Cập nhật tổng chi tiêu
                    customerStats.totalSpent += order.totalPrice;
                    
                    // Cập nhật số đơn hàng
                    customerStats.orderCount += 1;
                }
            }
        });
        
        // Tính giá trị đơn hàng trung bình cho từng khách hàng
        customerStatsMap.forEach(customer => {
            if (customer.orderCount > 0) {
                customer.averageOrderValue = customer.totalSpent / customer.orderCount;
            }
        });
        
        // Chuyển Map thành mảng để xử lý tiếp
        let customersData = Array.from(customerStatsMap.values());
        
        // Lọc theo các tiêu chí chi tiêu và số đơn hàng
        let filteredCustomersData = customersData.filter(customer => {
            let passFilter = true;
            
            // Lọc theo tổng chi tiêu
            if (minSpent !== undefined && customer.totalSpent < Number(minSpent)) passFilter = false;
            if (maxSpent !== undefined && customer.totalSpent > Number(maxSpent)) passFilter = false;
            
            // Lọc theo số đơn hàng
            if (minOrders !== undefined && customer.orderCount < Number(minOrders)) passFilter = false;
            if (maxOrders !== undefined && customer.orderCount > Number(maxOrders)) passFilter = false;
            
            return passFilter;
        });
        
        // Sắp xếp dữ liệu
        filteredCustomersData.sort((a, b) => {
            const valA = a[sortBy] !== undefined ? a[sortBy] : 0;
            const valB = b[sortBy] !== undefined ? b[sortBy] : 0;
            
            // Xử lý sắp xếp chuỗi
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            
            // Xử lý sắp xếp số
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        });
        
        // Tính tổng số khách hàng sau khi lọc (cho phân trang)
        const total = filteredCustomersData.length;
        
        // Tính số trang
        const totalPages = Math.ceil(total / Number(perPage));
        const skip = (Number(page) - 1) * Number(perPage);
        
        // Áp dụng phân trang
        const paginatedCustomers = filteredCustomersData.slice(skip, skip + Number(perPage));
        
        // Tính toán phân phối tần suất mua hàng
        const orderCountMap = new Map();
        orders.forEach(order => {
            if (order.userId) {
                const customerId = order.userId.toString();
                if (!orderCountMap.has(customerId)) {
                    orderCountMap.set(customerId, 0);
                }
                orderCountMap.set(customerId, orderCountMap.get(customerId) + 1);
            }
        });
        
        // Tạo bảng tần suất
        const frequencyMap = new Map();
        orderCountMap.forEach(count => {
            if (!frequencyMap.has(count)) {
                frequencyMap.set(count, 0);
            }
            frequencyMap.set(count, frequencyMap.get(count) + 1);
        });
        
        // Chuyển Map thành mảng cho response
        const purchaseFrequency = Array.from(frequencyMap.entries()).map(([orderCount, customerCount]) => {
            return { _id: orderCount, customerCount };
        }).sort((a, b) => a._id - b._id);
        
        responseReturn(res, 200, {
            customerSummary: {
                total: totalCustomers,
                new: newCustomers,
                active: activeCustomerIds.size,
                percentageActive: totalCustomers > 0 ? (activeCustomerIds.size / totalCustomers) * 100 : 0
            },
            customers: {
                data: paginatedCustomers,
                pagination: {
                    totalPages,
                    total,
                    currentPage: Number(page),
                    perPage: Number(perPage)
                }
            },
            purchaseFrequency,
            timeRange: timeRangeInfo
        });
    } catch (error) {
        console.error('Get customer statistics error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

/**
 * API thống kê người bán với phân trang và bộ lọc
 * 
 * @route POST /api/get-seller-statistics
 * @access Admin
 * 
 * @param {Object} req.body - Các tham số truyền vào từ client
 * 
 * @param {Number} [req.body.page=1] - Số trang hiện tại, mặc định là 1
 * @param {Number} [req.body.perPage=10] - Số người bán hiển thị trên một trang, mặc định là 10
 * 
 * @param {String} [req.body.startDate] - Ngày bắt đầu khoảng thời gian thống kê (định dạng YYYY-MM-DD)
 * @param {String} [req.body.endDate] - Ngày kết thúc khoảng thời gian thống kê (định dạng YYYY-MM-DD)
 * 
 * @param {Number} [req.body.minRevenue] - Doanh thu tối thiểu của người bán, đơn vị VND
 * @param {Number} [req.body.maxRevenue] - Doanh thu tối đa của người bán, đơn vị VND
 * @param {Number} [req.body.minOrders] - Số lượng đơn hàng tối thiểu của người bán
 * @param {Number} [req.body.maxOrders] - Số lượng đơn hàng tối đa của người bán
 * @param {Number} [req.body.minProducts] - Số lượng sản phẩm tối thiểu của người bán đã bán ra
 * @param {Number} [req.body.maxProducts] - Số lượng sản phẩm tối đa của người bán đã bán ra
 * @param {String} [req.body.searchQuery] - Từ khóa tìm kiếm theo tên, email hoặc tên cửa hàng của người bán
 * 
 * @param {String} [req.body.sortBy='revenue'] - Trường để sắp xếp kết quả:
 *   - 'revenue': Sắp xếp theo doanh thu
 *   - 'orderCount': Sắp xếp theo số lượng đơn hàng
 *   - 'productCount': Sắp xếp theo số lượng sản phẩm bán ra
 *   - 'name': Sắp xếp theo tên người bán
 *   - 'email': Sắp xếp theo email người bán
 * 
 * @param {String} [req.body.sortOrder='desc'] - Thứ tự sắp xếp:
 *   - 'desc': Giảm dần (lớn → nhỏ) - Mặc định
 *   - 'asc': Tăng dần (nhỏ → lớn)
 * 
 * @returns {Object} Dữ liệu thống kê người bán với phân trang
 */
const get_seller_statistics = async (req, res) => {
    try {
        const { 
            // Pagination parameters
            page = 1, 
            perPage = 10, 
            
            // Time range parameters
            startDate, 
            endDate,
            
            // Revenue and order filters
            minRevenue,
            maxRevenue,
            minOrders,
            maxOrders,
            minProducts,
            maxProducts,
            
            // Search parameter
            searchQuery,
            
            // Sort parameters
            sortBy = 'revenue',
            sortOrder = 'desc'
        } = req.body;

        // Tạo query đơn giản để lấy tất cả người bán
        let query = { role: "seller" };
        
        // Thêm tìm kiếm nếu có
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        
        // Lấy danh sách người bán (chưa phân trang)
        const sellers = await userModel.find(query)
            .select('name email image createdAt');
        
        // Lấy thông tin đơn hàng để tính toán doanh thu
        let orderQuery = { payment_status: "paid" };
        
        // Thêm lọc theo thời gian nếu có
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Kiểm tra định dạng ngày hợp lệ
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                orderQuery.date = {
                    $gte: start,
                    $lte: end
                };
            }
        }
        
        const orders = await orderModel.find(orderQuery);
        const products = await productModel.find().select('sellerId');
        
        // Tạo Map để lưu thông tin về sellerId cho mỗi sản phẩm
        const productSellerMap = new Map();
        products.forEach(product => {
            if (product.sellerId) {
                productSellerMap.set(product._id.toString(), product.sellerId.toString());
            }
        });
        
        // Tạo Map để lưu thông tin doanh thu, đơn hàng và sản phẩm của từng người bán
        const sellerStatsMap = new Map();
        
        // Khởi tạo thông tin cho mỗi người bán
        sellers.forEach(seller => {
            sellerStatsMap.set(seller._id.toString(), {
                revenue: 0,
                orderCount: new Set(),
                productCount: 0
            });
        });
        
        // Tính toán doanh thu, số đơn hàng và số sản phẩm bán ra
        orders.forEach(order => {
            order.products.forEach(product => {
                const sellerId = productSellerMap.get(product.productId?.toString());
                
                // Nếu người bán tồn tại trong danh sách chúng ta đang xem
                if (sellerId && sellerStatsMap.has(sellerId)) {
                    const stats = sellerStatsMap.get(sellerId);
                    
                    // Cập nhật doanh thu
                    stats.revenue += product.subTotal;
                    
                    // Cập nhật số lượng sản phẩm
                    stats.productCount += product.quantity;
                    
                    // Thêm đơn hàng vào Set (để đếm đơn hàng duy nhất)
                    stats.orderCount.add(order._id.toString());
                }
            });
        });
        
        // Tạo mảng kết quả với thông tin đầy đủ
        let sellersData = sellers.map(seller => {
            const sellerId = seller._id.toString();
            const stats = sellerStatsMap.get(sellerId) || { revenue: 0, orderCount: new Set(), productCount: 0 };
            
            return {
                sellerId,
                name: seller.name || 'Unknown',
                email: seller.email || 'Unknown',
                image: seller.image || '',
                revenue: stats.revenue,
                orderCount: stats.orderCount.size,
                productCount: stats.productCount,
                createdAt: seller.createdAt
            };
        });
        
        // Lọc theo các tiêu chí doanh thu, đơn hàng và sản phẩm
        let filteredSellersData = sellersData.filter(seller => {
            let passFilter = true;
            
            // Lọc theo doanh thu
            if (minRevenue !== undefined && seller.revenue < Number(minRevenue)) passFilter = false;
            if (maxRevenue !== undefined && seller.revenue > Number(maxRevenue)) passFilter = false;
            
            // Lọc theo số đơn hàng
            if (minOrders !== undefined && seller.orderCount < Number(minOrders)) passFilter = false;
            if (maxOrders !== undefined && seller.orderCount > Number(maxOrders)) passFilter = false;
            
            // Lọc theo số sản phẩm
            if (minProducts !== undefined && seller.productCount < Number(minProducts)) passFilter = false;
            if (maxProducts !== undefined && seller.productCount > Number(maxProducts)) passFilter = false;
            
            return passFilter;
        });
        
        // Sắp xếp dữ liệu
        filteredSellersData.sort((a, b) => {
            const valA = a[sortBy] !== undefined ? a[sortBy] : 0;
            const valB = b[sortBy] !== undefined ? b[sortBy] : 0;
            
            // Xử lý sắp xếp chuỗi
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            
            // Xử lý sắp xếp số
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        });
        
        // Tính tổng số người bán sau khi lọc (cho phân trang)
        const total = filteredSellersData.length;
        
        // Tính số trang
        const totalPages = Math.ceil(total / Number(perPage));
        const skip = (Number(page) - 1) * Number(perPage);
        
        // Áp dụng phân trang
        const paginatedSellers = filteredSellersData.slice(skip, skip + Number(perPage));
        
        // Thêm thông tin thời gian
        let timeRange = 'all time';
        if (startDate && endDate) {
            timeRange = {
                startDate,
                endDate
            };
        }
        
        responseReturn(res, 200, {
            sellers: {
                data: paginatedSellers,
                pagination: {
                    totalPages,
                    total,
                    currentPage: Number(page),
                    perPage: Number(perPage)
                }
            },
            timeRange
        });
    } catch (error) {
        console.error('Get seller statistics error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

const get_orders = async (req, res) => {
    const { page, searchValue, parPage, orderStatus, paymentStatus, startDate, endDate } = req.query;
    try {
        let skipPage = (parseInt(page) - 1) * parseInt(parPage);
        
        // Tạo query cơ bản
        let query = {};
        
        // Thêm điều kiện tìm kiếm từ khóa nếu có
        if (searchValue) {
            query.$or = [
                { 'userId.name': { $regex: searchValue, $options: 'i' } },
                { 'userId.email': { $regex: searchValue, $options: 'i' } }
            ];
        }
        
        // Thêm lọc theo trạng thái đơn hàng nếu có
        if (orderStatus) {
            query.delivery_status = orderStatus;
        }
        
        // Thêm lọc theo trạng thái thanh toán nếu có
        if (paymentStatus) {
            query.payment_status = paymentStatus;
        }
        
        // Thêm lọc theo khoảng thời gian nếu có
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        // Đếm tổng số đơn hàng theo điều kiện lọc
        const totalOrder = await orderModel.countDocuments(query);
        
        // Lấy dữ liệu đơn hàng với populate thông tin người dùng
        const orders = await orderModel.find(query)
            .populate('userId', 'name email image')
            .skip(skipPage)
            .limit(parseInt(parPage))
            .sort({ createdAt: -1 });
        
        // Trả về kết quả với pagination
        return responseReturn(res, 200, { orders, totalOrder });
    } catch (error) {
        console.error('Error in get_orders:', error);
        return responseReturn(res, 500, { error: 'Internal server error' });
    }
};

// Get monthly chart data for admin dashboard
const get_admin_chart_data = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize arrays for chart data
        const monthlyOrders = Array(12).fill(0);
        const monthlyRevenue = Array(12).fill(0);
        const monthlySellers = Array(12).fill(0);
        
        // Calculate monthly orders and revenue
        const orders = await orderModel.find({
            createdAt: {
                $gte: new Date(`${currentYear}-01-01`),
                $lte: new Date(`${currentYear}-12-31`)
            }
        });
        
        orders.forEach(order => {
            const month = order.createdAt.getMonth();
            monthlyOrders[month]++;
            
            if (order.payment_status === 'paid') {
                monthlyRevenue[month] += order.totalPrice;
            }
        });
        
        // Calculate monthly new sellers
        const sellers = await userModel.find({
            role: 'seller',
            createdAt: {
                $gte: new Date(`${currentYear}-01-01`),
                $lte: new Date(`${currentYear}-12-31`) 
            }
        });
        
        sellers.forEach(seller => {
            const month = seller.createdAt.getMonth();
            monthlySellers[month]++;
        });
        
        responseReturn(res, 200, {
            labels: months,
            orders: monthlyOrders,
            revenue: monthlyRevenue,
            sellers: monthlySellers
        });
    } catch (error) {
        console.error('Get admin chart data error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Get order details for admin
const get_admin_order_details = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        if (!orderId) {
            return responseReturn(res, 400, { error: "Order ID is required" });
        }
        
        // Tìm đơn hàng và populate thông tin người dùng và sản phẩm
        const order = await orderModel.findById(orderId)
            .populate('userId', 'name email image')
            .lean();
            
        if (!order) {
            return responseReturn(res, 404, { error: "Order not found" });
        }
        
        // Lấy thông tin chi tiết về các sản phẩm trong đơn hàng
        const enhancedProducts = [];
        
        for (const product of order.products) {
            const productInfo = await productModel.findById(product.productId)
                .select('name slug price discount brand category categoryId images stock description sellerId')
                .populate('categoryId', 'name')
                .populate('sellerId', 'name email shopInfo')
                .lean();
                
            if (productInfo) {
                enhancedProducts.push({
                    ...product,
                    productInfo
                });
            } else {
                enhancedProducts.push({
                    ...product,
                    productInfo: { name: "Sản phẩm không còn tồn tại", images: [] }
                });
            }
        }
        
        // Thay thế mảng sản phẩm ban đầu bằng mảng đã được bổ sung thông tin
        order.products = enhancedProducts;
        
        responseReturn(res, 200, { order });
    } catch (error) {
        console.error('Get admin order details error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

const admin_order_status_update = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        if (!orderId) {
            return responseReturn(res, 400, { message: 'Order ID is required' });
        }
        
        if (!status || !['pending', 'shipping', 'delivered', 'cancelled'].includes(status)) {
            return responseReturn(res, 400, { message: 'Invalid delivery status' });
        }
        
        const orderModel = require('../../models/orderModel');
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return responseReturn(res, 404, { message: 'Order not found' });
        }
        
        order.delivery_status = status;
        await order.save();
        
        // Trả về cả order đã cập nhật và message để client có thể cập nhật UI
        responseReturn(res, 200, { 
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        responseReturn(res, 500, { message: error.message });
    }
}

// API lấy tất cả danh mục sản phẩm
const get_all_categories = async (req, res) => {
    try {
        const categorys = await categoryModel.find().sort({ createdAt: -1 });
        const totalCategory = await categoryModel.countDocuments();
        
        responseReturn(res, 200, {
            categorys,
            totalCategory,
            pages: 1
        });
    } catch (error) {
        console.error("Error fetching all categories:", error);
        responseReturn(res, 500, { error: "Failed to fetch categories" });
    }
};

module.exports = {
    get_revenue,
    get_dashboard_summary,
    get_customer_statistics,
    get_seller_statistics,
    get_orders,
    get_admin_chart_data,
    get_admin_order_details,
    admin_order_status_update,
    get_all_categories
}; 