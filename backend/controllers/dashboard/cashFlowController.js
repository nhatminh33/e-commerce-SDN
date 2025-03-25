const orderModel = require('../../models/orderModel');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');
const userModel = require('../../models/userModel');
const { formatAmountDecimal } = require('../../utils/formatValues');
const { calculateDaysInRange, createDateRangeArray } = require('../../utils/dateUtils');

/**
 * Get cash flow overview for a given time period
 * @route GET /api/dashboard/cash-flow/overview
 * @access Admin
 */
exports.getCashFlowOverview = async (req, res) => {
    try {
        const { startDate, endDate, period = 'daily' } = req.query;
        
        // Validate date inputs
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        
        // Set end time to end of day
        end.setHours(23, 59, 59, 999);
        
        if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }
        
        // Query parameters for orders within date range
        const orderQuery = {
            createdAt: { $gte: start, $lte: end },
            payment_status: 'paid'
        };
        
        // Fetch orders
        const orders = await orderModel.find(orderQuery)
            .select('products totalPrice createdAt')
            .populate({
                path: 'products.productId',
                select: 'name price costPrice'
            });
        
        // Calculate revenue, cost and profit
        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;
        
        // Time series data for chart
        let timeSeriesData = [];
        
        if (period === 'daily') {
            timeSeriesData = await getDailyData(start, end, orders);
        } else if (period === 'monthly') {
            timeSeriesData = await getMonthlyData(start, end, orders);
        } else if (period === 'yearly') {
            timeSeriesData = await getYearlyData(start, end, orders);
        }
        
        // Calculate totals
        orders.forEach(order => {
            const orderRevenue = order.totalPrice;
            totalRevenue += orderRevenue;
            
            // Calculate cost based on products' cost price
            let orderCost = 0;
            order.products.forEach(item => {
                if (item.productId && item.productId.costPrice) {
                    orderCost += item.productId.costPrice * item.quantity;
                }
            });
            
            totalCost += orderCost;
            totalProfit += (orderRevenue - orderCost);
        });
        
        // Format values
        totalRevenue = formatAmountDecimal(totalRevenue);
        totalCost = formatAmountDecimal(totalCost);
        totalProfit = formatAmountDecimal(totalProfit);
        
        // Calculate profit margin
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        
        // Response data
        const responseData = {
            summary: {
                totalRevenue,
                totalCost,
                totalProfit,
                profitMargin: parseFloat(profitMargin.toFixed(2)),
                orderCount: orders.length
            },
            timeSeriesData
        };
        
        return res.status(200).json(responseData);
        
    } catch (error) {
        console.error('Error in getCashFlowOverview:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get detailed revenue report
 * @route GET /api/dashboard/cash-flow/revenue
 * @access Admin
 */
exports.getRevenueDetails = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'date' } = req.query;
        
        // Validate date inputs
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        
        // Set end time to end of day
        end.setHours(23, 59, 59, 999);
        
        if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }
        
        // Query parameters for orders within date range
        const orderQuery = {
            createdAt: { $gte: start, $lte: end },
            payment_status: 'paid'
        };
        
        // Fetch orders
        const orders = await orderModel.find(orderQuery)
            .select('products totalPrice createdAt')
            .populate({
                path: 'products.productId',
                select: 'name price costPrice categoryId sellerId',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'sellerId', select: 'name' }
                ]
            });
        
        // Process data based on grouping parameter
        let revenueData = [];
        
        if (groupBy === 'date') {
            // Nhóm doanh thu theo ngày
            const dateMap = new Map();
            
            orders.forEach(order => {
                const orderDate = new Date(order.createdAt);
                const dateStr = orderDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
                
                if (dateMap.has(dateStr)) {
                    const dateData = dateMap.get(dateStr);
                    dateData.revenue += order.totalPrice;
                    dateData.orderCount += 1;
                } else {
                    dateMap.set(dateStr, {
                        date: dateStr,
                        revenue: order.totalPrice,
                        orderCount: 1
                    });
                }
            });
            
            // Chuyển đổi Map thành mảng và định dạng giá trị
            revenueData = Array.from(dateMap.values()).map(item => ({
                date: item.date,
                revenue: formatAmountDecimal(item.revenue),
                orderCount: item.orderCount
            }));
            
            // Sắp xếp theo ngày (mới nhất trước)
            revenueData.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (groupBy === 'product') {
            revenueData = await groupRevenueByProduct(orders);
        } else if (groupBy === 'category') {
            revenueData = await groupRevenueByCategory(orders);
        } else if (groupBy === 'seller') {
            revenueData = await groupRevenueBySeller(orders);
        }
        
        const totalRevenue = formatAmountDecimal(
            orders.reduce((sum, order) => sum + order.totalPrice, 0)
        );
        
        return res.status(200).json({
            totalRevenue,
            revenueData
        });
        
    } catch (error) {
        console.error('Error in getRevenueDetails:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get detailed cost report
 * @route GET /api/dashboard/cash-flow/cost
 * @access Admin
 */
exports.getCostDetails = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'product' } = req.query;
        
        // Validate date inputs
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        
        // Set end time to end of day
        end.setHours(23, 59, 59, 999);
        
        if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }
        
        // Query parameters for orders within date range
        const orderQuery = {
            createdAt: { $gte: start, $lte: end },
            payment_status: 'paid'
        };
        
        // Fetch orders
        const orders = await orderModel.find(orderQuery)
            .select('products createdAt')
            .populate({
                path: 'products.productId',
                select: 'name costPrice categoryId sellerId',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'sellerId', select: 'name' }
                ]
            });
        
        // Process data based on grouping parameter
        let costData = [];
        
        if (groupBy === 'product') {
            // Đảm bảo costData có cấu trúc đúng cho frontend
            const productMap = new Map();
            
            orders.forEach(order => {
                order.products.forEach(item => {
                    if (item.productId && item.productId.costPrice) {
                        const productId = item.productId._id.toString();
                        const cost = item.quantity * item.productId.costPrice;
                        
                        if (productMap.has(productId)) {
                            const product = productMap.get(productId);
                            product.cost += cost;
                            product.quantity += item.quantity;
                        } else {
                            productMap.set(productId, {
                                id: productId,
                                name: item.productId.name,
                                cost,
                                quantity: item.quantity
                            });
                        }
                    }
                });
            });
            
            // Chuyển đổi Map thành mảng và định dạng giá trị
            costData = Array.from(productMap.values()).map(product => ({
                id: product.id,
                name: product.name,
                cost: formatAmountDecimal(product.cost),
                quantity: product.quantity
            }));
            
            // Sắp xếp theo chi phí (cao nhất trước)
            costData.sort((a, b) => parseFloat(b.cost) - parseFloat(a.cost));
        } else if (groupBy === 'category') {
            costData = await groupCostByCategory(orders);
        } else if (groupBy === 'seller') {
            costData = await groupCostBySeller(orders);
        }
        
        // Calculate total cost
        let totalCost = 0;
        orders.forEach(order => {
            order.products.forEach(item => {
                if (item.productId && item.productId.costPrice) {
                    totalCost += item.productId.costPrice * item.quantity;
                }
            });
        });
        
        return res.status(200).json({
            totalCost: formatAmountDecimal(totalCost),
            costData
        });
        
    } catch (error) {
        console.error('Error in getCostDetails:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get detailed profit report
 * @route GET /api/dashboard/cash-flow/profit
 * @access Admin
 */
exports.getProfitDetails = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'product', sortBy = 'profit', order = 'desc' } = req.query;
        
        // Validate date inputs
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        
        // Set end time to end of day
        end.setHours(23, 59, 59, 999);
        
        if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }
        
        // Query parameters for orders within date range
        const orderQuery = {
            createdAt: { $gte: start, $lte: end },
            payment_status: 'paid'
        };
        
        // Fetch orders
        const orders = await orderModel.find(orderQuery)
            .select('products totalPrice createdAt')
            .populate({
                path: 'products.productId',
                select: 'name price costPrice categoryId sellerId',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'sellerId', select: 'name' }
                ]
            });
        
        // Process data based on grouping parameter
        let profitData = [];
        
        if (groupBy === 'product') {
            profitData = await groupProfitByProduct(orders);
        } else if (groupBy === 'category') {
            profitData = await groupProfitByCategory(orders);
        } else if (groupBy === 'seller') {
            profitData = await groupProfitBySeller(orders);
        }
        
        // Sort data based on sortBy and order parameters
        profitData = sortProfitData(profitData, sortBy, order);
        
        // Calculate totals
        let totalRevenue = 0;
        let totalCost = 0;
        
        orders.forEach(order => {
            totalRevenue += order.totalPrice;
            
            order.products.forEach(item => {
                if (item.productId && item.productId.costPrice) {
                    totalCost += item.productId.costPrice * item.quantity;
                }
            });
        });
        
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        
        return res.status(200).json({
            summary: {
                totalRevenue: formatAmountDecimal(totalRevenue),
                totalCost: formatAmountDecimal(totalCost),
                totalProfit: formatAmountDecimal(totalProfit),
                profitMargin: parseFloat(profitMargin.toFixed(2))
            },
            groupBy,
            profitData
        });
        
    } catch (error) {
        console.error('Error in getProfitDetails:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Update product cost price
 * @route PUT /api/dashboard/cash-flow/product/:productId/cost
 * @access Admin
 */
exports.updateProductCostPrice = async (req, res) => {
    try {
        const { productId } = req.params;
        const { costPrice } = req.body;
        
        // Validate inputs
        if (!costPrice || isNaN(costPrice) || costPrice < 0) {
            return res.status(400).json({ error: 'Valid cost price is required' });
        }
        
        // Find product
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Update cost price
        product.costPrice = costPrice;
        await product.save();
        
        // Calculate profit and margin
        const sellingPrice = product.price * (1 - (product.discount / 100));
        const profit = sellingPrice - costPrice;
        const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
        
        return res.status(200).json({
            message: 'Product cost price updated successfully',
            product: {
                id: product._id,
                name: product.name,
                costPrice: product.costPrice,
                sellingPrice: formatAmountDecimal(sellingPrice),
                profit: formatAmountDecimal(profit),
                margin: parseFloat(margin.toFixed(2))
            }
        });
        
    } catch (error) {
        console.error('Error in updateProductCostPrice:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper functions

/**
 * Get daily data for cash flow chart
 */
const getDailyData = async (startDate, endDate, orders) => {
    const daysInRange = calculateDaysInRange(startDate, endDate);
    const dateArray = createDateRangeArray(startDate, daysInRange);
    
    // Initialize data array with zeros
    const dailyData = dateArray.map(date => ({
        date,
        revenue: 0,
        cost: 0,
        profit: 0
    }));
    
    // Populate data
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        const dataPoint = dailyData.find(item => item.date === orderDate);
        
        if (dataPoint) {
            dataPoint.revenue += order.totalPrice;
            
            let orderCost = 0;
            order.products.forEach(item => {
                if (item.productId && item.productId.costPrice) {
                    orderCost += item.productId.costPrice * item.quantity;
                }
            });
            
            dataPoint.cost += orderCost;
            dataPoint.profit = dataPoint.revenue - dataPoint.cost;
        }
    });
    
    // Format values
    dailyData.forEach(item => {
        item.revenue = formatAmountDecimal(item.revenue);
        item.cost = formatAmountDecimal(item.cost);
        item.profit = formatAmountDecimal(item.profit);
    });
    
    return dailyData;
};

/**
 * Get monthly data for cash flow chart
 */
const getMonthlyData = async (startDate, endDate, orders) => {
    // Create an array of month strings (YYYY-MM)
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    
    const monthlyData = [];
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    while (
        currentYear < endYear || 
        (currentYear === endYear && currentMonth <= endMonth)
    ) {
        const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        monthlyData.push({
            date: monthStr,
            revenue: 0,
            cost: 0,
            profit: 0
        });
        
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }
    
    // Populate data
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const orderMonthStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        const dataPoint = monthlyData.find(item => item.date === orderMonthStr);
        
        if (dataPoint) {
            dataPoint.revenue += order.totalPrice;
            
            let orderCost = 0;
            order.products.forEach(item => {
                if (item.productId && item.productId.costPrice) {
                    orderCost += item.productId.costPrice * item.quantity;
                }
            });
            
            dataPoint.cost += orderCost;
            dataPoint.profit = dataPoint.revenue - dataPoint.cost;
        }
    });
    
    // Format values
    monthlyData.forEach(item => {
        item.revenue = formatAmountDecimal(item.revenue);
        item.cost = formatAmountDecimal(item.cost);
        item.profit = formatAmountDecimal(item.profit);
    });
    
    return monthlyData;
};

/**
 * Get yearly data for cash flow chart
 */
const getYearlyData = async (startDate, endDate, orders) => {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    const yearlyData = [];
    for (let year = startYear; year <= endYear; year++) {
        yearlyData.push({
            date: year.toString(),
            revenue: 0,
            cost: 0,
            profit: 0
        });
    }
    
    // Populate data
    orders.forEach(order => {
        const orderYear = new Date(order.createdAt).getFullYear().toString();
        const dataPoint = yearlyData.find(item => item.date === orderYear);
        
        if (dataPoint) {
            dataPoint.revenue += order.totalPrice;
            
            let orderCost = 0;
            order.products.forEach(item => {
                if (item.productId && item.productId.costPrice) {
                    orderCost += item.productId.costPrice * item.quantity;
                }
            });
            
            dataPoint.cost += orderCost;
            dataPoint.profit = dataPoint.revenue - dataPoint.cost;
        }
    });
    
    // Format values
    yearlyData.forEach(item => {
        item.revenue = formatAmountDecimal(item.revenue);
        item.cost = formatAmountDecimal(item.cost);
        item.profit = formatAmountDecimal(item.profit);
    });
    
    return yearlyData;
};

/**
 * Group revenue data by product
 */
const groupRevenueByProduct = async (orders) => {
    const productMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId) {
                const productId = item.productId._id.toString();
                const revenue = item.quantity * (item.productId.price * (1 - (item.discount || 0) / 100));
                
                if (productMap.has(productId)) {
                    const product = productMap.get(productId);
                    product.revenue += revenue;
                    product.quantity += item.quantity;
                } else {
                    productMap.set(productId, {
                        id: productId,
                        name: item.productId.name,
                        category: item.productId.categoryId ? item.productId.categoryId.name : 'Unknown',
                        seller: item.productId.sellerId ? item.productId.sellerId.name : 'Unknown',
                        revenue,
                        quantity: item.quantity
                    });
                }
            }
        });
    });
    
    // Convert map to array and format values
    const revenueData = Array.from(productMap.values()).map(product => ({
        ...product,
        revenue: formatAmountDecimal(product.revenue)
    }));
    
    // Sort by revenue (highest first)
    return revenueData.sort((a, b) => b.revenue - a.revenue);
};

