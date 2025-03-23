const { responseReturn } = require("../utiles/response");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const mongoose = require("mongoose");
const getAllProduct = async (req, res) => {
    try {
        const products = await productModel.find()
            .populate("sellerId", "name email image status -_id")
            .populate("categoryId", "name -_id");
        responseReturn(res, 200, { success: true, data: products });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return responseReturn(res, 400, { error: "Invalid product ID" });
        }
        const product = await productModel.findById(id)
            .populate("sellerId", "name email image status")
            .populate("categoryId", "name -_id");
        if (!product) {
            return responseReturn(res, 404, { error: "Product not found" });
        }
        responseReturn(res, 200, { success: true, data: product });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const getWishListByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return responseReturn(res, 400, { error: "User ID is required" });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return responseReturn(res, 400, { error: "Invalid user ID format" });
        }

        // Find all wishlist items for this user
        const wishlist = await wishlistModel
            .find({ userId })
            .populate({
                path: "productId",
                populate: [
                    { path: "sellerId", select: "name email image status" },
                    { path: "categoryId", select: "name" }
                ]
            })
            .populate("userId", "name email");

        // Handle empty wishlist
        if (!wishlist || wishlist.length === 0) {
            return responseReturn(res, 200, { 
                wishlistData: {
                    user: {
                        id: userId,
                        products: []
                    }
                } 
            });
        }

        // Extract products from wishlist
        const products = wishlist.map(item => item.productId);
        
        // Prepare user data
        const user = {
            id: wishlist[0].userId._id,
            name: wishlist[0].userId.name,
            email: wishlist[0].userId.email,
            products: products
        };

        // Return the formatted wishlist data
        responseReturn(res, 200, { 
            success: true,
            data: { user } 
        });
    } catch (error) {
        console.error("Wishlist error:", error);
        responseReturn(res, 500, { error: true, message: error.message });
    }
};

const removeProductFromWishList = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;

        // Validate inputs
        if (!userId || !productId) {
            return responseReturn(res, 400, { 
                success: false,
                message: "Both user ID and product ID are required" 
            });
        }

        // Validate ID formats
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return responseReturn(res, 400, { 
                success: false,
                message: "Invalid ID format" 
            });
        }

        // Check if item exists in wishlist
        const existingItem = await wishlistModel.findOne({ userId, productId });
        if (!existingItem) {
            return responseReturn(res, 404, { 
                success: false,
                message: "Product not found in wishlist" 
            });
        }
        
        responseReturn(res, 200, { 
            success: true,
            message: "Product removed from wishlist successfully",
        });
    } catch (error) {
        console.error("Remove wishlist error:", error);
        responseReturn(res, 500, { 
            success: false,
            message: "Failed to remove product from wishlist",
            error: error.message 
        });
    }
};

const addWishList = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const existingWishlist = await wishlistModel.findOne({ userId, productId });

        if (existingWishlist) {
            return responseReturn(res, 400, { error: true, message: "Product already exists in wishlist" });
        }

        await wishlistModel.create({ userId, productId });
        responseReturn(res, 200, { success: true, message: "Product added to wishlist" });
    } catch (error) {
        responseReturn(res, 500, { error: true, message: error.message });
    }
};


module.exports = { 
    getAllProduct,
    getProductById,
    addWishList,
    getWishListByUserId,
    removeProductFromWishList,
};