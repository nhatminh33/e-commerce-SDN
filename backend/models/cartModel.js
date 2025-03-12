const {Schema, model} = require("mongoose");

const cartSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        required : true,
        ref: 'User'
    },
    productId: {
        type: Schema.ObjectId,
        required : true,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required : true, 
    },
    total: {
        type: Number,
        required : true
    } 
},{ timestamps: true })

module.exports = model('carts',cartSchema)