import { useState } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { Link } from "react-router-dom"
import { IoIosArrowForward } from "react-icons/io"
import { Range } from "react-range"
import { AiFillStar } from "react-icons/ai"
import { CiStar } from "react-icons/ci"
import Products from "../components/products/Products"
import { BsFillGridFill } from "react-icons/bs"
import { FaThList } from "react-icons/fa"
import ShopProducts from "../components/products/ShopProducts"
import Pagination from "../components/Pagination"

const Shops = () => {
  const [filter, setFilter] = useState(true)
  const categorys = ["Mobiles", "Laptops", "Speakers", "Top wear", "Footwear", "Watches", "Home Decor", "Smart Watches"]

  const [state, setState] = useState({ values: [50, 1500] })
  const [rating, setRating] = useState("")
  const [styles, setStyles] = useState("grid")
  const [parPage, setParPage] = useState(1)
  const [pageNumber, setPageNumber] = useState(1)

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
            <h2 className="text-4xl font-bold mb-4">Shop Page</h2>
            <div className="flex items-center gap-3 text-lg">
              <Link to="/" className="hover:text-gray-200 transition-colors">
                Home
              </Link>
              <IoIosArrowForward className="mt-0.5" />
              <span>Shop</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] mx-auto">
          {/* Mobile Filter Toggle */}
          <div className={`md:block hidden ${!filter ? "mb-6" : "mb-0"}`}>
            <button
              onClick={() => setFilter(!filter)}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Filter Products
            </button>
          </div>

          <div className="flex flex-wrap gap-8">
            {/* Sidebar Filters */}
            <div
              className={`w-3/12 md-lg:w-4/12 md:w-full ${
                filter ? "md:h-0 md:overflow-hidden md:mb-6" : "md:h-auto md:overflow-auto md:mb-0"
              }`}
            >
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {/* Categories */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
                  <div className="space-y-2">
                    {categorys.map((c, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          id={c}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <label className="ml-3 text-gray-600 text-sm cursor-pointer hover:text-gray-900" htmlFor={c}>
                          {c}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Price Range</h2>
                  <div className="px-2">
                    <Range
                      step={5}
                      min={50}
                      max={1500}
                      values={state.values}
                      onChange={(values) => setState({ values })}
                      renderTrack={({ props, children }) => (
                        <div {...props} className="w-full h-1 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-gray-900 rounded-full"
                            style={{
                              width: `${((state.values[1] - state.values[0]) / (1500 - 50)) * 100}%`,
                              left: `${((state.values[0] - 50) / (1500 - 50)) * 100}%`,
                              position: "absolute",
                            }}
                          />
                          {children}
                        </div>
                      )}
                      renderThumb={({ props }) => (
                        <div {...props} className="w-4 h-4 bg-gray-900 rounded-full shadow focus:outline-none" />
                      )}
                    />
                    <div className="mt-4 text-gray-800">
                      ${Math.floor(state.values[0])} - ${Math.floor(state.values[1])}
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Rating</h2>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1, 0].map((stars) => (
                      <div
                        key={stars}
                        onClick={() => setRating(stars)}
                        className="flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors"
                      >
                        {[...Array(5)].map((_, index) => (
                          <span key={index} className="text-xl text-amber-400">
                            {index < stars ? <AiFillStar /> : <CiStar />}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Products */}
                <div className="md:hidden">
                  <Products title="Latest Products" />
                </div>
              </div>
            </div>

            {/* Product Grid/List */}
            <div className="w-9/12 md-lg:w-8/12 md:w-full">
              {/* Toolbar */}
              <div className="bg-white rounded-xl p-4 mb-8 shadow-sm flex justify-between items-center">
                <h2 className="text-gray-800 font-medium">14 Products</h2>
                <div className="flex items-center gap-4">
                  <select className="px-3 py-2 border rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900">
                    <option value="">Sort By</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>
                  <div className="flex items-center gap-2 md-lg:hidden">
                    <button
                      onClick={() => setStyles("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        styles === "grid" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <BsFillGridFill />
                    </button>
                    <button
                      onClick={() => setStyles("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        styles === "list" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <FaThList />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="mb-8">
                <ShopProducts styles={styles} />
              </div>

              {/* Pagination */}
              <div>
                <Pagination
                  pageNumber={pageNumber}
                  setPageNumber={setPageNumber}
                  totalItem={10}
                  parPage={parPage}
                  showItem={Math.floor(10 / 3)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Shops

