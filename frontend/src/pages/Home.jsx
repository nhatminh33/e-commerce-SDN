import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import FeatureProducts from "../components/products/FeatureProducts";
import { useDispatch, useSelector } from "react-redux";
import "../styles/home.css";
import { get_products } from "../store/reducers/homeReducer";

const Home = () => {
  const { products } = useSelector((state) => state.home);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [ratingFilter, setRatingFilter] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      get_products({
        categoryId: '',
        searchValue: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
    );
  }, []);

  return (
    <div className="w-full" >
      <Header />
      {/* <Banner /> */}
      <div className="flex w-[70%] lg:w-[80%] mx-auto my-10" style={{display: "flex", justifyContent:"center"}}>
          <FeatureProducts products={products} />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
