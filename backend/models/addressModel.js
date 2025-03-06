const { Schema, model } = require("mongoose");

const addressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverName: {
        type: String,
        required: [true, "Receiver name is required!"]
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required!"]
    },
    province: {
        type: String,
        required: [true, "Province is required!"]
    },
    district: {
        type: String,
        required: [true, "District is required!"]
    },
    ward: {
        type: String,
        required: [true, "Ward is required!"]
    },
    streetAddress: {
        type: String,
        required: [true, "Street address is required!"]
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure a user can only have one default address
addressSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

module.exports = model("Address", addressSchema); 