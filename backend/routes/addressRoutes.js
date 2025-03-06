const router = require('express').Router();
const {
    get_addresses,
    add_address,
    update_address,
    delete_address,
    set_default_address
} = require('../controllers/addressController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/get-all', get_addresses);
router.post('/add', add_address);
router.put('/update/:addressId', update_address);
router.delete('/delete/:addressId', delete_address);
router.put('/set-default/:addressId', set_default_address);

module.exports = router; 