/**
 * Group revenue data by category
 */
const groupRevenueByCategory = async (orders) => {
    const categoryMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId && item.productId.categoryId) {
                const categoryId = item.productId.categoryId._id.toString();
                const categoryName = item.productId.categoryId.name;
                const revenue = item.quantity * (item.productId.price * (1 - (item.discount || 0) / 100));
                
                if (categoryMap.has(categoryId)) {
                    const category = categoryMap.get(categoryId);
                    category.revenue += revenue;
                    category.productCount = category.products.has(item.productId._id.toString()) 
                        ? category.productCount 
                        : category.productCount + 1;
                    category.products.add(item.productId._id.toString());
                } else {
                    const products = new Set([item.productId._id.toString()]);
                    categoryMap.set(categoryId, {
                        id: categoryId,
                        name: categoryName,
                        revenue,
                        productCount: 1,
                        products
                    });
                }
            }
        });
    });
    
    // Convert map to array and format values
    const revenueData = Array.from(categoryMap.values()).map(category => ({
        id: category.id,
        name: category.name,
        revenue: formatAmountDecimal(category.revenue),
        productCount: category.productCount
    }));
    
    // Sort by revenue (highest first)
    return revenueData.sort((a, b) => b.revenue - a.revenue);
};

/**
 * Group revenue data by seller
 */
