const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utiles/tokenCreate');
const cloudinaryService = require('../utiles/cloudinaryService');
const { responseReturn } = require('../utiles/response');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utiles/emailService');
const { formidable } = require('formidable');
const addressModel = require('../models/addressModel');
const accountModel = require('../models/accountModel');

const admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email, role: { $in: ["admin", "seller"] } }).select('+password');
        
        if (!user) {
            return responseReturn(res, 404, { error: "Email not found or access denied" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return responseReturn(res, 404, { error: "Password is incorrect" });
        }
        
        const token = await createAccessToken({ id: user._id.toString(), role: user.role });
        const refreshToken = await createRefreshToken({ id: user._id.toString(), role: user.role });

        // Lưu refresh token vào model Account
        let account = await accountModel.findByUserId(user._id);

        if (account) {
            // Cập nhật token mới nếu tài khoản đã tồn tại
            await account.updateRefreshToken(refreshToken, 30 * 24 * 60 * 60 * 1000); // 30 ngày
        } else {
            // Tạo mới account nếu chưa tồn tại
            account = new accountModel({
                userId: user._id,
                refreshToken: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày
            });
            await account.save();
        }

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
        const userId = req.id;
        
        // Tìm và hủy refresh token
        const account = await accountModel.findByUserId(userId);
        if (account) {
            await account.revokeToken();
        }
        
        // Xóa cookies
        res.clearCookie('accessToken');
        
        return responseReturn(res, 200, { message: "Logout successful" });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

const get_user = async (req, res) => {
    try {
        // Lấy id trực tiếp từ req.id (được set bởi middleware authenticateToken)
        const id = req.id;
        console.log('id', id);
        
        const user = await userModel.findById(id);
        console.log('user', user);
        
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
    const form = formidable({ multiples: false });

    try {
        const [fields, files] = await form.parse(req);
        const { image } = files;

        if (!image || !image[0]) {
            return responseReturn(res, 400, { error: 'Image is required' });
        }

        const result = await cloudinaryService.uploader.upload(image[0].filepath, { folder: 'profile' });

        if (!result) {
            return responseReturn(res, 404, { error: 'Image Upload Failed' });
        }

        const userInfo = await userModel.findByIdAndUpdate(
            id, 
            { image: result.url },
            { new: true }
        );

        return responseReturn(res, 201, { 
            message: 'Profile Image Uploaded Successfully', 
            userInfo,
            image: result.url 
        });

    } catch (error) {
        console.error('Profile image upload error:', error);
        return responseReturn(res, 500, { error: error.message });
    }
};

// Customer Register
const customer_register = async (req, res) => {
    const { 
        name, 
        email, 
        password,
        phoneNumber,
        dateOfBirth,
        gender,
        address 
    } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password || !phoneNumber || !dateOfBirth) {
            return responseReturn(res, 400, { 
                error: "Name, email, password, phone number, and date of birth are required!" 
            });
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return responseReturn(res, 400, { error: "Email already exists" });
        }

        // Validate phone number format
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return responseReturn(res, 400, { 
                error: "Invalid phone number! Phone number must be 10 digits." 
            });
        }

        // Validate date of birth
        const birthDate = new Date(dateOfBirth);
        if (birthDate > new Date()) {
            return responseReturn(res, 400, { 
                error: "Date of birth cannot be in the future!" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new customer
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            dateOfBirth: birthDate,
            gender,
            role: 'customer'
        });

        // Generate verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, name, verificationToken);

        // Create address if provided
        if (address) {
            const { 
                receiverName,
                phoneNumber: addressPhone,
                province,
                district,
                ward,
                streetAddress
            } = address;

            // Validate address fields
            if (!receiverName || !addressPhone || !province || !district || !ward || !streetAddress) {
                return responseReturn(res, 400, { 
                    error: "All address fields are required!" 
                });
            }

            // Create new address
            await addressModel.create({
                userId: user._id,
                receiverName,
                phoneNumber: addressPhone,
                province,
                district,
                ward,
                streetAddress,
                isDefault: true // First address is set as default
            });
        }

        return responseReturn(res, 201, { 
            message: "Registration successful. Please check your email to verify your account." 
        });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Customer Login
const customer_login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email, role: "customer" }).select('+password');
        
        if (!user) {
            return responseReturn(res, 404, { error: "Email not found" });
        }

        if (!user.isEmailVerified) {
            return responseReturn(res, 403, { 
                error: "Please verify your email before logging in",
                isEmailVerified: false
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return responseReturn(res, 404, { error: "Password is incorrect" });
        }

        const tokenData = { id: user._id.toString(), role: user.role };
        const accessToken = await createAccessToken(tokenData);
        const refreshToken = await createRefreshToken(tokenData);

        // Lưu refresh token vào model Account
        let account = await accountModel.findByUserId(user._id);
        if (account) {
            // Cập nhật token mới nếu tài khoản đã tồn tại
            await account.updateRefreshToken(refreshToken, 30 * 24 * 60 * 60 * 1000); // 30 ngày
        } else {
            // Tạo mới account nếu chưa tồn tại
            account = new accountModel({
                userId: user._id,
                refreshToken: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày
            });
            await account.save();
        }

        // Set cookie chỉ cho access token (KHÔNG gửi refresh token)
        res.cookie('accessToken', accessToken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            httpOnly: true,
            sameSite: 'strict'
        });

        return responseReturn(res, 200, { message: "Login successful", token: accessToken });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Verify Email
const verify_email = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await userModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return responseReturn(res, 400, { 
                error: "Invalid or expired verification token" 
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return responseReturn(res, 200, { 
            message: "Email verified successfully. You can now login." 
        });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Resend Verification Email
const resend_verification_email = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return responseReturn(res, 404, { error: "User not found" });
        }

        if (user.isEmailVerified) {
            return responseReturn(res, 400, { error: "Email is already verified" });
        }

        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        await sendVerificationEmail(email, user.name, verificationToken);

        return responseReturn(res, 200, { 
            message: "Verification email sent successfully" 
        });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Update Customer Profile
const update_profile = async (req, res) => {
    const { id } = req;
    const updateData = req.body;

    try {
        // Remove fields that shouldn't be updated
        delete updateData.password;
        delete updateData.email;
        delete updateData.role;
        delete updateData.isEmailVerified;

        // Validate phone number if provided
        if (updateData.phoneNumber) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(updateData.phoneNumber)) {
                return responseReturn(res, 400, { 
                    error: "Invalid phone number! Phone number must be 10 digits." 
                });
            }
        }

        // Validate date of birth if provided
        if (updateData.dateOfBirth) {
            const birthDate = new Date(updateData.dateOfBirth);
            if (birthDate > new Date()) {
                return responseReturn(res, 400, { 
                    error: "Date of birth cannot be in the future!" 
                });
            }
            updateData.dateOfBirth = birthDate;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return responseReturn(res, 404, { error: "User not found" });
        }

        return responseReturn(res, 200, { 
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Refresh Token
const refresh_token = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return responseReturn(res, 401, { error: "Refresh token not found" });
        }

        const result = await verifyRefreshToken(refreshToken);
        
        if (!result.valid) {
            return responseReturn(res, 401, { error: "Invalid refresh token" });
        }

        const user = await userModel.findById(result.data.id);
        if (!user) {
            return responseReturn(res, 404, { error: "User not found" });
        }

        const tokenData = { id: user._id.toString(), role: user.role };
        const accessToken = await createAccessToken(tokenData);
        const newRefreshToken = await createRefreshToken(tokenData);

        // Set new cookies
        res.cookie('accessToken', accessToken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'strict'
        });

        res.cookie('refreshToken', newRefreshToken, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'strict'
        });

        return responseReturn(res, 200, { message: "Token refreshed successfully" });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

const change_password = async (req, res) => {
    const { id } = req;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await userModel.findById(id).select('+password');
        if (!user) {
            return responseReturn(res, 404, { error: "User not found" });
        }

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return responseReturn(res, 404, { error: "Old password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return responseReturn(res, 200, { 
            message: "Password updated successfully. Please login again with your new password." 
        });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Forgot Password
const forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return responseReturn(res, 404, { error: "Email not found" });
        }

        // Generate a password reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send password reset email
        await sendPasswordResetEmail(email, user.name, resetToken);

        return responseReturn(res, 200, { 
            message: "Password reset email sent successfully. Please check your email." 
        });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Reset Password
const reset_password = async (req, res) => {
    const { token, email, newPassword } = req.body;

    try {
        const user = await userModel.findOne({
            email,
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return responseReturn(res, 400, { 
                error: "Invalid or expired reset token" 
            });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        
        // Clear reset token fields
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        await user.save();

        return responseReturn(res, 200, { 
            message: "Password has been reset successfully. You can now login with your new password." 
        });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Verify Password Reset Token
const verify_reset_token = async (req, res) => {
    const { token, email } = req.body;

    try {
        if (!token || !email) {
            return responseReturn(res, 400, { error: "Token and email are required" });
        }

        const user = await userModel.findOne({
            email,
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return responseReturn(res, 400, { error: "Invalid or expired reset token" });
        }

        return responseReturn(res, 200, { valid: true, message: "Token is valid" });

    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

module.exports = { 
    admin_login, 
    customer_login,
    customer_register,
    verify_email,
    verify_reset_token,
    resend_verification_email,
    update_profile,
    refresh_token,
    logout, 
    get_user, 
    profile_image_upload,
    change_password,
    reset_password,
    forgot_password
};
