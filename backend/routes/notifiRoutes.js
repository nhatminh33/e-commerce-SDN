const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notifiController");

// Create notification (Admin to Seller)
router.post("/notify/create", notificationController.createNotification);

// Get notifications for a seller
router.get("/notify/:sellerId", notificationController.getNotifications);

// Mark notification as read
router.put("/notify/:id", notificationController.markAsRead);

// Delete a notification
router.delete("/notify/:id", notificationController.deleteNotification);

module.exports = router;
