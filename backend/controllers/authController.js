const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { createToken } = require('../utiles/tokenCreate');
const cloudinaryService = require('../utiles/cloudinaryService');
const { responseReturn } = require('../utiles/response');

const admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email, role: { $in: ["admin", "seller"] } }).select('+password');
        console.log('user', user);
        
        if (!user) {
            return responseReturn(res, 404, { error: "Email not found or access denied" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return responseReturn(res, 404, { error: "Password is incorrect" });
        }
        
        const token = await createToken({ id: user._id.toString(), role: user.role });

        res.cookie('accessToken', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true
        });

        return responseReturn(res, 200, { token, message: "Login Success" });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        res.cookie('accessToken', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });
        return responseReturn(res, 200, { message: 'Logout Success' });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

const get_user = async (req, res) => {
    try {
        const { id } = req.body;

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ userInfo: user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const profile_image_upload = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, _, files) => {
        const { image } = files;

        try {
            const result = await cloudinaryService.uploader.upload(image.filepath, { folder: 'profile' });

            if (result) {
                await userModel.findByIdAndUpdate(id, { image: result.url });
                const userInfo = await userModel.findById(id);
                return responseReturn(res, 201, { message: 'Profile Image Uploaded Successfully', userInfo });
            } else {
                return responseReturn(res, 404, { error: 'Image Upload Failed' });
            }

        } catch (error) {
            return responseReturn(res, 500, { error: error.message });
        }
    });
};

module.exports = { admin_login, logout, get_user, profile_image_upload };
