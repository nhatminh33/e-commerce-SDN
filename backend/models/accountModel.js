const { Schema, model } = require("mongoose");

/**
 * Model Account lưu trữ thông tin tài khoản và refresh token
 * Mỗi account được liên kết với một userId
 * Quản lý refreshToken và thời gian hết hạn
 */
const accountSchema = new Schema({
    // Liên kết với user
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Refresh token hiện tại
    refreshToken: {
        type: String,
        index: true
    },
    
    // Thời gian hết hạn của refresh token
    expiresAt: {
        type: Date
    },
    
}, { 
    timestamps: true 
});

// Index để tối ưu hiệu suất truy vấn
accountSchema.index({ userId: 1 });
accountSchema.index({ refreshToken: 1 });

// Kiểm tra refreshToken có còn hợp lệ không
accountSchema.methods.isTokenValid = function() {
    return (
        this.refreshToken && 
        this.expiresAt && 
        this.expiresAt > new Date()
    );
};

// Cập nhật refresh token mới
accountSchema.methods.updateRefreshToken = function(newToken, expiresIn) {
    this.refreshToken = newToken;
    this.expiresAt = new Date(Date.now() + expiresIn);
    return this.save();
};

// Hủy refresh token
accountSchema.methods.revokeToken = function() {
    this.refreshToken = null;
    this.expiresAt = null;
    return this.save();
};

// Tìm account bằng userId
accountSchema.statics.findByUserId = function(userId) {
    return this.findOne({ userId });
};

// Tìm account bằng refreshToken
accountSchema.statics.findByRefreshToken = function(refreshToken) {
    return this.findOne({ 
        refreshToken,
        expiresAt: { $gt: new Date() }
    });
};

module.exports = model("Account", accountSchema);