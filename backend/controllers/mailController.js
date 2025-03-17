const nodemailer = require('nodemailer');
require('dotenv').config()
const sendMail = async ({email, subject, html}) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_APP_PASS
        }
    });

    const message = {
        from: 'ADMIN',
        to: email,
        subject: subject,
        html: html
    }

    const result = await transporter.sendMail(message);

    return result;
}

module.exports = {sendMail}