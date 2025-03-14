const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utiles/tokenCreate');
const cloudinaryService = require('../utiles/cloudinaryService');
const { responseReturn } = require('../utiles/response');
const { sendVerificationEmail } = require('../utiles/emailService');
const formidable = require('formidable');
const addressModel = require('../models/addressModel');

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
        
        const token = await createAccessToken({ id: user._id.toString(), role: user.role });

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
        res.cookie('accessToken', '', {
            expires: new Date(0),
            httpOnly: true,
            sameSite: 'strict'
        });
        
        res.cookie('refreshToken', '', {
            expires: new Date(0),
            httpOnly: true,
            sameSite: 'strict'
        });
        
        return responseReturn(res, 200, { message: 'Logout successful' });
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

        // Set cookies
        res.cookie('accessToken', accessToken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            httpOnly: true,
            sameSite: 'strict'
        });

        res.cookie('refreshToken', refreshToken, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            sameSite: 'strict'
        });

        return responseReturn(res, 200, { message: "Login successful" });

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

module.exports = { 
    admin_login, 
    customer_login,
    customer_register,
    verify_email,
    resend_verification_email,
    update_profile,
    refresh_token,
    logout, 
    get_user, 
    profile_image_upload 
};
