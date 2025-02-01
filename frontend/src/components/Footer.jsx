import { Link } from "react-router-dom";
import { FaFacebookF, FaLinkedin, FaGithub } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="w-[85%] flex flex-wrap mx-auto py-16 md-lg:pb-10 sm:pb-6">
        {/* Company Info */}
        <div className="w-3/12 lg:w-4/12 sm:w-full pr-8">
          <div className="flex flex-col gap-6">
            <img
              className="w-[160px]"
              src="http://localhost:3000/images/logo.png"
              alt="logo"
            />
            <ul className="flex flex-col gap-3 text-gray-600">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-gray-400 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm leading-relaxed">
                  2504 Ivins Avenue, Egg Harbor Township, NJ 08234
                </span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm">434-343-4344</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">support@easylearingbd.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Useful Links */}
        <div className="w-5/12 lg:w-8/12 sm:w-full">
          <div className="flex justify-center sm:justify-start sm:mt-6 w-full">
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-6">
                Useful Links
              </h2>
              <div className="flex justify-between gap-[80px] lg:gap-[40px]">
                <ul className="flex flex-col gap-3">
                  {[
                    "About Us",
                    "About Our Shop",
                    "Delivery Information",
                    "Privacy Policy",
                    "Blogs",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
                        to="#"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>

                <ul className="flex flex-col gap-3">
                  {[
                    "Our Service",
                    "Company Profile",
                    "Delivery Information",
                    "Privacy Policy",
                    "Blogs",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
                        to="#"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="w-4/12 lg:w-full lg:mt-6">
          <div className="w-full flex flex-col justify-start gap-5">
            <h2 className="font-bold text-gray-800 text-lg mb-2">
              Join Our Shop
            </h2>
            <p className="text-gray-600 text-sm">
              Get email updates about our latest shop and special offers
            </p>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors duration-200 text-sm"
                type="email"
                placeholder="Enter your email"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors duration-200">
                Subscribe
              </button>
            </div>
            <ul className="flex gap-3 mt-2">
              {[
                { icon: <FaFacebookF />, href: "#" },
                { icon: <FaTwitter />, href: "#" },
                { icon: <FaLinkedin />, href: "#" },
                { icon: <FaGithub />, href: "#" },
              ].map((social, index) => (
                <li key={index}>
                  <a
                    href={social.href}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-100">
        <div className="w-[90%] mx-auto py-6 text-center">
          <span className="text-gray-600 text-sm">
            Copyright © 2024 All Rights Reserved
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
