const {Schema, model} = require("mongoose");

const orderSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: 'User',
        required : true
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            subTotal: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required : true  
    },     
    payment_status: {
        type: String,
        required : true ,
        enum : ["failed", "paid", "pending"] 
    },
    payment_method: {
        type: String
    },
    shippingInfo: {
        fullName: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            length: 10
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: "Viet Nam"
        },
        email:{
            type: String,
            required: true
        }
    },
    delivery_status: {
        type: String,
        required : true  ,
        enum: ["pending", "shipping", "delivered", "canceled"], 
    },
    date: {
        type: String,
        required : true
    } 
}, { timestamps: true })

module.exports = model('Order',orderSchema)