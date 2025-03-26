import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import FeatureProducts from "../components/products/FeatureProducts";
import { useDispatch, useSelector } from "react-redux";
import "../styles/home.css";
import { get_category, get_products } from "../store/reducers/homeReducer";

const Home = () => {
  const { products, categorys, totalProducts, perPage, currentPage, pages } = useSelector((state) => state.home);
  const [category, setCategory] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const dispatch = useDispatch();

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(get_category());
  }, [dispatch]);

  // Handle search submit from header
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  // Handle category change from header
  const handleCategoryChange = (catId) => {
    setCategory(catId);
  };

  // Change page
  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  // Handle items per page change
  const handlePerPageChange = (newPerPage) => {
    fetchProducts(1, newPerPage);
  };

  // Fetch products with filters
  const fetchProducts = (page = currentPage || 1, itemsPerPage = perPage || 10) => {
    dispatch(
      get_products({
        page,
        perPage: itemsPerPage,
        categoryId: category,
        searchValue: searchValue,
        sortBy,
        sortOrder,
      })
    );
  };

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts(1);
  }, [category, searchValue, sortBy, sortOrder]);

  return (
    <div className="w-full" >
      <Header 
        categorys={categorys}
        currentCategory={category} 
        onCategoryChange={handleCategoryChange}
        searchValue={searchValue} 
        onSearch={handleSearch} 
      />
      {/* <Banner /> */}
      <div className="flex w-[70%] lg:w-[80%] mx-auto my-10" style={{display: "flex", justifyContent:"center"}}>
        <FeatureProducts 
          products={products} 
          totalProducts={totalProducts}
          currentPage={currentPage}
          perPage={perPage}
          pages={pages}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
