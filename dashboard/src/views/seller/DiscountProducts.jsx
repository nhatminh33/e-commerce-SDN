import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get_products, delete_product, messageClear } from '../../store/Reducers/productReducer';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast from 'react-hot-toast';
import Pagination from '../Pagination';

const DiscountProducts = () => {
    const dispatch = useDispatch();
    const { products, totalProducts, successMessage, errorMessage } = useSelector(state => state.product);
    const { userInfo } = useSelector(state => state.auth);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [perPage, setPerPage] = useState(5);
    const [show, setShow] = useState(false);

    useEffect(() => {
        dispatch(get_products({
            page: currentPage,
            searchValue,
            perPage,
            sellerId: userInfo._id,
            discount: true  // Only get discounted products
        }));
    }, [dispatch, currentPage, searchValue, perPage, userInfo._id]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const handleDeleteProduct = (productId) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this product?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => dispatch(delete_product(productId))
                },
                {
                    label: 'No',
                    onClick: () => console.log('Cancel delete action')
                }
            ]
        });
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
                <div className='flex justify-between items-center pb-4'>
                    <h1 className='text-[#d0d2d6] text-xl font-semibold'>Discounted Products</h1>
                    <Link to='/seller/dashboard/add-product' className='bg-blue-500 hover:shadow-blue-500/50 hover:shadow-lg text-white rounded-md px-7 py-2 my-2'>Add Product</Link>
                </div>
                <div className='w-full flex flex-wrap justify-between items-center gap-2 pb-4'>
                    <div className='flex md:w-[350px] items-center gap-2'>
                        <select onChange={(e) => setPerPage(parseInt(e.target.value))} value={perPage} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                    <div className='flex md:w-[400px] items-center gap-2'>
                        <input onChange={(e) => setSearchValue(e.target.value)} value={searchValue} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6] w-full' type="text" placeholder='Search product' />
                    </div>
                </div>
                <div className='relative overflow-x-auto'>
                    <table className='w-full text-sm text-left text-[#d0d2d6]'>
                        <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
                            <tr>
                                <th scope='col' className='py-3 px-4'>No</th>
                                <th scope='col' className='py-3 px-4'>Image</th>
                                <th scope='col' className='py-3 px-4'>Name</th>
                                <th scope='col' className='py-3 px-4'>Category</th>
                                <th scope='col' className='py-3 px-4'>Price</th>
                                <th scope='col' className='py-3 px-4'>Discount</th>
                                <th scope='col' className='py-3 px-4'>Stock</th>
                                <th scope='col' className='py-3 px-4'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                products && products.length > 0 ? products.map((p, i) => (
                                    <tr key={p._id}>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{((currentPage - 1) * perPage) + i + 1}</td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <img className='w-[45px] h-[45px]' src={p.images[0]} alt="" />
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <span>{p.name.slice(0, 18)}...</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <span>{p.categoryId?.name}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <span>${p.price}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <span>{p.discount}%</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <span>{p.stock}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <div className='flex justify-start items-center gap-4'>
                                                <Link to={`/seller/dashboard/edit-product/${p._id}`} className='p-[6px] bg-blue-500 rounded-sm hover:shadow-lg hover:shadow-blue-500/50'>
                                                    <FaEdit />
                                                </Link>
                                                <Link to={`/seller/dashboard/product-details/${p._id}`} className='p-[6px] bg-green-500 rounded-sm hover:shadow-lg hover:shadow-green-500/50'>
                                                    <FaEye />
                                                </Link>
                                                <button onClick={() => handleDeleteProduct(p._id)} className='p-[6px] bg-red-500 rounded-sm hover:shadow-lg hover:shadow-red-500/50'>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="py-4 text-center">
                                            <p className='text-lg text-gray-300'>No discounted products found</p>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
                {
                    totalProducts <= perPage ? "" : <div className='w-full flex justify-end mt-4 bottom-4 right-4'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalProducts}
                            perPage={perPage}
                            showItem={3}
                        />
                    </div>
                }
            </div>
        </div>
    );
};

export default DiscountProducts;