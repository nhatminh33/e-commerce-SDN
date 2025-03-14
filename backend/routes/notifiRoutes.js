const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notifiController");
const systemMiddleware = require("../middlewares/systemMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")
const sellerMiddleware = require("../middlewares/sellerMiddleware")
const authenticateToken = require("../middlewares/authenticateToken")

router.post("/notify/create", systemMiddleware, notificationController.createNotification);
router.get("/notify/:sellerId", sellerMiddleware, notificationController.getNotifications); 
router.put("/notify/:id", authenticateToken, notificationController.markAsRead);            
router.delete("/notify/:id", adminMiddleware, notificationController.deleteNotification);

module.exports = router;
