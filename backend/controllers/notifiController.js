const Notification = require("../models/adminNotification");
const User = require("../models/userModel");
const mongoose = require('mongoose');

module.exports.createNotification = async (req, res) => {
    try {
        // Admin luôn là người gửi
        const { receiver, message } = req.body;
        const sender = req.id; // Admin ID

        // Trường hợp gửi cho tất cả seller
        if (!receiver || receiver === "all") {
            const sellers = await User.find({ role: "seller" }).select("_id");
            
            // Tạo một thông báo với mảng receiver chứa tất cả seller
            const notification = await new Notification({
                sender,
                receiver: sellers.map(seller => seller._id),
                message,
                viewers: [] // Khởi tạo mảng viewers rỗng
            }).save();

            const populatedNotification = await Notification.findById(notification._id)
                .populate('sender', 'name email image')
                .populate('receiver', 'name email image');

            return res.json({ 
                success: true, 
                message: "Notification sent to all sellers",
                notification: populatedNotification
            });
        }

        // Nếu receiver là một mảng các ID
        if (Array.isArray(receiver)) {
            // Xác minh tất cả ID là của các seller
            const sellerIds = [];
            for (const sellerId of receiver) {
                if (!mongoose.Types.ObjectId.isValid(sellerId)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid receiver ID: ${sellerId}`
                    });
                }
                
                const user = await User.findById(sellerId);
                if (!user || user.role !== "seller") {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid receiver ${sellerId}. Notifications can only be sent to sellers.`
                    });
                }
                
                sellerIds.push(sellerId);
            }

            const notification = await new Notification({
                sender,
                receiver: sellerIds,
                message,
                viewers: []
            }).save();

            const populatedNotification = await Notification.findById(notification._id)
                .populate('sender', 'name email image')
                .populate('receiver', 'name email image');

            return res.json({ 
                success: true, 
                message: `Notification sent to ${sellerIds.length} sellers`,
                notification: populatedNotification
            });
        }

        // Nếu receiver là một ID đơn lẻ
        if (!mongoose.Types.ObjectId.isValid(receiver)) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver ID"
            });
        }

        // Kiểm tra xem receiver có phải là seller không
        const receiverUser = await User.findById(receiver);
        if (!receiverUser || receiverUser.role !== "seller") {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid receiver. Notifications can only be sent to sellers." 
            });
        }

        const notification = await new Notification({
            sender,
            receiver: [receiver], // Lưu dưới dạng mảng chứa một phần tử
            message,
            viewers: []
        }).save();

        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'name email image')
            .populate('receiver', 'name email image');

        res.json({
            success: true,
            message: `Notification sent to ${receiverUser.name}`,
            notification: populatedNotification
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ success: false, message: "Error creating notification" });
    }
};

