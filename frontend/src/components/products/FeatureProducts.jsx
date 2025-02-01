import { FaEye, FaRegHeart } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from "../Rating";

const FeatureProducts = () => {
  return (
    <div className="w-[85%] flex flex-wrap mx-auto py-16">
      <div className="w-full mb-12">
        <div className="text-center flex justify-center items-center flex-col">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Featured Products
          </h2>
          <div className="w-20 h-1 bg-gray-900 rounded-full"></div>
        </div>
      </div>

      <div className="w-full grid grid-cols-4 md-lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
        {[1, 2, 3, 4, 5, 6].map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg"
          >
            <div className="relative">
              {/* Discount Badge */}
              <div className="absolute z-10 left-3 top-3">
                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-red-500 font-medium text-white text-sm shadow-sm">
                  8%
                </div>
              </div>

              {/* Product Image Container */}
              <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                <img
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  src={`http://localhost:3000/images/products/${i + 1}.webp`}
                  alt={`Product ${i + 1}`}
                />

                {/* Overlay with Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Action Buttons */}
                <ul className="flex justify-center items-center gap-3 absolute left-0 right-0 bottom-0 transform translate-y-full group-hover:translate-y-[-16px] transition-transform duration-300">
                  <li className="w-10 h-10 cursor-pointer bg-white rounded-full flex justify-center items-center shadow-md hover:bg-gray-900 hover:text-white transition-all duration-200">
                    <FaRegHeart className="w-4 h-4" />
                  </li>
                  <li className="w-10 h-10 cursor-pointer bg-white rounded-full flex justify-center items-center shadow-md hover:bg-gray-900 hover:text-white transition-all duration-200">
                    <FaEye className="w-4 h-4" />
                  </li>
                  <li className="w-10 h-10 cursor-pointer bg-white rounded-full flex justify-center items-center shadow-md hover:bg-gray-900 hover:text-white transition-all duration-200">
                    <RiShoppingCartLine className="w-4 h-4" />
                  </li>
                </ul>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h2 className="font-semibold text-gray-800 mb-2">
                  Product Name
                </h2>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">$656</span>
                  <div className="flex">
                    <Rating ratings={4.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureProducts;
