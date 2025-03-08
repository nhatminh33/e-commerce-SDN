const customerRouter = require('express').Router();
const {
    getAllProduct, 
    getProductById,
    addWishList,
    getWishListByUserId,
    removeProductFromWishList
} = require('../controllers/customerController');

const {
    getCartByUserId,
    addToCart,
    removeManyItemFromCart,
    updateCartItemQuantity,
    clearCart,
} = require('../controllers/cartController');

customerRouter.get('/products', getAllProduct); //ok
customerRouter.get('/product/:id', getProductById)//ok
customerRouter.post('/wishlist', addWishList) //ok
customerRouter.get('/wishlist/:userId', getWishListByUserId) //ok
customerRouter.delete('/wishlist/:userId', removeProductFromWishList) //ok

customerRouter.get('/cart/:userId', getCartByUserId)
customerRouter.post('/add-to-cart', addToCart)
customerRouter.put('/remove-many-item-from-cart', removeManyItemFromCart)
customerRouter.put('/update-cart-item-quantity', updateCartItemQuantity)
customerRouter.post('/clear-cart', clearCart)

module.exports = { customerRouter }