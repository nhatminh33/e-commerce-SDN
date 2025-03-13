const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { responseReturn } = require("../utiles/response");
const userModel = require("../models/userModel");


const getCartByUserId = async (req, res) => {
  try {
      const { userId } = req.params;

      // Populate đầy đủ thông tin sản phẩm
      const cartItems = await cartModel.find({ userId }).populate({
          path: "productId",
          model: productModel, // Chắc chắn lấy từ model sản phẩm
          select: "name price discount stock images categoryId description rating",
          populate: {
              path: "categoryId",
              select: "name"
          }
      });

      if (!cartItems.length) {
          return res.status(200).json({ success: true, message: "Cart is empty!", products: [] });
      }

      // Kiểm tra xem dữ liệu có đầy đủ không
      const productsInCart = cartItems.map(cartItem => {
          const product = cartItem.productId;
          if (!product || !product.price) {
              console.warn(`Missing product details for cart item: ${cartItem._id}`);
              return null; // Bỏ qua nếu sản phẩm không hợp lệ
          }

          return {
              item: {
                itemId: cartItem._id,
                productId: product._id,
                name: product.name || "Unknown",
                price: product.price || 0,
                discount: product.discount || 0,
                stock: product.stock || 0,
                images: product.images?.length ? product.images : ["https://example.com/default-image.jpg"],
                category: product.categoryId ? { name: product.categoryId.name } : { name: "Unknown" },
                description: product.description || "No description available",
                rating: product.rating || 0,
                quantity: cartItem.quantity,
                total: cartItem.quantity * (product.price - (product.price * product.discount) / 100)
              }
              
          };
      }).filter(item => item !== null); // Loại bỏ null

      return res.status(200).json({
          success: true,
          message: "Cart retrieved successfully!",
          cart: productsInCart
      });

  } catch (error) {
      console.error("Error fetching cart:", error);
      return res.status(500).json({ success: false, message: "Internal server error!" });
  }
};
    
  const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Kiểm tra userId hợp lệ không
        const user = await userModel.findById(userId).select("name email role image");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Kiểm tra productId hợp lệ không
        const product = await productModel.findById(productId)
            .populate("categoryId", "name")
            .select("name price discount images categoryId description rating stock");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }

        // Kiểm tra số lượng sản phẩm có đủ không
        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: "Not enough stock available!" });
        }

        // Tính tổng tiền sau khi áp dụng giảm giá
        const discountedPrice = product.price * (1 - product.discount / 100);
        const total = discountedPrice * quantity;

        // Kiểm tra xem user đã có giỏ hàng chưa
        let cartItem = await cartModel.findOne({ userId, productId });

        if (cartItem) {
            // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng và tổng tiền
            cartItem.quantity += quantity;
            cartItem.total += total;
        } else {
            // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới
            cartItem = new cartModel({
                userId,
                productId,
                quantity,
                total
            });
        }

        // Lưu vào database
        await cartItem.save();

        // Lấy lại dữ liệu đầy đủ của user và product để trả về chi tiết
        const responseCartItem = {
            _id: cartItem._id,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image
            },
            product: {
                name: product.name,
                price: product.price,
                discount: product.discount,
                stock: product.stock,
                images: product.images,
                categoryId: { name: product.categoryId.name },
                description: product.description,
                rating: product.rating
            },
            quantity: cartItem.quantity,
            total: cartItem.total,
            createdAt: cartItem.createdAt,
            updatedAt: cartItem.updatedAt
        };

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully!",
            cartItem: responseCartItem
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};

const removeManyItemFromCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid productIds list" });
    }

    // Chuyển đổi sang ObjectId
    const productObjectIds = productIds.map(id => new mongoose.Types.ObjectId(id));

    // Xóa tất cả sản phẩm có productId trong danh sách
    const deleteResult = await cartModel.deleteMany({ 
        userId: new mongoose.Types.ObjectId(userId), 
        productId: { $in: productObjectIds }
    });

    if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "No matching products found in cart" });
    }

    return res.status(200).json({
        success: true,
        message: `${deleteResult.deletedCount} products removed from cart`
    });

} catch (error) {
    console.error("Error removing items from cart:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
}
};
const updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity === undefined || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const cartItem = await cartModel.findOne({ userId: userObjectId, productId: productObjectId });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    // Populate product data
    const product = await productModel.findById(productObjectId).select("price discount");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Kiểm tra giá trị price và discount
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;

    // Đảm bảo price không bị undefined hoặc null
    if (isNaN(price) || isNaN(discount)) {
      return res.status(400).json({ success: false, message: "Invalid product price or discount" });
    }

    // Tính giá đã giảm
    const discountedPrice = price - (price * discount) / 100;

    // Cập nhật số lượng và tổng tiền
    cartItem.quantity = quantity;
    cartItem.total = quantity * discountedPrice;

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully!",
      updatedCartItem: cartItem,
    });

  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

  const clearCart = async (req, res) => {
    const { userId } = req.body;
    try {
      if (!userId) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid user ID"
        });
      }
  
      const result = await cartModel.deleteMany({ userId });
      
      return res.status(200).json({
        success: true,
        message: `Cart cleared successfully. ${result.deletedCount} items removed`,
        itemsRemoved: result.deletedCount
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to clear cart",
        error: error.message
      });
    }
  };

module.exports = { 
    getCartByUserId,
    addToCart,
    removeManyItemFromCart,
    updateCartItemQuantity,
    clearCart,
};