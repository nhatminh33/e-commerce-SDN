import Carousel from "react-multi-carousel";
import { Link } from "react-router-dom";
import "react-multi-carousel/lib/styles.css";

const Categories = () => {
  const categories = [
    "Mobiles",
    "Laptops",
    "Speakers",
    "Top wear",
    "Footwear",
    "Watches",
    "Home Decor",
    "Smart Watches",
  ];

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 6,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 6,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 4,
    },
    mdtablet: {
      breakpoint: { max: 991, min: 464 },
      items: 4,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 3,
    },
    smmobile: {
      breakpoint: { max: 640, min: 0 },
      items: 2,
    },
    xsmobile: {
      breakpoint: { max: 440, min: 0 },
      items: 1,
    },
  };

  // Custom arrow components
  const CustomRightArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute right-0 bg-white shadow-md hover:bg-gray-50 transition-all duration-200 rounded-full p-2 -translate-y-1/2 top-1/2"
      aria-label="Next slide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-gray-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  );

  const CustomLeftArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute left-0 bg-white shadow-md hover:bg-gray-50 transition-all duration-200 rounded-full p-2 -translate-y-1/2 top-1/2"
      aria-label="Previous slide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-gray-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );

  return (
    <div className="w-[87%] mx-auto relative py-16">
      <div className="w-full mb-12">
        <div className="text-center flex justify-center items-center flex-col">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Top Categories
          </h2>
          <div className="w-20 h-1 bg-gray-900 rounded-full"></div>
        </div>
      </div>

      <div className="px-8">
        <Carousel
          autoPlay={true}
          infinite={true}
          arrows={true}
          responsive={responsive}
          transitionDuration={500}
          customRightArrow={<CustomRightArrow />}
          customLeftArrow={<CustomLeftArrow />}
          autoPlaySpeed={3000}
          className="py-4"
          itemClass="px-2"
        >
          {categories.map((category, index) => (
            <Link className="block group" key={index} to="#">
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={`http://localhost:3000/images/products/${
                      index + 1
                    }.webp`}
                    alt={category}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block py-1.5 px-4 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-medium shadow-sm transition-all duration-200 group-hover:bg-gray-900 group-hover:text-white">
                    {category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default Categories;
