const {Schema, model} = require("mongoose");

const reviewSchema = new Schema({
    productId: {
        type: Schema.ObjectId,
        required : true
    },
    userId: {
        type: Schema.ObjectId,
        required : true
    },
    rating: {
        type: Number,
        default : 0 
    },
    review: {
        type: String,
        required : true
    },
    reply: {
        type: Schema.ObjectId,
        ref: 'reviews'
    }
},{ timestamps: true })

module.exports = model('reviews',reviewSchema)