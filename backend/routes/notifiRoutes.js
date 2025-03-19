const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notifiController");
const systemMiddleware = require("../middlewares/systemMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")
const sellerMiddleware = require("../middlewares/sellerMiddleware")
const authenticateToken = require("../middlewares/authenticateToken")

router.post("/notify/create", systemMiddleware, notificationController.createNotification);
router.get("/notify", authenticateToken, notificationController.getNotifications);
router.get("/notify/all", adminMiddleware, notificationController.getAllNotifications); 
router.get("/notify/sellers", authenticateToken, notificationController.getAllSellers);
router.put("/notify/view/:id", authenticateToken, notificationController.markAsRead);            
router.delete("/notify/delete/:id", authenticateToken, notificationController.deleteNotification);
router.put("/notify/update/:id", adminMiddleware, notificationController.updateNotification);

module.exports = router;
