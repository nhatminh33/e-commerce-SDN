const router = require('express').Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { create_salary, get_salaries, get_salary, update_salary, delete_salary, get_salary_summary, get_seller_salary } = require('../../controllers/dashboard/salaryController');
const sellerMiddleware = require('../../middlewares/sellerMiddleware');

// Routes dành cho admin
router.post('/create-salary', adminMiddleware, create_salary);
router.post('/get-salaries', adminMiddleware, get_salaries);
router.get('/get-salary/:id', adminMiddleware, get_salary);
router.put('/update-salary/:id', adminMiddleware, update_salary);
router.delete('/delete-salary/:id', adminMiddleware, delete_salary);
router.post('/get-salary-summary', adminMiddleware, get_salary_summary);

// Route cho seller có thể xem lương của chính mình
router.post('/get-seller-salary', sellerMiddleware, get_seller_salary);

module.exports = router; 