const groupRevenueBySeller = async (orders) => {
    const sellerMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId && item.productId.sellerId) {
                const sellerId = item.productId.sellerId._id.toString();
                const sellerName = item.productId.sellerId.name;
                const revenue = item.quantity * (item.productId.price * (1 - (item.discount || 0) / 100));
                
                if (sellerMap.has(sellerId)) {
                    const seller = sellerMap.get(sellerId);
                    seller.revenue += revenue;
                    seller.productCount = seller.products.has(item.productId._id.toString()) 
                        ? seller.productCount 
                        : seller.productCount + 1;
                    seller.products.add(item.productId._id.toString());
                } else {
                    const products = new Set([item.productId._id.toString()]);
                    sellerMap.set(sellerId, {
                        id: sellerId,
                        name: sellerName,
                        revenue,
                        productCount: 1,
                        products
                    });
                }
            }
        });
    });
    
    // Convert map to array and format values
    const revenueData = Array.from(sellerMap.values()).map(seller => ({
        id: seller.id,
        name: seller.name,
        revenue: formatAmountDecimal(seller.revenue),
        productCount: seller.productCount
    }));
    
    // Sort by revenue (highest first)
    return revenueData.sort((a, b) => b.revenue - a.revenue);
};

/**
 * Group cost data by product
 */
