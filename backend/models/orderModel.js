const {Schema, model} = require("mongoose");

const orderSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: 'User',
        required : true
    },
    productId: {
        type: Array,
        ref: 'Product',
        required : true  
    }, 
    totalPrice: {
        type: Number,
        required : true  
    },     
    payment_status: {
        type: String,
        required : true  
    },
    shippingInfo: {
        type: String,
        required : true  
    },
    delivery_status: {
        type: String,
        required : true  
    },
    date: {
        type: String,
        required : true
    } 
})

module.exports = model('Order',orderSchema)