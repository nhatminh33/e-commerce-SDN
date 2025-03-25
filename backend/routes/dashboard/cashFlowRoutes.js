const router = require('express').Router();
const cashFlowController = require('../../controllers/dashboard/cashFlowController');
const adminMiddleware = require('../../middlewares/adminMiddleware');
const authenticateToken = require('../../middlewares/authenticateToken');

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(adminMiddleware);

// Cash flow overview
router.get('/overview', cashFlowController.getCashFlowOverview);

// Revenue details
router.get('/revenue', cashFlowController.getRevenueDetails);

// Cost details
router.get('/cost', cashFlowController.getCostDetails);

// Profit details
router.get('/profit', cashFlowController.getProfitDetails);

// Update product cost price
router.put('/product/:productId/cost', cashFlowController.updateProductCostPrice);

module.exports = router; 