const groupCostByProduct = async (orders) => {
    const productMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId && item.productId.costPrice) {
                const productId = item.productId._id.toString();
                const cost = item.quantity * item.productId.costPrice;
                
                if (productMap.has(productId)) {
                    const product = productMap.get(productId);
                    product.cost += cost;
                    product.quantity += item.quantity;
                } else {
                    productMap.set(productId, {
                        id: productId,
                        name: item.productId.name,
                        category: item.productId.categoryId ? item.productId.categoryId.name : 'Unknown',
                        seller: item.productId.sellerId ? item.productId.sellerId.name : 'Unknown',
                        cost,
                        quantity: item.quantity
                    });
                }
            }
        });
    });
    
    // Convert map to array and format values
    const costData = Array.from(productMap.values()).map(product => ({
        ...product,
        cost: formatAmountDecimal(product.cost)
    }));
    
    // Sort by cost (highest first)
    return costData.sort((a, b) => b.cost - a.cost);
};

/**
 * Group cost data by category
 */
const groupCostByCategory = async (orders) => {
    const categoryMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId && item.productId.costPrice && item.productId.categoryId) {
                const categoryId = item.productId.categoryId._id.toString();
                const categoryName = item.productId.categoryId.name;
                const cost = item.quantity * item.productId.costPrice;
                
                if (categoryMap.has(categoryId)) {
                    const category = categoryMap.get(categoryId);
                    category.cost += cost;
                    category.productCount = category.products.has(item.productId._id.toString()) 
                        ? category.productCount 
                        : category.productCount + 1;
                    category.products.add(item.productId._id.toString());
                } else {
                    const products = new Set([item.productId._id.toString()]);
                    categoryMap.set(categoryId, {
                        id: categoryId,
                        name: categoryName,
                        cost,
                        productCount: 1,
                        products
                    });
                }
            }
        });
    });
    
    // Convert map to array and format values
    const costData = Array.from(categoryMap.values()).map(category => ({
        id: category.id,
        name: category.name,
        cost: formatAmountDecimal(category.cost),
        productCount: category.productCount
    }));
    
    // Sort by cost (highest first)
    return costData.sort((a, b) => b.cost - a.cost);
};

