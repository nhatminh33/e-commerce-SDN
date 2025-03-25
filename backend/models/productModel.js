const {Schema, model} = require("mongoose");
require('./userModel')
require('./categoryModel')
const productSchema = new Schema({
    sellerId: {
        type: Schema.Types.ObjectId,
        required : true,
        ref: "User"
    },
    name: {
        type: String,
        required: [true, "Product name is required!"],
        trim: true,
        minlength: [3, "Product name must be at least 3 characters long!"],
        maxlength: [200, "Product name cannot exceed 200 characters!"]
    },
    slug: {
        type: String,
        required: [true, "Slug is required!"],
        trim: true,
        unique: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required!"]
    },
    price: {
        type: Number,
        required: [true, "Price is required!"],
        min: [0, "Price cannot be negative!"]
    },
    costPrice: {
        type: Number,
        min: [0, "Cost price cannot be negative!"],
        default: 0
    },
    stock: {
        type: Number,
        required: [true, "Stock quantity is required!"],
        min: [0, "Stock cannot be negative!"]
    },
    discount: {
        type: Number,
        required: [true, "Discount is required!"],
        min: [0, "Discount cannot be negative!"],
        max: [100, "Discount cannot exceed 100%!"]
    },
    description: {
        type: String,
        required: [true, "Product description is required!"],
        trim: true,
        minlength: [10, "Description must be at least 10 characters long!"]
    },
    images: {
        type: [String],
        required: [true, "At least one product image is required!"],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: "At least one product image is required!"
        }
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be negative!"],
        max: [5, "Rating cannot exceed 5!"]
    }
}, { timestamps: true });

productSchema.index(
    { name: "text", description: "text" },
    { weights: { name: 7, description: 2 } }
);

productSchema.index({ slug: 1 }, { unique: true }); 
productSchema.index({ category: 1 });
productSchema.index({ sellerId: 1 }); 
productSchema.index({ price: 1, stock: -1 }); 

module.exports = model("Product", productSchema);
