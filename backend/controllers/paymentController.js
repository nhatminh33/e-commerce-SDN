const moment = require('moment');
const Order = require('../models/orderModel');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports.createPayment = async (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let tmnCode = process.env.VNPAY_TMN_CODE;
    let secretKey = process.env.VNPAY_HASH_SECRET;
    let vnpUrl = process.env.VNPAY_PAYMENT_URL;
    let returnUrl = process.env.VNPAY_RETURN_URL;

    // let { wid, userId, totalPrice, fullName, phoneNumber, country } = req.body;

    // let order = await Order.findOne({ wid });

    // if (!order) {
    //     return res.status(400).json({ message: 'Order not found' });
    // }
 
    let orderId = req.body.orderId;
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;
    let locale = req.body.language || 'vn';

    let currCode = 'VND';
    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmnCode,
        'vnp_Locale': locale,
        'vnp_CurrCode': currCode,
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': `Thanh toán đơn hàng #${orderId}`,
        'vnp_OrderType': 'other',
        'vnp_Amount': amount * 100,
        'vnp_ReturnUrl': returnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate,
        'vnp_BankCode': bankCode || ''
    };

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl: vnpUrl });
};

module.exports.vnpayIpn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNPAY_HASH_SECRET;
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        let order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({ RspCode: '01', Message: 'Order not found' });
        }

        if (order.totalPrice * 100 !== parseInt(vnp_Params['vnp_Amount'])) {
            return res.status(400).json({ RspCode: '04', Message: 'Amount invalid' });
        }

        if (rspCode === "00") {
            await Order.updateOne({ _id: orderId }, { 
                payment_status: "paid", 
                delivery_status: "processing" 
            });
            return res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            await Order.updateOne({ _id: orderId }, { payment_status: "cancelled" });
            return res.status(200).json({ RspCode: '00', Message: 'Payment failed' });
        }
    } else {
        return res.status(400).json({ RspCode: '97', Message: 'Checksum failed' });
    }
};

module.exports.returnVnpay = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    let orderId = vnp_Params['vnp_TxnRef'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.VNPAY_HASH_SECRET;
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        let order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (vnp_Params['vnp_ResponseCode'] === '00') {
            await Order.updateOne({ _id: orderId }, { 
                payment_status: "paid", 
                delivery_status: "processing" 
            });
            return res.json({ success: true, message: "Thanh toán thành công" });
        } else if (vnp_Params['vnp_ResponseCode'] === '24') {
            await Order.updateOne({ _id: orderId }, { payment_status: "cancelled" });
            return res.json({ success: true, message: "Thanh toán không thành công do hủy" });
        } else {
            return res.json({ success: false, message: "Thanh toán thất bại!" });
        }
    } else {
        return res.json({ success: false, message: "Sai chữ ký bảo mật!" });
    }
};