// [GET] api/notify
module.exports.getNotifications = async (req, res) => {
    try {
        // ID của người dùng hiện tại
        const userId = req.id;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filter parameters
        const search = req.query.search || '';
        const status = req.query.status || 'all'; // 'all', 'read', 'unread'

        // Build query - tìm các thông báo có userId trong mảng receiver
        let query = { receiver: userId };

        // Add search filter if provided
        if (search) {
            query.message = { $regex: search, $options: 'i' };
        }

        // Add status filter if provided
        if (status !== 'all') {
            query.read = status === 'read';
        }

        // Count total documents matching the query
        const totalCount = await Notification.countDocuments(query);

        // Get notifications with pagination
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email image')
            .populate('receiver', 'name email image')
            .populate('viewers', 'name email image')
            .select("sender receiver message read createdAt viewers");

        // Format notifications for response
        const formattedNotifications = notifications.map(notification => {
            const senderId = notification.sender?._id?.toString();

            // Filter out sender (admin) from viewers list
            const filteredViewers = notification.viewers?.filter(viewer =>
                viewer._id.toString() !== senderId
            ).map(viewer => ({
                id: viewer._id,
                name: viewer.name,
                email: viewer.email,
                image: viewer.image
            })) || [];

            // Format receivers
            const receivers = notification.receiver.map(recv => ({
                id: recv._id,
                name: recv.name,
                email: recv.email,
                image: recv.image
            }));

            return {
                _id: notification._id,
                message: notification.message,
                read: notification.read,
                sender: notification.sender ? {
                    id: notification.sender._id,
                    name: notification.sender.name,
                    email: notification.sender.email,
                    image: notification.sender.image
                } : null,
                receivers: receivers,
                createdAt: notification.createdAt,
                viewers: filteredViewers
            };
        });

        res.json({
            success: true,
            notifications: formattedNotifications,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy thông báo" });
    }
};

// [GET] api/notify/all
module.exports.getAllNotifications = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filter parameters
        const search = req.query.search || '';
        const status = req.query.status || 'all'; // 'all', 'read', 'unread'
        const receiverFilter = req.query.receiver || ''; // Filter by receiver

        // Build query
        let query = {};

        // Add search filter if provided
        if (search) {
            query.message = { $regex: search, $options: 'i' };
        }

        // Add status filter if provided
        if (status !== 'all') {
            query.read = status === 'read';
        }

        // Add receiver filter if provided
        if (receiverFilter) {
            if (receiverFilter === 'all') {
                // Không áp dụng filter để lấy tất cả
            } else {
                // Có thể filter theo id hoặc tên/email người nhận
                try {
                    // Nếu là id hợp lệ thì tìm thông báo có id đó trong mảng receiver
                    if (mongoose.Types.ObjectId.isValid(receiverFilter)) {
                        query.receiver = receiverFilter;
                    } else {
                        // Tìm theo tên hoặc email
                        const users = await User.find({
                            $or: [
                                { name: { $regex: receiverFilter, $options: 'i' } },
                                { email: { $regex: receiverFilter, $options: 'i' } },
                            ],
                            role: "seller" // Chỉ tìm seller
                        }).select('_id');

                        if (users.length > 0) {
                            // Tìm thông báo có ít nhất một user id trong mảng receiver
                            query.receiver = { $in: users.map(user => user._id) };
                        } else {
                            // Không tìm thấy người nhận, trả về kết quả rỗng
                            query.receiver = null;
                        }
                    }
                } catch (error) {
                    // Nếu có lỗi, không áp dụng filter
                    console.error("Error in receiver filter:", error);
                }
            }
        }

        // Count total documents matching the query
        const totalCount = await Notification.countDocuments(query);

        // Get notifications with pagination
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email image')
            .populate('receiver', 'name email image')
            .populate('viewers', 'name email image')
            .select("sender receiver message read createdAt viewers");

        // Transform notifications to include sender and receiver names
        const formattedNotifications = notifications.map(notification => {
            const senderId = notification.sender?._id?.toString();

            // Filter out sender (admin) from viewers list
            const filteredViewers = notification.viewers?.filter(viewer =>
                viewer._id.toString() !== senderId
            ).map(viewer => ({
                id: viewer._id,
                name: viewer.name,
                email: viewer.email,
                image: viewer.image
            })) || [];

            // Format receivers
            const receivers = notification.receiver.map(recv => ({
                id: recv._id,
                name: recv.name,
                email: recv.email,
                image: recv.image
            }));

            return {
                _id: notification._id,
                message: notification.message,
                read: notification.read,
                sender: notification.sender
                    ? {
                        id: notification.sender._id,
                        name: notification.sender.name,
                        email: notification.sender.email,
                        image: notification.sender.image
                    }
                    : null,
                receivers: receivers,
                createdAt: notification.createdAt,
                viewers: filteredViewers
            };
        });

        res.json({
            success: true,
            notifications: formattedNotifications,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ success: false, message: "Error fetching all notifications" });
    }
};

