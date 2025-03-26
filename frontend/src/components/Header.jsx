import React, { useEffect, useState } from 'react';
import { MdEmail } from "react-icons/md";
import { IoMdPhonePortrait } from "react-icons/io";
import { FaFacebookF, FaList, FaLock, FaUser } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHeart } from "react-icons/fa6";
import { FaCartShopping } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"; 
import { useDispatch, useSelector } from 'react-redux';
import { get_card_products, get_wishlist_products } from '../store/reducers/cardReducer';
import { get_products } from '../store/reducers/homeReducer';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categorys } = useSelector(state => state.home);
    const { userInfo } = useSelector(state => state.auth);
    const { card_product_count, wishlist_count } = useSelector(state => state.card);

    const { pathname } = useLocation();
     
    const [showSidebar, setShowSidebar] = useState(true);
    const [categoryShow, setCategoryShow] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [category, setCategory] = useState('');
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

    const search = () => {
        dispatch(
            get_products({
                categoryId: category,
                searchValue: searchValue,
            })
        );
    };
    
    // Log để debug
    console.log('categoryId:', category);
    console.log('searchValue:', searchValue);
    
    useEffect(() => {
        if (category ) {
            dispatch(
                get_products({
                    categoryId: category,
                })
            );
        }
    }, [category, dispatch]);

    const redirect_card_page = () => {
        if (userInfo) {
            navigate('/card');
        } else {
            navigate('/login');
        }
    };

    useEffect(() => {
        if (userInfo) {
            dispatch(get_card_products(userInfo.id));
            dispatch(get_wishlist_products(userInfo.id));
        }
    }, [userInfo, dispatch]);

    return (
        <div className='w-full bg-white shadow-sm'>
            {/* Top Bar */}
            <div className='header-top bg-pink-50 md-lg:hidden border-b border-pink-100'>
                <div className='w-[85%] lg:w-[90%] mx-auto'>
                
            </div>

            {/* Main Header */}
            <div className='w-white'>
                <div className='w-[85%] lg:w-[90%] mx-auto'>
                    <div className='h-[90px] md-lg:h-[100px] flex justify-between items-center flex-wrap'>
                        {/* Logo */}
                        <div className='md-lg:w-full w-3/12 md-lg:pt-4'>
                            <div className='flex justify-between items-center'>
                                <Link to='/'>
                                    <img src="http://localhost:3000/images/logo.png" alt="Velvet Fleur" />
                                </Link>
                                <div 
                                    className='justify-center items-center w-[30px] h-[30px] bg-white text-pink-500 border border-pink-200 rounded-md cursor-pointer lg:hidden md-lg:flex xl:hidden hidden' 
                                    onClick={() => setShowSidebar(false)}
                                >
                                    <span><FaList/></span>
                                </div>
                            </div> 
                        </div>
                        
                        {/* Navigation */}
                        <div className='md:lg:w-full w-9/12'>
                            <div className='flex justify-between md-lg:justify-center items-center flex-wrap pl-8'>
                                <ul className='flex justify-start items-start gap-8 text-sm font-medium uppercase md-lg:hidden'>
                                    <li>
                                        <Link 
                                            to='/' 
                                            className={`p-2 block ${pathname === '/' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500 transition-all'}`}
                                        >
                                            Home
                                        </Link>
                                    </li>
                                </ul>

                                <div className='flex md-lg:hidden justify-center items-center gap-5'>
                                    <div className='flex justify-center gap-5'>
                                        {/* Wishlist Icon */}
                                        <div 
                                            onClick={() => navigate(userInfo ? '/dashboard/my-wishlist' : '/login')} 
                                            className='relative flex justify-center items-center cursor-pointer w-[40px] h-[40px] rounded-full bg-pink-50 hover:bg-pink-100 transition-all'
                                        >
                                            <span className='text-xl text-pink-500'><FaHeart /></span>
                                            {wishlist_count !== 0 && (
                                                <div className='w-[20px] h-[20px] absolute bg-pink-500 rounded-full text-white flex justify-center items-center -top-[3px] -right-[5px] text-xs'>
                                                    {wishlist_count}
                                                </div>
                                            )}                  
                                        </div>

                                        {/* Cart Icon */}
                                        <div 
                                            onClick={redirect_card_page} 
                                            className="flex cursor-pointer justify-center items-center h-[40px] w-[40px] rounded-full bg-pink-50 hover:bg-pink-100 transition-all"
                                        >
                                            <span className="text-xl text-pink-500 cursor-pointer relative">
                                                <FaCartShopping />
                                                <span className="w-[20px] h-[20px] absolute -top-[3px] -right-[8px] rounded-full bg-pink-500 text-white flex justify-center items-center text-xs">
                                                    {card_product_count}
                                                </span>
                                            </span>
                                        </div>
                                        {userInfo ? (
                                    <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm' to='/dashboard'>
                                        <span className="text-pink-500"><FaUser/></span>
                                        <span>{userInfo.name}</span>
                                    </Link>
                                ) : (
                                    <Link to='/login' className='flex cursor-pointer justify-center items-center gap-2 text-sm'>
                                        <span className="text-pink-500"><FaLock /></span>
                                        <span>Login</span>
                                    </Link>
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
            <div className='hidden md-lg:block'>
                <div 
                    onClick={() => setShowSidebar(true)} 
                    className={`fixed duration-200 transition-all ${showSidebar ? 'invisible' : 'visible'} hidden md-lg:block w-screen h-screen bg-[rgba(0,0,0,0.5)] top-0 left-0 z-20`}
                ></div> 

                <div className={`w-[300px] z-[9999] transition-all duration-200 fixed ${showSidebar ? '-left-[300px]' : 'left-0 top-0'} overflow-y-auto bg-white h-screen py-6 px-8 shadow-xl`}>
                    <div className='flex justify-start flex-col gap-6'>
                        <Link to='/'>
                            <img src="http://localhost:3000/images/logo.png" alt="Velvet Fleur" />
                        </Link>
                        
                        <div className='flex justify-start items-center gap-10'>
                            <div className='flex group cursor-pointer text-gray-600 text-sm justify-center items-center gap-1 relative'>
                                <img src="http://localhost:3000/images/language.png" alt="Language" />
                                <span><IoMdArrowDropdown /></span>
                                <ul className='absolute invisible transition-all top-12 rounded-md duration-200 text-gray-600 p-2 w-[100px] flex flex-col gap-3 group-hover:visible group-hover:top-6 group-hover:bg-white z-10 shadow-md'>
                                    <li className="hover:text-pink-500 transition-all">English</li>
                                    <li className="hover:text-pink-500 transition-all">Tiếng Việt</li>
                                </ul>
                            </div>
                            
                            {userInfo ? (
                                <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm' to='/dashboard'>
                                    <span className="text-pink-500"><FaUser/></span>
                                    <span>{userInfo.name}</span>
                                </Link>
                            ) : (
                                <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm' to='/login'>
                                    <span className="text-pink-500"><FaLock /></span>
                                    <span>Login</span>
                                </Link>
                            )} 
                        </div>

                        <ul className='flex flex-col justify-start items-start text-sm font-medium uppercase'>
                            <li>
                                <Link 
                                    to='/'
                                    className={`py-2 block ${pathname === '/' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500 transition-all'}`}
                                >
                                    Home
                                </Link>
                            </li>
                        </ul>
                        
                        <div className='flex justify-start items-center gap-4'>
                            <a href="#" className="text-gray-500 hover:text-pink-500 transition-all"><FaFacebookF /></a>
                            <a href="#" className="text-gray-500 hover:text-pink-500 transition-all"><FaTwitter /></a>
                            <a href="#" className="text-gray-500 hover:text-pink-500 transition-all"><FaLinkedin /></a>
                            <a href="#" className="text-gray-500 hover:text-pink-500 transition-all"><FaGithub /></a> 
                        </div>

                        <div className='w-full flex justify-end md-lg:justify-start gap-3 items-center'>
                            <div className='w-[48px] h-[48px] rounded-full flex bg-pink-50 justify-center items-center'>
                                <span className="text-pink-500"><FaPhoneAlt /></span>
                            </div>
                            <div className='flex justify-end flex-col gap-1'>
                                <h2 className='text-sm font-medium text-gray-700'>+1343-43233455</h2>
                                <span className='text-xs text-gray-500'>Support 24/7</span> 
                            </div>
                        </div>

                        <ul className='flex flex-col justify-start items-start gap-3 text-gray-600'>
                            <li className='flex justify-start items-center gap-2 text-sm'>
                                <span className="text-pink-500"><MdEmail /></span>
                                <span>velvetfleur@gmail.com</span>
                            </li>
                        </ul> 
                    </div> 
                </div>  
            </div>

            {/* Search & Category Section */}
            <div className='bg-gray-50 py-4 border-t border-b border-pink-100'>
                <div className='w-[85%] lg:w-[90%] mx-auto'>
                    <div className='flex w-full flex-wrap md-lg:gap-8'>
                        {/* Category Dropdown */}
                        <div className='w-3/12 md-lg:w-full'>
                            <div className='bg-white relative rounded-md shadow-sm'>
                                <div 
                                    onClick={() => setCategoryShow(!categoryShow)} 
                                    className='h-[50px] bg-pink-500 text-white flex justify-center md-lg:justify-between md-lg:px-6 items-center gap-3 font-medium text-md cursor-pointer rounded-md'
                                >
                                    <div className='flex justify-center items-center gap-3'>
                                        <span><FaList/></span>
                                        <span>All Categories</span>
                                    </div>
                                    <span className='pt-1'>{categoryShow ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
                                </div>

                                <div 
                                    className={`${categoryShow ? 'h-0' : 'h-[400px]'} overflow-hidden transition-all md-lg:relative duration-500 absolute z-[99999] bg-white w-full border border-pink-100 rounded-b-md shadow-md`}
                                >
                                    <ul className='py-2 text-gray-600'>
                                        {categorys.map((c, i) => (
                                            <li key={i} 
                                                className={`flex justify-start items-center gap-2 px-[24px] py-[6px] hover:bg-pink-50 transition-all ${category === c._id ? 'bg-pink-100' : ''}`}
                                                onClick={() => {
                                                    console.log('Selected category:', c.name, 'ID:', c._id);
                                                    setCategory(c._id);
                                                    setCategoryShow(true); // Đóng dropdown sau khi chọn
                                                }}
                                            >
                                                <img src={c.image} className='w-[30px] h-[30px] rounded-full border border-pink-100 object-cover' alt={c.name} />
                                                <p className='text-sm block hover:text-pink-500 transition-all cursor-pointer'>{c.name}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className='w-9/12 pl-8 md-lg:pl-0 md-lg:w-full'>
                            <div className='flex flex-wrap w-full justify-between items-center md-lg:gap-6'>
                                <div className='w-8/12 md-lg:w-full'>
                                    <div className='flex h-[50px] items-center relative gap-6 bg-white rounded-md shadow-sm'>
                                        {/* Category Filter In Search */}
                                        <div className='relative after:absolute after:h-[25px] after:w-[1px] after:bg-pink-100 after:-right-[15px] md:hidden'>
                                            {/* <div 
                                                className='w-[150px] px-4 h-full flex items-center cursor-pointer'
                                                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                                            >
                                                <span className='text-gray-600 font-medium w-full'>{category || 'Select Category'}</span>
                                                <span className='ml-2'><IoIosArrowDown /></span>
                                            </div> */}
                                            
                                            {/* {categoryDropdownOpen && (
                                                <div className='absolute top-[50px] left-0 w-[220px] max-h-[300px] overflow-y-auto bg-white shadow-md rounded-md z-10 border border-pink-100'>
                                                    <div className='p-2 border-b border-pink-100'>
                                                        <div 
                                                            className='px-3 py-2 text-gray-600 hover:bg-pink-50 cursor-pointer rounded-md'
                                                            onClick={() => {
                                                                setCategory('');
                                                                setCategoryDropdownOpen(false);
                                                            }}
                                                        >
                                                            All Categories
                                                        </div>
                                                    </div>
                                                    <div className='p-2'>
                                                        {categorys.map((c, i) => (
                                                            <div 
                                                                key={i} 
                                                                className='px-3 py-2 text-gray-600 hover:bg-pink-50 cursor-pointer rounded-md flex items-center gap-2'
                                                                onClick={() => {
                                                                    setCategory(c.name);
                                                                    setCategoryDropdownOpen(false);
                                                                }}
                                                            >
                                                                <img src={c.image} className='w-[20px] h-[20px] rounded-full' alt={c.name} />
                                                                <span>{c.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )} */}
                                        </div>
                                        
                                        <input 
                                            className='w-full relative bg-transparent text-gray-600 outline-0 px-3 h-full' 
                                            onChange={(e) => setSearchValue(e.target.value)} 
                                            value={searchValue}
                                            type="text" 
                                            placeholder='What do you need?' 
                                        />
                                        <button 
                                            onClick={search} 
                                            className='bg-pink-500 hover:bg-pink-600 transition-all right-0 absolute px-8 h-full font-medium text-white rounded-r-md'
                                        >
                                            SEARCH
                                        </button>
                                    </div> 
                                </div>

                                {/* Contact Info */}
                                <div className='w-4/12 block md-lg:hidden pl-2 md-lg:w-full md-lg:pl-0'>
                                    <div className='w-full flex justify-end md-lg:justify-start gap-3 items-center'>
                                        <div className='w-[48px] h-[48px] rounded-full flex bg-pink-50 justify-center items-center'>
                                            <span className="text-pink-500"><FaPhoneAlt /></span>
                                        </div>
                                        <div className='flex justify-end flex-col gap-1'>
                                            <h2 className='text-md font-medium text-gray-700'>+1343-43233455</h2>
                                            <span className='text-sm text-gray-500'>Support 24/7</span> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
        </div>
    );
};

export default Header;