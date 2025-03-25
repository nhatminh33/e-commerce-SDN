import React, { useEffect } from 'react';
import { FaEye, FaRegHeart, FaCartPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Rating from '../Rating';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { add_to_card, add_to_wishlist, messageClear } from '../../store/reducers/cardReducer';
import { get_products } from '../../store/reducers/homeReducer';
import toast from 'react-hot-toast';

const FeatureProducts = ({ products }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { errorMessage, successMessage } = useSelector(state => state.card)
    const { totalProducts, perPage, currentPage, pages } = useSelector(state => state.home)
    console.log('totalProducts, perPage, currentPage, pages', totalProducts, perPage, currentPage, pages);
    
    // Calculate total pages based on totalProducts and perPage
    const totalPages = Math.ceil(totalProducts / perPage);

    // Fetch products initially
    useEffect(() => {
        dispatch(get_products({
            page: 1,
            perPage: perPage || 10,
            searchValue: '',
            categoryId: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }));
    }, [dispatch]);

    // Handle page change
    const handlePageChange = (newPage) => {
        dispatch(get_products({
            page: newPage,
            perPage,
            searchValue: '',
            categoryId: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }));
    };

    // Handle Previous button click
    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    // Handle Next button click
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const newPerPage = parseInt(e.target.value, 10);
        dispatch(get_products({
            page: 1, // Reset to first page when changing items per page
            perPage: newPerPage,
            searchValue: '',
            categoryId: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }));
    };

    const add_card = (id) => {
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity: 1,
                productId: id
            }))
        } else {
            navigate('/login')
        }
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }

    }, [successMessage, errorMessage, dispatch])


    const add_wishlist = (pro) => {
        dispatch(add_to_wishlist({
            userId: userInfo.id,
            productId: pro._id,
        }))
    }

    // Define page range to display
    const getPageRange = () => {
        // Display 5 pages around current page by default
        const rangeSize = 5;
        let startPage = Math.max(1, currentPage - Math.floor(rangeSize / 2));
        let endPage = Math.min(totalPages, startPage + rangeSize - 1);

        // Adjust startPage if endPage is at the limit
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - rangeSize + 1);
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    // Calculate start and end items
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalProducts || 0);

    // Get page numbers to display
    const pageRange = getPageRange();

    return (
        <div className='w-[85%] flex flex-wrap mx-auto'>
            <div className='w-full'>
                <div className='text-center flex justify-center items-center flex-col text-4xl text-slate-600 font-bold relative pb-[45px]'>
                    <h2>Feature Products</h2>
                    <div className='w-[100px] h-[2px] bg-[#059473] mt-4'></div>
                </div>
            </div>

            <div className='w-full grid grid-cols-4 md-lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6'>
                {
                    products.map((p, i) => <div key={i} className='border group transition-all duration-500 hover:shadow-md hover:-mt-3'>
                        <div className='relative overflow-hidden'>
                            {
                                p.discount ? <div className='flex justify-center items-center absolute text-white w-[38px] h-[38px] rounded-full bg-red-500 font-semibold text-xs left-2 top-2'>{p.discount}% </div> : ''
                            }

                            <img className='sm:w-full w-full h-[240px]' src={p.images[0]} alt="" />

                            <ul className='flex transition-all duration-700 -bottom-10 justify-center items-center gap-2 absolute w-full group-hover:bottom-3'>
                                <li onClick={() => add_wishlist(p)} className='w-[38px] h-[38px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all'>
                                    <FaRegHeart />
                                </li>
                                <Link to={`/product/details/${p._id}`} className='w-[38px] h-[38px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all'>
                                    <FaEye />
                                </Link>
                                <li onClick={() => add_card(p._id)} className='w-[38px] h-[38px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all'>
                                    <FaCartPlus />
                                </li>
                            </ul>
                        </div>

                        <div className='py-3 text-slate-600 px-2'>
                            <h2 className='font-bold'>{p.name} </h2>
                            <div className='flex justify-start items-center gap-3'>
                                <span className='text-md font-semibold'>${p.price}</span>
                                {/* <div className='flex'>
                    <Rating ratings={p.rating} />
                </div> */}

                            </div>
                        </div>




                    </div>
                    )
                }
            </div>

            {/* Improved Pagination */}
            <div className="flex w-full justify-center items-center py-8 gap-4 items-center ">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                    {/* Previous button */}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePrevPage();
                        }}
                        className={`inline-flex items-center justify-center rounded-md border ${currentPage === 1
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            } px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                    >
                        <span className="sr-only">Previous page</span>
                        <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>

                    {/* Page numbers */}
                    {totalPages <= 5 ? (
                        // Display all pages if 5 or fewer
                        Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <a
                                key={pageNum}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(pageNum);
                                }}
                                aria-current={currentPage === pageNum ? "page" : undefined}
                                className={`inline-flex items-center justify-center rounded-md ${currentPage === pageNum
                                        ? 'border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                                        : 'border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                            >
                                {pageNum}
                            </a>
                        ))
                    ) : (
                        <>
                            {/* First page */}
                            {currentPage > 3 && (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(1);
                                    }}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                    1
                                </a>
                            )}

                            {/* Ellipsis if needed */}
                            {currentPage > 4 && (
                                <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500">...</span>
                            )}

                            {/* Visible page numbers */}
                            {pageRange.map((pageNum) => (
                                <a
                                    key={pageNum}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(pageNum);
                                    }}
                                    aria-current={currentPage === pageNum ? "page" : undefined}
                                    className={`inline-flex items-center justify-center rounded-md ${currentPage === pageNum
                                            ? 'border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                                            : 'border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                                >
                                    {pageNum}
                                </a>
                            ))}

                            {/* Ellipsis if needed */}
                            {currentPage < totalPages - 3 && (
                                <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500">...</span>
                            )}

                            {/* Last page */}
                            {currentPage < totalPages - 2 && totalPages > 1 && (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(totalPages);
                                    }}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                    {totalPages}
                                </a>
                            )}
                        </>
                    )}

                    {/* Next button */}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNextPage();
                        }}
                        className={`inline-flex items-center justify-center rounded-md border ${currentPage === totalPages || totalPages === 0
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            } px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                    >
                        <span className="sr-only">Next page</span>
                        <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>
                </nav>
                {/* Items per page selector */}
                <div className="flex justify-center items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <select
                            value={perPage}
                            onChange={handleItemsPerPageChange}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-600">items per page | Total: {totalProducts || 0} products</span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default FeatureProducts;