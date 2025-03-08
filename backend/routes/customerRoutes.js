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

const {
    placeOrder ,
    cancelOrder,
    confirmOrder,
    updateOrderStatusDeliveried
} = require('../controllers/orderController');

customerRouter.get('/products', getAllProduct); //ok
customerRouter.get('/product/:id', getProductById)//ok
customerRouter.post('/wishlist', addWishList) //ok
customerRouter.get('/wishlist/:userId', getWishListByUserId) //ok
customerRouter.delete('/wishlist/:userId', removeProductFromWishList) //ok

customerRouter.get('/cart/:userId', getCartByUserId) //ok
customerRouter.post('/add-to-cart', addToCart) //ok
customerRouter.put('/remove-many-item-from-cart', removeManyItemFromCart) //ok
customerRouter.put('/update-cart-item-quantity', updateCartItemQuantity) //ok
customerRouter.post('/clear-cart', clearCart) //ok

customerRouter.post('/order', placeOrder), //ok
customerRouter.put('/cancel-order', cancelOrder), //ok
customerRouter.put('/confirm-order', confirmOrder), //con thanh toan
customerRouter.put('/update-order-status-deliveried', updateOrderStatusDeliveried) //ok 

module.exports = { customerRouter }