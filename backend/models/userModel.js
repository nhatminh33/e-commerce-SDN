const { Schema, model } = require("mongoose");

const phoneRegex = /^[0-9]{10}$/;

const userSchema = new Schema({
    name: {
        type: String,
        required: [
            true,
            "User name is required!"
        ]
    },
    email: {
        type: String,
        required: [
            true,
            "Email is required!"
        ],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: [
            true,
            "Password is required!"],
        select: false
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function(v) {
                return phoneRegex.test(v);
            },
            message: props => `${props.value} is not a valid phone number! Phone number must be 10 digits.`
        }
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(v) {
                return v <= new Date();
            },
            message: "Date of birth cannot be in the future!"
        }
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    role: {
        type: String,
        enum: ["admin", "seller", "customer"],
        required: true
    },
    image: { type: String, default: "" },
    status: {
        type: String,
        enum: ["active", "deactive"],
        default: "active",
    },
    method: { 
        type: String, 
        enum: ["manual", "google", "facebook"], 
        default: "manual",
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        index: true
    },
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for addresses
userSchema.virtual('addresses', {
    ref: 'Address',
    localField: '_id',
    foreignField: 'userId'
});

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
    
    this.emailVerificationToken = verificationToken;
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    
    return resetToken;
};

module.exports = model("User", userSchema);