// [PUT] api/notify/read/:id
module.exports.markAsRead = async (req, res) => {
    try {
        const userId = req.id;

        // Find the notification
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        // Check if user is one of the receivers
        const isReceiver = notification.receiver.some(id => id.toString() === userId);
        
        if (!isReceiver && req.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You don't have permission to access this notification" });
        }

        // Add user to viewers if not already there
        const isViewer = notification.viewers.some(id => id.toString() === userId);
        if (!isViewer) {
            notification.viewers.push(userId);
        }

        // Save the updated notification
        await notification.save();

        // Populate the notification with user details
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'name email image')
            .populate('receiver', 'name email image')
            .populate('viewers', 'name email image');

        // Format the response
        const senderId = populatedNotification.sender?._id?.toString();

        // Filter out sender (admin) from viewers list
        const filteredViewers = populatedNotification.viewers?.filter(viewer =>
            viewer._id.toString() !== senderId
        ).map(viewer => ({
            id: viewer._id,
            name: viewer.name,
            email: viewer.email,
            image: viewer.image
        })) || [];

        // Format receivers
        const receivers = populatedNotification.receiver.map(recv => ({
            id: recv._id,
            name: recv.name,
            email: recv.email,
            image: recv.image
        }));

        const formattedNotification = {
            _id: populatedNotification._id,
            message: populatedNotification.message,
            sender: populatedNotification.sender
                ? {
                    id: populatedNotification.sender._id,
                    name: populatedNotification.sender.name,
                    email: populatedNotification.sender.email,
                    image: populatedNotification.sender.image
                }
                : null,
            receivers: receivers,
            createdAt: populatedNotification.createdAt,
            viewers: filteredViewers
        };

        res.json({ success: true, notification: formattedNotification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, message: "Error updating notification status" });
    }
};

// [DELETE] api/notify/delete/:id
module.exports.deleteNotification = async (req, res) => {
    try {
        // Check user role to determine permissions
        const { role } = req;

        // For admin, allow deleting any notification
        // For other users, only allow deleting their own notifications
        const query = role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, receiver: req.id };

        const notification = await Notification.findOneAndDelete(query);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found or you don't have permission to delete it" });
        }

        res.json({
            success: true,
            message: "Notification deleted successfully",
            deletedId: notification._id
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ success: false, message: "Error deleting notification" });
    }
};

// [GET] api/notify/sellers
module.exports.getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: "seller" })
            .select("_id name email image")
            .sort({ name: 1 });

        res.json({
            success: true,
            sellers: sellers.map(seller => ({
                id: seller._id,
                name: seller.name,
                email: seller.email,
                image: seller.image
            }))
        });
    } catch (error) {
        console.error("Error fetching sellers:", error);
        res.status(500).json({ success: false, message: "Error fetching sellers list" });
    }
};

// Update notification message
module.exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, receiver } = req.body;

        if (!message) {
            return res.status(400).json({
                message: 'Please enter notification content'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid notification ID'
            });
        }

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found'
            });
        }

        // Cập nhật nội dung thông báo
        notification.message = message;

        // Cập nhật người nhận nếu được chỉ định
        if (receiver) {
            // Nếu là "all", thêm tất cả seller vào mảng receiver
            if (receiver === "all") {
                const allSellers = await User.find({ role: "seller" }).select("_id");
                notification.receiver = allSellers.map(seller => seller._id);
            } 
            // Nếu là một mảng các ID
            else if (Array.isArray(receiver)) {
                // Xác minh tất cả ID là của các seller
                const sellerIds = [];
                for (const sellerId of receiver) {
                    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
                        return res.status(400).json({
                            message: `Invalid receiver ID: ${sellerId}`
                        });
                    }
                    
                    const user = await User.findById(sellerId);
                    if (!user || user.role !== "seller") {
                        return res.status(400).json({
                            message: `Invalid receiver ${sellerId}. Notifications can only be sent to sellers.`
                        });
                    }
                    
                    sellerIds.push(sellerId);
                }
                notification.receiver = sellerIds;
            } 
            // Nếu là một ID đơn lẻ
            else if (mongoose.Types.ObjectId.isValid(receiver)) {
                const user = await User.findById(receiver);
                if (!user || user.role !== "seller") {
                    return res.status(400).json({
                        message: "Invalid receiver. Notifications can only be sent to sellers."
                    });
                }
                notification.receiver = [receiver];
            }
            else {
                return res.status(400).json({
                    message: "Invalid receiver format. Must be 'all', a valid ID, or an array of IDs."
                });
            }
        }

        await notification.save();

        // Trả về kết quả với thông tin đã được populated
        const updatedNotification = await Notification.findById(id)
            .populate('sender', 'name email image')
            .populate('receiver', 'name email image')
            .populate('viewers', 'name email image');

        return res.status(200).json({
            message: 'Notification updated successfully',
            notification: updatedNotification
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating notification',
            error: error.message
        });
    }
};
