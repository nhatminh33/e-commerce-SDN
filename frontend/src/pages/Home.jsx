import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import FeatureProducts from "../components/products/FeatureProducts";
import { useSelector } from "react-redux";
import "../styles/home.css";

const Home = () => {
  const { products } = useSelector((state) => state.home);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(product => product.rating >= ratingFilter);
    }

    // Sort products
    if (sortType === "priceLowHigh") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortType === "priceHighLow") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortType, priceRange, ratingFilter]);

  return (
    <div className="w-full" >
      <Header />
      <Banner />
      <div className="flex w-[85%] lg:w-[90%] mx-auto" style={{display: "flex", justifyContent:"center"}}>
        <div className="w-3/4 p-4">
          <input
          style={{width: "70%"}} 
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border rounded"
          />

        <button style={{height: "42px"}} className='bg-[#059473] px-8 absolute font-semibold uppercase text-white' >Search</button>
        {/* right-0 absolute px-8 h-full font-semibold uppercase text-white */}
          
          <select
            style={{marginLeft: "150px"}}
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="mb-4 p-2 border rounded"
          >
            <option value="">Select Sort Type</option>
            <option value="priceLowHigh">Price: Low to High</option>
            <option value="priceHighLow">Price: High to Low</option>
          </select>
          <FeatureProducts products={filteredProducts} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
