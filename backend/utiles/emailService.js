const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, name, verificationToken) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't register for an account, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Password',
        html: `
            <h2>Hello ${name}!</h2>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
}; 