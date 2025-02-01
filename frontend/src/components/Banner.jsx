import React from "react";
import Carousel from "react-multi-carousel";
import { Link } from "react-router-dom";
import "react-multi-carousel/lib/styles.css";

const Banner = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  // Custom arrow components
  const CustomRightArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute right-4 bg-white/80 hover:bg-white transition-all duration-200 rounded-full p-2 backdrop-blur-sm"
      aria-label="Next slide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6 text-gray-800"
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
      className="absolute left-4 bg-white/80 hover:bg-white transition-all duration-200 rounded-full p-2 backdrop-blur-sm"
      aria-label="Previous slide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6 text-gray-800"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );

  // Custom dot component
  const CustomDot = ({ onClick, active }) => (
    <button
      className={`h-2 mx-1 rounded-full transition-all duration-200 ${
        active ? "w-8 bg-white" : "w-2 bg-white/50"
      }`}
      onClick={onClick}
      aria-label={active ? "Current slide" : "Go to slide"}
    />
  );

  return (
    <div className="w-full md-lg:mt-6">
      <div className="w-[85%] lg:w-[90%] mx-auto">
        <div className="w-full flex flex-wrap md-lg:gap-8">
          <div className="w-full">
            <div className="relative my-8">
              <Carousel
                autoPlay={true}
                infinite={true}
                arrows={true}
                showDots={true}
                responsive={responsive}
                customRightArrow={<CustomRightArrow />}
                customLeftArrow={<CustomLeftArrow />}
                customDot={<CustomDot />}
                autoPlaySpeed={5000}
                className="rounded-2xl overflow-hidden"
                dotListClass="flex justify-center items-center absolute bottom-4 left-0 right-0"
                renderDotsOutside={false}
                swipeable={true}
                draggable={true}
                ssr={true}
              >
                {[1, 2, 3, 4, 5, 6].map((img, i) => (
                  <Link
                    key={i}
                    to="#"
                    className="block relative w-full aspect-[21/9] md:aspect-[21/10] lg:aspect-[21/8]"
                  >
                    <img
                      src={`http://localhost:3000/images/banner/${img}.jpg`}
                      alt={`Banner slide ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    {/* Optional overlay for better text visibility if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </Link>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