/**
 * Group cost data by seller
 */
const groupCostBySeller = async (orders) => {
    const sellerMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId && item.productId.costPrice && item.productId.sellerId) {
                const sellerId = item.productId.sellerId._id.toString();
                const sellerName = item.productId.sellerId.name;
                const cost = item.quantity * item.productId.costPrice;
                
                if (sellerMap.has(sellerId)) {
                    const seller = sellerMap.get(sellerId);
                    seller.cost += cost;
                    seller.productCount = seller.products.has(item.productId._id.toString()) 
                        ? seller.productCount 
                        : seller.productCount + 1;
                    seller.products.add(item.productId._id.toString());
                } else {
                    const products = new Set([item.productId._id.toString()]);
                    sellerMap.set(sellerId, {
                        id: sellerId,
                        name: sellerName,
                        cost,
                        productCount: 1,
                        products
                    });
                }
            }
        });
    });
    
    // Convert map to array and format values
    const costData = Array.from(sellerMap.values()).map(seller => ({
        id: seller.id,
        name: seller.name,
        cost: formatAmountDecimal(seller.cost),
        productCount: seller.productCount
    }));
    
    // Sort by cost (highest first)
    return costData.sort((a, b) => b.cost - a.cost);
};

/**
 * Group profit data by product
 */
const groupProfitByProduct = async (orders) => {
    const productMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId) {
                const productId = item.productId._id.toString();
                const revenue = item.quantity * (item.productId.price * (1 - (item.discount || 0) / 100));
                const cost = item.productId.costPrice ? item.quantity * item.productId.costPrice : 0;
                const profit = revenue - cost;
                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                
                if (productMap.has(productId)) {
                    const product = productMap.get(productId);
                    product.revenue += revenue;
                    product.cost += cost;
                    product.profit += profit;
                    product.quantity += item.quantity;
                } else {
                    productMap.set(productId, {
                        id: productId,
                        name: item.productId.name,
                        category: item.productId.categoryId ? item.productId.categoryId.name : 'Unknown',
                        seller: item.productId.sellerId ? item.productId.sellerId.name : 'Unknown',
                        revenue,
                        cost,
                        profit,
                        margin,
                        quantity: item.quantity
                    });
                }
            }
        });
    });
    
    // Convert map to array and recalculate margins
    const profitData = Array.from(productMap.values()).map(product => {
        const margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
        return {
            ...product,
            revenue: formatAmountDecimal(product.revenue),
            cost: formatAmountDecimal(product.cost),
            profit: formatAmountDecimal(product.profit),
            margin: parseFloat(margin.toFixed(2))
        };
    });
    
    return profitData;
};

