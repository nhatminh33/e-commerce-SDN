import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import FeatureProducts from "../components/products/FeatureProducts";
import { useDispatch, useSelector } from "react-redux";
import { get_products } from "../store/reducers/homeReducer";
import { Range } from "react-range";
import "../styles/home.css";

const Home = () => {
  const dispatch = useDispatch();
  const { products, totalProduct } = useSelector((state) => state.home);

  const priceRange = { low: 0, high: 2000 };
  const [state, setState] = useState({ values: [0, 2000] });
  const [rating, setRating] = useState(0);
  const [sortPrice, setSortPrice] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    // Initial Fetch Without Filters
    dispatch(get_products({ page, perPage }));
  }, [dispatch, page]);

  const applyFilters = () => {
    const sortBy = sortPrice === "low-to-high" ? "price" : "price";
    const sortOrder = sortPrice === "low-to-high" ? "asc" : "desc";

    dispatch(
      get_products({
        page,
        perPage,
        minPrice: state.values[0],
        maxPrice: state.values[1],
        rating: rating || 0,
        sortBy,
        sortOrder,
      })
    );
  };

  return (
    <div className="w-full">
      <Header />
      <div className="banner-container">
        <Banner />
      </div>

      <div className="flex w-[85%] lg:w-[90%] mx-auto">
        {/* Sidebar Filters */}
        <aside className="w-1/4 p-4 border-r border-gray-200">
          {/* Price Filter */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-slate-600">Price</h2>
            <Range
              step={1000}
              min={priceRange.low}
              max={priceRange.high}
              values={state.values}
              onChange={(values) => setState({ values })}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  className="w-full h-[6px] bg-slate-200 rounded-full cursor-pointer"
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  className="w-[15px] h-[15px] bg-[#059473] rounded-full"
                />
              )}
            />
            <div>
              <span className="text-slate-800 font-bold text-lg">
                ${Math.floor(state.values[0])} - ${Math.floor(state.values[1])}
              </span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-slate-600">Rating</h2>
            <input
              type="number"
              value={rating}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setRating(value >= 1 && value <= 5 ? value : 0);
              }}
              min={1}
              max={5}
              className="w-full p-2 border rounded-lg outline-none"
              placeholder="Enter rating (1 - 5)"
            />
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={applyFilters}
            className="px-4 py-2 mt-4 bg-blue-500 text-white rounded-lg"
          >
            Apply Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className="w-3/4 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-600">
              ({totalProduct}) Products
            </h2>
            <div className="flex items-center gap-4">
              <select
                onChange={(e) => setSortPrice(e.target.value)}
                className="p-1 border outline-0 text-slate-600 font-semibold"
              >
                <option value="">Sort By</option>
                <option value="low-to-high">Low to High Price</option>
                <option value="high-to-low">High to Low Price</option>
              </select>
            </div>
          </div>
          {/* <FeatureProducts products={products} /> */}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
