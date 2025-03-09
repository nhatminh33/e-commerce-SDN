const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');

router.get('/comments/getCmt/:productId', controller.getComments)
router.post('/comments/createCmt', controller.postComment)
router.put('/comments/editCmt/:commentId',controller.editComment)
router.delete('/comments/deleteCmt/:id', controller.deleteComment)



module.exports = router;