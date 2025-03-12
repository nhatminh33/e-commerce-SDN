const {Schema, model} = require("mongoose");
require('./userModel');
require('./productModel')
const wishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required : true,
        ref: "User"
    },
    productId: {
        type: Schema.Types.ObjectId,
        required : true,
        ref: 'Product'
    }
},{ timestamps: true })

module.exports = model('wishlists',wishlistSchema)

  