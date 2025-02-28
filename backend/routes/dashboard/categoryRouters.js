const router = require('express').Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { add_category,update_category, get_categories, get_category, delete_category } = require('../../controllers/dashboard/categoryController');
const systemMiddleware = require('../../middlewares/adminMiddleware');

router.post('/add-category', adminMiddleware, add_category)
router.post('/update-category/:id', adminMiddleware, update_category)
router.get('/get-categories', systemMiddleware, get_categories)
router.get('/get-category/:id', systemMiddleware, get_category)
router.delete('/delete-category/:id', adminMiddleware, delete_category)

module.exports = router;