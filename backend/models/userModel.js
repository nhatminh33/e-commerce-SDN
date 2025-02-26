const { Schema, model } = require("mongoose");

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
        unique: true
    },
    password: {
        type: String,
        required: [
            true,
            "Password is required!"],
        select: false
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
    }
}, { timestamps: true });

userSchema.index({ email: 1 });

module.exports = model("User", userSchema);
