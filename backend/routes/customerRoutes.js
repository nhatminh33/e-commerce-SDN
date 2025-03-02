const customerRouter = require('express').Router();
const {
    getAllProduct, 
    getProductById,
    addWishList,
    getWishListByUserId,
    removeWishList
} = require('../controllers/customerController')

customerRouter.get('/products', getAllProduct);
customerRouter.get('/product/:id', getProductById)
customerRouter.post('/wishlist', addWishList)
customerRouter.get('/wishlist/:userId', getWishListByUserId)
customerRouter.delete('/wishlist/:userId', removeWishList)

module.exports = { customerRouter }