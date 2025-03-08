const {Schema, model} = require("mongoose");

const bannerSchema = new Schema({
    productId: {
        type: Schema.ObjectId,
        ref: 'Product',
        required : true
    },
    banner: {
        type: String,
        required : true
    },
    link: {
        type: String,
        required : true  
    } 
},{ timestamps: true })

module.exports = model('banners',bannerSchema)