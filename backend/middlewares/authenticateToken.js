const jwt = require('jsonwebtoken');
const { createAccessToken } = require('../utiles/tokenCreate');
const userModel = require('../models/userModel');
const accountModel = require('../models/accountModel');

/**
 * Middleware xác thực token và xử lý refresh token
 * Kiểm tra token, nếu token hết hạn thì lấy refreshToken từ database để tạo token mới
 */
const authenticateToken = async (req, res, next) => {
    // Lấy token từ cookie hoặc header
    const accessToken = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
    
    if (!accessToken) {
        return res.status(401).json({ 
            message: 'No token provided, please login',
            isTokenExpired: true 
        });
    }

    try {
        // Kiểm tra access token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.role = decoded.role;
        req.id = decoded.id;
        next();
    } catch (error) {
        // Token hết hạn hoặc không hợp lệ
        if (error.name === 'TokenExpiredError') {
            try {
                // Lấy user id từ token hết hạn (không verify signature)
                const decodedExpired = jwt.decode(accessToken);
                
                if (!decodedExpired || !decodedExpired.id) {
                    return res.status(401).json({ 
                        message: 'Invalid token format',
                        isTokenExpired: true
                    });
                }
                
                const userId = decodedExpired.id;
                
                // Tìm account và refreshToken trong database
                const account = await accountModel.findByUserId(userId);
                
                if (!account || !account.isTokenValid()) {
                    // Xóa access token cookie 
                    res.clearCookie('accessToken');
                    
                    return res.status(401).json({ 
                        message: 'Session expired, please login again',
                        isTokenExpired: true
                    });
                }
                
                // Xác minh user có tồn tại không
                const user = await userModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ 
                        message: 'User not found',
                        isTokenExpired: true
                    });
                }
                
                // Tạo access token mới
                const userData = {
                    id: user._id.toString(),
                    role: user.role
                };
                
                const newAccessToken = await createAccessToken(userData, );
                
                // Gán token mới vào response header
                res.setHeader('x-new-access-token', newAccessToken);
                
                // Cài đặt cookie mới cho access token (KHÔNG gửi refresh token)
                res.cookie('accessToken', newAccessToken, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production'
                });
                
                // Đặt dữ liệu user vào request
                req.role = userData.role;
                req.id = userData.id;
                req.tokenRefreshed = true; // Đánh dấu là token đã được refresh
                
                // Cho phép request tiếp tục
                next();
            } catch (refreshError) {
                // Xóa access token cookie
                res.clearCookie('accessToken');
                
                return res.status(401).json({ 
                    message: 'Session expired, please login again',
                    error: refreshError.message,
                    isTokenExpired: true
                });
            }
        } else {
            // Token không hợp lệ (không phải hết hạn)
            res.clearCookie('accessToken');
            
            return res.status(401).json({ 
                message: 'Invalid token, please login again',
                error: error.message
            });
        }
    }
};

module.exports = authenticateToken;
