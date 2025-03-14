const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notifiController");

// Create notification (Admin to Seller)
router.post("/notify/create", notificationController.createNotification);

// Get notifications for a seller
router.get("/notify", notificationController.getNotifications);

// Mark notification as read
router.put("/notify/read/:id", notificationController.markAsRead);

// Delete a notification
router.delete("/notify/delete/:id", notificationController.deleteNotification);

module.exports = router;
