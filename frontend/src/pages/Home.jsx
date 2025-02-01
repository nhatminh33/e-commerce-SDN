import React from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Categorys from "../components/Categorys";
import FeatureProducts from "../components/products/FeatureProducts";
import Products from "../components/products/Products";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="w-full">
      <Header />
      <Banner />
      <Categorys />
      <div className="py-[45px]">
        <FeatureProducts />
      </div>

      <div className="py-12 bg-gray-50">
        <div className="w-[85%] mx-auto">
          <div className="grid w-full grid-cols-3 md-lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-4 transition-transform duration-300 hover:shadow-md">
              <Products title="Latest Product" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 transition-transform duration-300 hover:shadow-md">
              <Products title="Top Rated Product" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 transition-transform duration-300 hover:shadow-md">
              <Products title="Discount Product" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
