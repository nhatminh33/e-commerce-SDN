import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { IoMdPhonePortrait } from "react-icons/io";
import { FaFacebookF, FaList, FaLock, FaUser } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import { FaHeart } from "react-icons/fa6";
import { FaCartShopping } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

const Header = () => {
  const { pathname } = useLocation()

  const [showShidebar, setShowShidebar] = useState(true)
  const [categoryShow, setCategoryShow] = useState(true)
  const user = true
  const wishlist_count = 3
  const categorys = ["Mobiles", "Laptops", "Speakers", "Top wear", "Footwear", "Watches", "Home Decor", "Smart Watches"]

  const [searchValue, setSearchValue] = useState("")
  const [category, setCategory] = useState("")

  return (
    <div className="w-full bg-white shadow-sm">
      {/* Top Bar */}
      <div className="header-top bg-white border-b md-lg:hidden">
        <div className="w-[85%] lg:w-[90%] mx-auto">
          <div className="flex w-full justify-between items-center h-[50px] text-gray-600">
            <ul className="flex justify-start items-center gap-8">
              <li className="flex relative justify-center items-center gap-2 text-sm after:absolute after:h-[18px] after:w-[1px] after:bg-gray-200 after:-right-[16px]">
                <MdEmail className="text-gray-400" />
                <span>support@gmail.com</span>
              </li>
              <li className="flex relative justify-center items-center gap-2 text-sm">
                <IoMdPhonePortrait className="text-gray-400" />
                <span>+(123) 3243 343</span>
              </li>
            </ul>

            <div className="flex justify-center items-center gap-8">
              <div className="flex justify-center items-center gap-6 text-gray-400">
                <a href="#" className="hover:text-gray-600 transition-colors">
                  <FaFacebookF />
                </a>
                <a href="#" className="hover:text-gray-600 transition-colors">
                  <FaTwitter />
                </a>
                <a href="#" className="hover:text-gray-600 transition-colors">
                  <FaLinkedin />
                </a>
                <a href="#" className="hover:text-gray-600 transition-colors">
                  <FaGithub />
                </a>
              </div>

              <div className="flex group cursor-pointer text-gray-600 text-sm justify-center items-center gap-1 relative px-4 border-x border-gray-100">
                <img src="http://localhost:3000/images/language.png" alt="" className="w-5 h-5" />
                <IoMdArrowDropdown />
                <ul className="absolute invisible transition-all top-12 rounded-md duration-200 text-gray-600 p-2 w-[100px] flex flex-col gap-3 group-hover:visible group-hover:top-6 group-hover:bg-white group-hover:shadow-lg z-10">
                  <li className="hover:text-gray-900">Hindi</li>
                  <li className="hover:text-gray-900">English</li>
                </ul>
              </div>

              {user ? (
                <Link
                  className="flex cursor-pointer justify-center items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  to="/dashboard"
                >
                  <FaUser />
                  <span>Kazi Ariyan</span>
                </Link>
              ) : (
                <Link
                  className="flex cursor-pointer justify-center items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  to="/login"
                >
                  <FaLock />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white">
        <div className="w-[85%] lg:w-[90%] mx-auto">
          <div className="h-[80px] md-lg:h-[100px] flex justify-between items-center flex-wrap">
            <div className="md-lg:w-full w-3/12 md-lg:pt-4">
              <div className="flex justify-between items-center">
                <Link to="/">
                  <img src="http://localhost:3000/images/logo.png" alt="" className="h-12"   style={{ width: '236px', height: '76px', borderRadius: '12px' }} />
                </Link>
                <button
                  className="justify-center items-center w-10 h-10 bg-white text-gray-600 border border-gray-200 rounded-md cursor-pointer lg:hidden md-lg:flex xl:hidden hidden hover:bg-gray-50 transition-colors"
                  onClick={() => setShowShidebar(false)}
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md-lg:w-full w-9/12">
              <div className="flex justify-between md-lg:justify-center items-center flex-wrap pl-8">
                <ul className="flex justify-start items-start gap-8 text-sm font-medium md-lg:hidden">
                  <li>
                    <Link
                      to="/"
                      className={`p-2 block transition-colors ${
                        pathname === "/" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shops"
                      className={`p-2 block transition-colors ${
                        pathname === "/shops" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Shop
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      className={`p-2 block transition-colors ${
                        pathname === "/blog" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className={`p-2 block transition-colors ${
                        pathname === "/about" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className={`p-2 block transition-colors ${
                        pathname === "/contact" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>

                <div className="flex md-lg:hidden justify-center items-center gap-5">
                  <div className="flex justify-center gap-5">
                    <div className="relative flex justify-center items-center cursor-pointer w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                      <FaHeart className="w-5 h-5 text-gray-600" />
                      {wishlist_count > 0 && (
                        <div className="w-5 h-5 absolute bg-gray-900 rounded-full text-white flex justify-center items-center text-xs -top-1 -right-1">
                          {wishlist_count}
                        </div>
                      )}
                    </div>

                    <div className="relative flex justify-center items-center cursor-pointer w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                      <FaCartShopping className="w-5 h-5 text-gray-600" />
                      {wishlist_count > 0 && (
                        <div className="w-5 h-5 absolute bg-gray-900 rounded-full text-white flex justify-center items-center text-xs -top-1 -right-1">
                          {wishlist_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="hidden md-lg:block">
        <div
          onClick={() => setShowShidebar(true)}
          className={`fixed duration-200 transition-all ${
            showShidebar ? "invisible" : "visible"
          } hidden md-lg:block w-screen h-screen bg-black/50 backdrop-blur-sm top-0 left-0 z-20`}
        />

        <div
          className={`w-[300px] z-[9999] transition-all duration-200 fixed ${
            showShidebar ? "-left-[300px]" : "left-0 top-0"
          } overflow-y-auto bg-white h-screen py-6 px-8 shadow-xl`}
        >
          {/* Mobile Sidebar Content */}
          <div className="flex justify-start flex-col gap-6">
            <Link to="/">
              <img src="http://localhost:3000/images/logo.png" alt="" className="h-8" />
            </Link>
            <div className="flex justify-start items-center gap-10">
              <div className="flex group cursor-pointer text-slate-800 text-sm justify-center items-center gap-1 relative after:h-[18px] after:w-[1px] after:bg-[#afafaf] after:-right-[16px] after:absolute ">
                <img src="http://localhost:3000/images/language.png" alt="" />
                <span>
                  <IoMdArrowDropdown />
                </span>
                <ul className="absolute invisible transition-all top-12 rounded-sm duration-200 text-white p-2 w-[100px] flex flex-col gap-3 group-hover:visible group-hover:top-6 group-hover:bg-black z-10">
                  <li>Hindi</li>
                  <li>English</li>
                </ul>
              </div>
              {user ? (
                <Link
                  className="flex cursor-pointer justify-center items-center gap-2 text-sm text-black"
                  to="/dashboard"
                >
                  <span>
                    {" "}
                    <FaUser />{" "}
                  </span>
                  <span>Kazi Ariyan </span>
                </Link>
              ) : (
                <Link className="flex cursor-pointer justify-center items-center gap-2 text-sm text-black" to="/login">
                  <span>
                    {" "}
                    <FaLock />{" "}
                  </span>
                  <span>Login </span>
                </Link>
              )}
            </div>

            <ul className="flex flex-col justify-start items-start text-sm font-bold uppercase">
              <li>
                <Link className={`py-2 block ${pathname === "/" ? "text-[#059473]" : "text-slate-600"} `}>Home</Link>
              </li>

              <li>
                <Link to='/shops' className={`py-2 block ${pathname === "/shops" ? "text-[#059473]" : "text-slate-600"} `}>
                  Shop
                </Link>
              </li>
              <li>
                <Link className={`py-2 block ${pathname === "/blog" ? "text-[#059473]" : "text-slate-600"} `}>
                  Blog
                </Link>
              </li>
              <li>
                <Link className={`py-2 block ${pathname === "/about" ? "text-[#059473]" : "text-slate-600"} `}>
                  About Us
                </Link>
              </li>
              <li>
                <Link className={`py-2 block ${pathname === "/contact" ? "text-[#059473]" : "text-slate-600"} `}>
                  Contact Us
                </Link>
              </li>
            </ul>
            <div className="flex justify-start items-center gap-4 text-black">
              <a href="#">
                <FaFacebookF />
              </a>
              <a href="#">
                <FaTwitter />{" "}
              </a>
              <a href="#">
                <FaLinkedin />
              </a>
              <a href="#">
                <FaGithub />{" "}
              </a>
            </div>

            <div className="w-full flex justify-end md-lg:justify-start gap-3 items-center">
              <div className="w-[48px] h-[48px] rounded-full flex bg-[#f5f5f5] justify-center items-center ">
                <span>
                  <FaPhoneAlt />
                </span>
              </div>
              <div className="flex justify-end flex-col gap-1">
                <h2 className="text-sm font-medium text-slate-700">+134343455</h2>
                <span className="text-xs">Support 24/7</span>
              </div>
            </div>

            <ul className="flex flex-col justify-start items-start gap-3 text-[#1c1c1c]">
              <li className="flex justify-start items-center gap-2 text-sm">
                <span>
                  <MdEmail />
                </span>
                <span>support@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="w-[85%] lg:w-[90%] mx-auto py-4">
        <div className="flex w-full flex-wrap md-lg:gap-8">
          <div className="w-3/12 md-lg:w-full">
            <div className="bg-white relative">
              <button
                onClick={() => setCategoryShow(!categoryShow)}
                className="h-[50px] w-full bg-gray-900 text-white flex justify-between px-6 items-center gap-3 font-medium text-sm cursor-pointer hover:bg-gray-800 transition-colors rounded-t-md"
              >
                <div className="flex justify-center items-center gap-3">
                  <FaList className="w-4 h-4" />
                  <span>All Categories</span>
                </div>
                <IoIosArrowDown className={`transition-transform ${!categoryShow ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`${
                  categoryShow ? "h-0" : "h-[400px]"
                } overflow-hidden transition-all md-lg:relative duration-300 absolute z-[99999] bg-white w-full border-x border-b rounded-b-md shadow-lg`}
              >
                <ul className="py-2">
                  {categorys.map((c, i) => (
                    <li key={i} className="hover:bg-gray-50">
                      <Link className="text-sm block px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                        {c}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="w-9/12 pl-8 md-lg:pl-0 md-lg:w-full">
            <div className="flex flex-wrap w-full justify-between items-center md-lg:gap-6">
              <div className="w-8/12 md-lg:w-full">
                <div className="flex h-[50px] items-center relative">
                  <div className="relative after:absolute after:h-[25px] after:w-[1px] after:bg-gray-200 after:-right-[15px] md:hidden">
                    <select
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-[150px] text-gray-600 bg-transparent px-4 h-full outline-none border-y border-l border-gray-200 rounded-l-md"
                      name=""
                      id=""
                    >
                      <option value="">Select Category</option>
                      {categorys.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    className="w-full bg-transparent text-gray-600 outline-none px-6 h-full border border-gray-200 md:rounded-l-md"
                    onChange={(e) => setSearchValue(e.target.value)}
                    type="text"
                    placeholder="What do you need?"
                  />
                  <button className="bg-gray-900 hover:bg-gray-800 transition-colors right-0 absolute px-8 h-full font-medium text-sm text-white rounded-r-md">
                    Search
                  </button>
                </div>
              </div>

              <div className="w-4/12 block md-lg:hidden pl-2 md-lg:w-full md-lg:pl-0">
                <div className="w-full flex justify-end md-lg:justify-start gap-4 items-center">
                  <div className="w-12 h-12 rounded-full flex bg-gray-50 justify-center items-center">
                    <FaPhoneAlt className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex justify-end flex-col">
                    <h2 className="text-sm font-medium text-gray-900">+1343-43233455</h2>
                    <span className="text-sm text-gray-600">Support 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header