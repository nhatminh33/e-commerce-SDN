import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

const Cart = () => {
  const navigate = useNavigate();
  const cart_products = [1, 2];
  const outOfStockProduct = [1, 2];

  const redirect = () => {
    navigate("/shipping", {
      state: {
        products: [],
        price: 500,
        shipping_fee: 40,
        items: 2,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="relative h-[220px] mt-6">
        <div className="absolute inset-0">
          <img
            src="http://localhost:3000/images/banner/shop.png"
            alt="Shop Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative h-full w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] mx-auto">
          <div className="flex flex-col justify-center items-center h-full text-white">
            <h2 className="text-3xl font-bold mb-3">Shopping Cart</h2>
            <div className="flex items-center gap-2 text-lg">
              <Link to="/" className="hover:text-gray-200 transition-colors">
                Home
              </Link>
              <IoIosArrowForward className="mt-0.5" />
              <span>Cart</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="w-[85%] lg:w-[90%] md:w-[90%] sm:w-[90%] mx-auto">
          {cart_products.length > 0 || outOfStockProduct > 0 ? (
            <div className="flex flex-wrap gap-6">
              {/* Cart Items */}
              <div className="flex-1 md-lg:w-full">
                <div className="space-y-4">
                  {/* In Stock Products */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                      <h2 className="text-green-600 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        In Stock ({cart_products.length})
                      </h2>
                    </div>

                    {cart_products.map((p, i) => (
                      <div key={i} className="p-4 border-b last:border-0">
                        <div className="text-gray-800 font-medium mb-3 pb-2 border-b">
                          Easy Shop
                        </div>

                        {[1, 2].map((p, j) => (
                          <div
                            key={j}
                            className="flex gap-4 py-3 border-b last:border-0"
                          >
                            <div className="flex gap-4 flex-1 sm:flex-col">
                              <img
                                className="w-20 h-20 object-cover rounded-md"
                                src={`http://localhost:3000/images/products/${
                                  j + 1
                                }.webp`}
                                alt={`Product ${j + 1}`}
                              />
                              <div>
                                <h3 className="font-medium text-gray-800">
                                  Product Name
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Brand: Jara
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-6 sm:flex-col">
                              <div className="text-right sm:text-left">
                                <div className="text-lg font-medium text-gray-800">
                                  $240
                                </div>
                                <div className="text-sm text-gray-400 line-through">
                                  $300
                                </div>
                                <div className="text-sm text-green-600">
                                  -15%
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 items-end sm:items-start">
                                <div className="flex items-center bg-gray-50 rounded-md">
                                  <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
                                    <FiMinus className="w-4 h-4" />
                                  </button>
                                  <span className="w-10 text-center font-medium">
                                    2
                                  </span>
                                  <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
                                    <FiPlus className="w-4 h-4" />
                                  </button>
                                </div>
                                <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors">
                                  <FiTrash2 className="w-4 h-4" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Out of Stock Products */}
                  {outOfStockProduct.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4 border-b">
                        <h2 className="text-red-600 font-medium flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          Out of Stock ({outOfStockProduct.length})
                        </h2>
                      </div>

                      <div className="p-4">
                        {[1].map((p, i) => (
                          <div key={i} className="flex gap-4 py-3 opacity-60">
                            <div className="flex gap-4 flex-1 sm:flex-col">
                              <img
                                className="w-20 h-20 object-cover rounded-md"
                                src={`http://localhost:3000/images/products/${
                                  i + 1
                                }.webp`}
                                alt={`Product ${i + 1}`}
                              />
                              <div>
                                <h3 className="font-medium text-gray-800">
                                  Product Name
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Brand: Jara
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-6 sm:flex-col">
                              <div className="text-right sm:text-left">
                                <div className="text-lg font-medium text-gray-800">
                                  $240
                                </div>
                                <div className="text-sm text-gray-400 line-through">
                                  $300
                                </div>
                                <div className="text-sm text-green-600">
                                  -15%
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 items-end sm:items-start">
                                <div className="flex items-center bg-gray-50 rounded-md">
                                  <button
                                    disabled
                                    className="w-8 h-8 flex items-center justify-center text-gray-400"
                                  >
                                    <FiMinus className="w-4 h-4" />
                                  </button>
                                  <span className="w-10 text-center font-medium text-gray-400">
                                    2
                                  </span>
                                  <button
                                    disabled
                                    className="w-8 h-8 flex items-center justify-center text-gray-400"
                                  >
                                    <FiPlus className="w-4 h-4" />
                                  </button>
                                </div>
                                <button className="flex items-center gap-1 text-sm text-red-600/60">
                                  <FiTrash2 className="w-4 h-4" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-[360px] md-lg:w-full">
                {cart_products.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-5 sticky top-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                      Order Summary
                    </h2>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Items (2)</span>
                        <span>$343</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping Fee</span>
                        <span>$40</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center text-gray-800">
                          <span className="font-medium">Total</span>
                          <span className="text-xl font-bold">$430</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          className="flex-1 px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                          type="text"
                          placeholder="Enter coupon code"
                        />
                        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                          Apply
                        </button>
                      </div>

                      <button
                        onClick={redirect}
                        className="w-full py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link
                to="/shops"
                className="inline-flex px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
