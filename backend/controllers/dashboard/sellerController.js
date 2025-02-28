const userModel = require("../../models/userModel");
const { responseReturn } = require("../../utiles/response");
const bcrypt = require('bcrypt');

// 📌 Tạo seller
const create_seller = async (req, res) => {
    const { name, email, password, paymentMethod, accountDetails } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        const existingSeller = await userModel.findOne({ email, role: "seller" });
        if (existingSeller) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const seller = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role: 'seller',
            status: 'active',
            paymentMethod,
            accountDetails
        });

        return res.status(201).json({ message: 'Seller created successfully', seller });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// 📌 Lấy thông tin một seller
const get_seller = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = await userModel.findOne({ _id: id, role: "seller" }).select('-password');
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }
        responseReturn(res, 200, { seller });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

// 📌 Lấy danh sách seller có phân trang & tìm kiếm
const get_sellers = async (req, res) => {
    try {
        const { page: pageInput, searchValue, status, perPage: perPageInput } = req.body || {};
        const page = Math.max(1, Number(pageInput) || 1);
        const perPage = Math.max(1, Number(perPageInput) || 10);

        const query = { role: "seller" };

        if (searchValue) {
            query.$or = [
                { name: { $regex: searchValue, $options: 'i' } },
                { email: { $regex: searchValue, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        const [sellers, total] = await Promise.all([
            userModel.find(query)
                .skip((page - 1) * perPage)
                .limit(perPage)
                .sort({ createdAt: -1 })
                .lean(),
            userModel.countDocuments(query)
        ]);

        const pages = Math.ceil(total / perPage);
        responseReturn(res, 200, { sellers, total, pages });
    } catch (error) {
        console.error('Get sellers error:', error);
        responseReturn(res, 500, { error: `Failed to retrieve sellers: ${error.message}` });
    }
};

// 📌 Cập nhật trạng thái seller
const update_seller_status = async (req, res) => {
    try {
        const { sellerId, status } = req.body;

        await userModel.findByIdAndUpdate(sellerId, { status });
        const seller = await userModel.findOne({ _id: sellerId, role: "seller" });

        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        responseReturn(res, 200, { seller, message: "Update seller status successfully" });
    } catch (error) {
        console.error('Update seller status error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// 📌 Cập nhật thông tin seller
const update_seller_info = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, image, paymentMethod, accountDetails } = req.body;
        
        const seller = await userModel.findOne({ _id: id, role: "seller" });
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        if (name) seller.name = name;
        if (email) seller.email = email;
        if (password) seller.password = await bcrypt.hash(password, 10);
        if (image) seller.image = image;
        if (paymentMethod) seller.paymentMethod = paymentMethod;
        if (accountDetails) seller.accountDetails = accountDetails;

        await seller.save();
        responseReturn(res, 200, { seller, message: "Update seller info successfully" });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

// 📌 Thay đổi mật khẩu seller
const change_password = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const { id } = req.params;

        if (!id || !password || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        if (password === newPassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }

        const seller = await userModel.findOne({ _id: id, role: "seller" }).select('+password');
        if (!seller) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        seller.password = await bcrypt.hash(newPassword, 10);
        await seller.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// 📌 Xóa seller
const delete_seller = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return responseReturn(res, 400, { error: 'Seller ID is required' });
        }

        const deletedSeller = await userModel.findOneAndDelete({ _id: id, role: "seller" });

        if (!deletedSeller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        responseReturn(res, 200, { message: 'Seller deleted successfully' });
    } catch (error) {
        console.error('Delete seller error:', error);
        responseReturn(res, 500, { error: `Failed to delete seller: ${error.message}` });
    }
};

module.exports = {
    create_seller,
    get_seller,
    update_seller_status,
    update_seller_info,
    delete_seller,
    get_sellers,
    change_password
};
