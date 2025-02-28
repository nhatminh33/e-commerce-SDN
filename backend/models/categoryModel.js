const { Schema, model } = require("mongoose");

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, "Category name is required!"],
        trim: true,
        unique: true,
        minlength: [3, "Category name must be at least 3 characters long!"],
        maxlength: [100, "Category name cannot exceed 100 characters!"]
    },
    image: {
        type: String,
        required: [true, "Category image is required!"],
        trim: true
    },
    slug: {
        type: String,
        required: [true, "Slug is required!"],
        trim: true,
        unique: true
    }
}, { timestamps: true });

categorySchema.index({ name: "text" });

module.exports = model("Category", categorySchema);
