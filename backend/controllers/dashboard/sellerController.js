const sellerModel = require("../../models/sellerModel");
const { responseReturn } = require("../../utiles/response");
const bcrpty = require('bcrypt');

const create_seller = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        const existingSeller = await sellerModel.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrpty.hash(password, 10);
        const seller = await sellerModel.create({
            name,
            email,
            password: hashedPassword,
            method: 'manual',
            role: 'seller',
        });

        await sellerCustomerModel.create({ myId: seller._id });

        return res.status(201).json({ message: 'Seller created successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const get_seller = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = await sellerModel.findById(id);
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' })
        }
        responseReturn(res, 200, { seller })
    } catch (error) {
        responseReturn(res, 500, { error: error.message })
    }
}

const get_sellers = async (req, res) => {
    try {
        const { page: pageInput, searchValue, status, perPage: perPageInput } = req.body || {};
        const page = Math.max(1, Number(pageInput) || 1);
        const perPage = Math.max(1, Number(perPageInput) || 10);

        const query = {};

        if (searchValue) {
            // Lấy schema để xác định các trường string
            const schemaPaths = sellerModel.schema.paths;
            const stringFields = Object.keys(schemaPaths).filter(path =>
                schemaPaths[path].instance === 'String'
            );

            // Tạo điều kiện $or cho tất cả trường string
            query.$or = stringFields.map(field => ({
                [field]: { $regex: searchValue, $options: 'i' }
            }));
        }

        if (status) {
            query.status = status;
        }

        const [sellers, total] = await Promise.all([
            sellerModel.find(query)
                .skip((page - 1) * perPage)
                .limit(perPage)
                .sort({ createdAt: -1 })
                .lean(),
            sellerModel.countDocuments(query)
        ]);

        const pages = Math.ceil(total / perPage);
        responseReturn(res, 200, { sellers, total, pages });
    } catch (error) {
        console.error('Get sellers error:', error);
        responseReturn(res, 500, { error: `Failed to retrieve sellers: ${error.message}` });
    }
};

const update_seller_status = async (req, res) => {
    try {
        const { sellerId, status } = req.body

        await sellerModel.findByIdAndUpdate(sellerId, { status })
        const seller = await sellerModel.findById(sellerId)
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' })
        }

        responseReturn(res, 200, { seller, message: "Update seller status successfully" })
    } catch (error) {
        console.error('error', error);

        responseReturn(res, 500, { error: error.message })
    }
}

const update_seller_info = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, image } = req.body;
        const seller = await sellerModel.findById(id);
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' })
        }
        if (name) seller.name = name;
        if (email) seller.email = email;
        if (password) seller.password = password;
        if (image) seller.image = image;
        await seller.save();
        responseReturn(res, 200, { seller, message: "Update seller info successfully" })
    } catch (error) {
        responseReturn(res, 500, { error: error.message })
    }
}

const change_password = async (req, res) => {
    try {
        const { password, newPassword } = req.body
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        if (!password || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        if (password === newPassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }

        const seller = await sellerModel.findById(id).select('+password');
        if (!seller) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const isMatch = await bcrpty.compare(password, seller.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrpty.hash(newPassword, 10);
        await sellerModel.findByIdAndUpdate(id, { password: hashedPassword });

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message });
    }
}

const delete_seller = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation
        if (!id) {
            return responseReturn(res, 400, { error: 'Seller ID is required' });
        }

        // Xóa seller và kiểm tra kết quả
        const deletedSeller = await sellerModel.findByIdAndDelete(id);

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
}
