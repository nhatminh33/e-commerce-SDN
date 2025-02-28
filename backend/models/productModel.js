const { Schema, model, Types } = require("mongoose");

const productSchema = new Schema({
    sellerId: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "Seller ID is required!"]
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
    category: {
        type: Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required!"]
    },
    price: {
        type: Number,
        required: [true, "Price is required!"],
        min: [0, "Price cannot be negative!"]
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
    rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be negative!"],
        max: [5, "Rating cannot exceed 5!"]
    }
}, { timestamps: true });

productSchema.index(
    { name: "text", brand: "text", description: "text" },
    { weights: { name: 7, brand: 4, description: 2 } }
);

productSchema.index({ slug: 1 }, { unique: true }); 
productSchema.index({ category: 1 });
productSchema.index({ sellerId: 1 }); 
productSchema.index({ price: 1, stock: -1 }); 

module.exports = model("Product", productSchema);