/**
 * Group profit data by category
 */
const groupProfitByCategory = async (orders) => {
    const categoryMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId && item.productId.categoryId) {
                const categoryId = item.productId.categoryId._id.toString();
                const categoryName = item.productId.categoryId.name;
                const revenue = item.quantity * (item.productId.price * (1 - (item.discount || 0) / 100));
                const cost = item.productId.costPrice ? item.quantity * item.productId.costPrice : 0;
                const profit = revenue - cost;
                
                if (categoryMap.has(categoryId)) {
                    const category = categoryMap.get(categoryId);
                    category.revenue += revenue;
                    category.cost += cost;
                    category.profit += profit;
                    category.productCount = category.products.has(item.productId._id.toString()) 
                        ? category.productCount 
                        : category.productCount + 1;
                    category.products.add(item.productId._id.toString());
                } else {
                    const products = new Set([item.productId._id.toString()]);
                    categoryMap.set(categoryId, {
                        id: categoryId,
                        name: categoryName,
                        revenue,
                        cost,
                        profit,
                        productCount: 1,
                        products
                    });
                }
            }
        });
    });
    
    // Convert map to array and calculate margins
    const profitData = Array.from(categoryMap.values()).map(category => {
        const margin = category.revenue > 0 ? (category.profit / category.revenue) * 100 : 0;
        return {
            id: category.id,
            name: category.name,
            revenue: formatAmountDecimal(category.revenue),
            cost: formatAmountDecimal(category.cost),
            profit: formatAmountDecimal(category.profit),
            margin: parseFloat(margin.toFixed(2)),
            productCount: category.productCount
        };
    });
    
    return profitData;
};

/**
 * Group profit data by seller
 */
const groupProfitBySeller = async (orders) => {
    const sellerMap = new Map();
    
    orders.forEach(order => {
        order.products.forEach(item => {
            if (item.productId && item.productId.sellerId) {
                const sellerId = item.productId.sellerId._id.toString();
                const sellerName = item.productId.sellerId.name;
                const revenue = item.quantity * (item.productId.price * (1 - (item.discount || 0) / 100));
                const cost = item.productId.costPrice ? item.quantity * item.productId.costPrice : 0;
                const profit = revenue - cost;
                
                if (sellerMap.has(sellerId)) {
                    const seller = sellerMap.get(sellerId);
                    seller.revenue += revenue;
                    seller.cost += cost;
                    seller.profit += profit;
                    seller.productCount = seller.products.has(item.productId._id.toString()) 
                        ? seller.productCount 
                        : seller.productCount + 1;
                    seller.products.add(item.productId._id.toString());
                } else {
                    const products = new Set([item.productId._id.toString()]);
                    sellerMap.set(sellerId, {
                        id: sellerId,
                        name: sellerName,
                        revenue,
                        cost,
                        profit,
                        productCount: 1,
                        products
                    });
                }
            }
        });
    });
    
    // Convert map to array and calculate margins
    const profitData = Array.from(sellerMap.values()).map(seller => {
        const margin = seller.revenue > 0 ? (seller.profit / seller.revenue) * 100 : 0;
        return {
            id: seller.id,
            name: seller.name,
            revenue: formatAmountDecimal(seller.revenue),
            cost: formatAmountDecimal(seller.cost),
            profit: formatAmountDecimal(seller.profit),
            margin: parseFloat(margin.toFixed(2)),
            productCount: seller.productCount
        };
    });
    
    return profitData;
};

/**
 * Sort profit data based on specified field and order
 */
const sortProfitData = (data, sortBy, order) => {
    const sortField = ['revenue', 'cost', 'profit', 'margin'].includes(sortBy) ? sortBy : 'profit';
    const sortOrder = order === 'asc' ? 1 : -1;
    
    return data.sort((a, b) => {
        const aValue = typeof a[sortField] === 'string' ? parseFloat(a[sortField]) : a[sortField];
        const bValue = typeof b[sortField] === 'string' ? parseFloat(b[sortField]) : b[sortField];
        return sortOrder * (aValue - bValue);
    });
}; 