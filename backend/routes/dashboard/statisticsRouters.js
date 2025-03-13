const router = require('express').Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { 
    get_revenue,
    get_orders,
    get_dashboard_summary,
    get_customer_statistics,
    get_seller_statistics
} = require('../../controllers/dashboard/statisticsController');

// Routes for admin
router.get('/get-dashboard-summary', adminMiddleware, get_dashboard_summary);

// Revenue statistics routes
router.post('/get-revenue', adminMiddleware, get_revenue);

// Customer and seller statistics routes
router.post('/get-customer-statistics', adminMiddleware, get_customer_statistics);
router.post('/get-seller-statistics', adminMiddleware, get_seller_statistics);

module.exports = router; 