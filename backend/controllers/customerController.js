const { responseReturn } = require("../utiles/response");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const mongoose = require("mongoose");
const getAllProduct = async (req, res) => {
    try {
        const products = await productModel.find()
            .populate("sellerId", "name email image status")
            .populate("categoryId", "name");
        responseReturn(res, 200, { products });
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
        const product = await productModel.findById(id);
        if (!product) {
            return responseReturn(res, 404, { error: "Product not found" });
        }
        responseReturn(res, 200, { product });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const getWishListByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const wishlist = await wishlistModel
            .find({ userId }) // Lọc theo userId
            .populate("productId") // Lấy chi tiết sản phẩm
            .populate("userId", "name email"); // Lấy chi tiết user (chỉ lấy name & email)

        const products = wishlist.map(item => item.productId);
        const user = {
            id: wishlist[0].userId._id,
            name: wishlist[0].userId.name,
            email: wishlist[0].userId.email,
            products: products
        }
        
        const wishlistData = {
            user
        }
        responseReturn(res, 200, { wishlistData });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const removeWishList = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;
        const wishlist = await wishlistModel.findOneAndDelete({ userId, productId });
        responseReturn(res, 200, { wishlist });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const addWishList = async (req, res) => {
    try{
        const {userId, productId} = req.body;
        const wishlist = await wishlistModel.create({userId, productId});
        responseReturn(res, 200, { wishlist });
    }catch(error){
        responseReturn(res, 500, { error: error.message });
    }
};

module.exports = { 
    getAllProduct,
    getProductById,
    addWishList,
    getWishListByUserId,
    removeWishList 
};