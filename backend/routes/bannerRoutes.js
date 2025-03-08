const express = require('express');
const router = express.Router();
const { add_banner, get_banners, get_banner, update_banner, delete_banner } = require('../controllers/bannerController');

router.post('/banner', add_banner);
router.get('/banner', get_banners);
router.get('/banner/:id', get_banner);
router.put('/banner/:id', update_banner);
router.delete('/banner/:id', delete_banner);

module.exports = router;
    