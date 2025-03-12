const {Schema, model} = require("mongoose");

const sellerSalarySchema = new Schema({
    sellerId: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    basicSalary: {
        type: Number,
        required: true,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    deduction: {
        type: Number,
        default: 0
    },
    totalSalary: {
        type: Number,
        required: true
    },
    note: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "paid", "rejected"],
        default: "pending"
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    paidDate: {
        type: Date
    }
}, { timestamps: true });

// Virtual for accessing seller details
sellerSalarySchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true
});

module.exports = model('SellerSalary', sellerSalarySchema); 