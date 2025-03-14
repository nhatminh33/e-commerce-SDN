const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/comments/getCmt", authenticateToken, controller.getComments);
router.post("/comments/createCmt", authenticateToken, controller.postComment);
router.put("/comments/editCmt/:commentId", authenticateToken, controller.editComment);
router.delete("/comments/deleteCmt/:id", authenticateToken, controller.deleteComment);



module.exports = router;