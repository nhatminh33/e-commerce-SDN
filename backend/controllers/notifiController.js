const Notification = require("../models/adminNotification");
const User = require("../models/userModel");

module.exports.createNotification = async (req, res) => {
    try {
        // Instead of taking sender from req.body, use req.id (the logged-in user's id)
        const { receiver, message } = req.body;
        const sender = req.id; 

        if (!receiver || receiver === "all") {
            // Send to all sellers
            const sellers = await User.find({ role: "seller" }).select("_id");
            const notifications = sellers.map(seller => ({ sender, receiver: seller._id, message }));
            await Notification.insertMany(notifications);
            return res.json({ message: "Notification sent to all sellers" });
        }

        const notification = await new Notification({ sender, receiver, message }).save();
        res.json({ sender: notification.sender, receiver: notification.receiver, message: notification.message, read: notification.read });
    } catch (error) {
        res.json({ message: "Error creating notification" });
    }
};

// [GET] api/notify
module.exports.getNotifications = async (req, res) => {
    try {
        // Use req.id for the receiver (logged-in user) instead of req.params.sellerId
        const userId = req.id;
        const notifications = await Notification.find({ receiver: userId, read: false })
            .select("sender receiver message read");
        res.json(notifications.map(({ sender, receiver, message, read }) => ({ sender, receiver, message, read })));
    } catch (error) {
        res.json({ message: "Error fetching notifications" });
    }
};

// [PUT] api/notify/read/:id
module.exports.markAsRead = async (req, res) => {
    try {
        // Only update if the notification belongs to the logged-in user (receiver: req.id)
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, receiver: req.id },
            { read: true },
            { new: true }
        ).select("sender receiver message read");

        if (!notification) {
            return res.json({ message: "Notification not found or access denied" });
        }
        res.json(notification);
    } catch (error) {
        res.json({ message: "Error updating notification" });
    }
};

// [DELETE] api/notify/delete/:id
module.exports.deleteNotification = async (req, res) => {
    try {
        // Only allow deletion if the notification belongs to the logged-in user
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, receiver: req.id });
        if (!notification) {
            return res.json({ message: "Notification not found or access denied" });
        }
        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.json({ message: "Error deleting notification" });
    }
};
