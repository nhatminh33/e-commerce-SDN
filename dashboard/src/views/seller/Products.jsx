// import React, { useEffect, useState } from 'react';
// import Search from '../components/Search';
// import { Link } from 'react-router-dom';
// import Pagination from '../Pagination'; 
// import { FaEdit, FaEye, FaTrash } from 'react-icons/fa'; 
// import { LuImageMinus } from "react-icons/lu";
// import { useDispatch, useSelector } from 'react-redux';
// import { get_products, delete_product, messageClear } from '../../store/Reducers/productReducer';
// import toast from 'react-hot-toast';
// import { confirmAlert } from 'react-confirm-alert';
// import 'react-confirm-alert/src/react-confirm-alert.css';

// const Products = () => {
//     const dispatch = useDispatch();
//     const { products, totalProducts, loader, successMessage, errorMessage } = useSelector(state => state.product);
//     const { userInfo } = useSelector(state => state.auth);
   
//     const [currentPage, setCurrentPage] = useState(1);
//     const [searchValue, setSearchValue] = useState('');
//     const [perPage, setPerPage] = useState(5);
//     const [show, setShow] = useState(false);
//     const [sortBy, setSortBy] = useState('name');
//     const [sortOrder, setSortOrder] = useState('desc');

//     useEffect(() => {
//         dispatch(get_products({
//             page: currentPage,
//             searchValue,
//             perPage,
//             sortBy,
//             sortOrder,
//             sellerId: userInfo._id
//         }));
//     }, [dispatch, currentPage, searchValue, perPage, sortBy, sortOrder, userInfo._id]);

//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage);
//             dispatch(messageClear());
//         }
//         if (errorMessage) {
//             toast.error(errorMessage);
//             dispatch(messageClear());
//         }
//     }, [successMessage, errorMessage, dispatch]);

//     const handleDeleteProduct = (productId) => {
//         confirmAlert({
//             title: 'Confirm Delete',
//             message: 'Are you sure you want to delete this product?',
//             buttons: [
//                 {
//                     label: 'Yes',
//                     onClick: () => dispatch(delete_product(productId))
//                 },
//                 {
//                     label: 'No',
//                     onClick: () => console.log('Cancel delete action')
//                 }
//             ]
//         });
//     };

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//                 <div className='flex justify-between items-center pb-4'>
//                     <h1 className='text-[#d0d2d6] text-xl font-semibold'>Products</h1>
//                     <Link to='/seller/dashboard/add-product' className='bg-blue-500 hover:shadow-blue-500/50 hover:shadow-lg text-white rounded-md px-7 py-2 my-2'>Add Product</Link>
//                 </div>
//                 <div className='w-full flex flex-wrap justify-between items-center gap-2 pb-4'>
//                     <div className='flex md:w-[350px] items-center gap-2'>
//                         <select onChange={(e) => setPerPage(parseInt(e.target.value))} value={perPage} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'>
//                             <option value={5}>5</option>
//                             <option value={10}>10</option>
//                             <option value={15}>15</option>
//                             <option value={20}>20</option>
//                         </select>
//                         <div className='flex items-center gap-2'>
//                             <select onChange={(e) => setSortBy(e.target.value)} value={sortBy} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'>
//                                 <option value="name">Name</option>
//                                 <option value="price">Price</option>
//                                 <option value="discount">Discount</option>
//                                 <option value="stock">Stock</option>
//                             </select>
//                             <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'>
//                                 <option value="asc">Ascending</option>
//                                 <option value="desc">Descending</option>
//                             </select>
//                         </div>
//                     </div>
//                     <div className='flex md:w-[400px] items-center gap-2'>
//                         <input onChange={(e) => setSearchValue(e.target.value)} value={searchValue} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6] w-full' type="text" placeholder='Search product' />
//                     </div>
//                 </div>
//                 <div className='relative overflow-x-auto'>
//                     <table className='w-full text-sm text-left text-[#d0d2d6]'>
//                         <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
//                             <tr>
//                                 <th scope='col' className='py-3 px-4'>No</th>
//                                 <th scope='col' className='py-3 px-4'>Image</th>
//                                 <th scope='col' className='py-3 px-4'>Name</th>
//                                 <th scope='col' className='py-3 px-4'>Category</th>
//                                 <th scope='col' className='py-3 px-4'>Price</th>
//                                 <th scope='col' className='py-3 px-4'>Discount</th>
//                                 <th scope='col' className='py-3 px-4'>Stock</th>
//                                 <th scope='col' className='py-3 px-4'>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 products && products.map((p, i) => (
//                                     console.log('aaa',p),
//                                     <tr key={p._id}>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{((currentPage - 1) * perPage) + i + 1}</td>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                                             <img className='w-[45px] h-[45px]' src={p.images[0]} alt="" />
//                                         </td>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                                             <span>{p.name.slice(0, 18)}...</span>
//                                         </td>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                                             <span>{p.categoryId?.name}</span>
//                                         </td>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                                             <span>${p.price}</span>
//                                         </td>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                                             <span>{p.discount}%</span>
//                                         </td>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                                             <span>{p.stock}</span>
//                                         </td>
//                                         <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                                             <div className='flex justify-start items-center gap-4'>
//                                                 <Link to={`/seller/dashboard/edit-product/${p._id}`} className='p-[6px] bg-blue-500 rounded-sm hover:shadow-lg hover:shadow-blue-500/50'>
//                                                     <FaEdit />
//                                                 </Link>
//                                                 <Link to={`/seller/dashboard/product-details/${p._id}`} className='p-[6px] bg-green-500 rounded-sm hover:shadow-lg hover:shadow-green-500/50'>
//                                                     <FaEye />
//                                                 </Link>
//                                                 <button onClick={() => handleDeleteProduct(p._id)} className='p-[6px] bg-red-500 rounded-sm hover:shadow-lg hover:shadow-red-500/50'>
//                                                     <FaTrash />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             }

//                         </tbody>
//                     </table>
//                 </div>
//                 {
//                     totalProducts <= perPage ? "" : <div className='w-full flex justify-end mt-4 bottom-4 right-4'>
//                         <Pagination
//                             pageNumber={currentPage}
//                             setPageNumber={setCurrentPage}
//                             totalItem={totalProducts}
//                             perPage={perPage}
//                             showItem={3}
//                         />
//                     </div>
//                 }
//                 {
//                     products.length === 0 && (
//                         <div className='flex justify-center items-center h-48'>
//                             <p className='text-lg text-gray-300'>No products found</p>
//                         </div>
//                     )
//                 }

//             </div>
//         </div>
//     );
// };

// export default Products;
import React, { useEffect, useState } from 'react';
import Search from '../components/Search';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination'; 
import { FaEdit, FaEye, FaTrash, FaPlus } from 'react-icons/fa'; 
import { LuImageMinus } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { get_products, delete_product, messageClear } from '../../store/Reducers/productReducer';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Products = () => {
    const dispatch = useDispatch();
    const { products, totalProducts, loader, successMessage, errorMessage } = useSelector(state => state.product);
    const { userInfo } = useSelector(state => state.auth);
   
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [perPage, setPerPage] = useState(5);
    const [show, setShow] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        dispatch(get_products({
            page: currentPage,
            searchValue,
            perPage,
            sortBy,
            sortOrder,
            sellerId: userInfo._id
        }));
    }, [dispatch, currentPage, searchValue, perPage, sortBy, sortOrder, userInfo._id]);

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

    const renderStockStatus = (stock) => {
        if (stock <= 0) {
            return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Out of stock</span>;
        } else if (stock < 10) {
            return <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Low: {stock}</span>;
        } else {
            return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{stock}</span>;
        }
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-lg shadow-sm'>
                <div className='flex justify-between items-center pb-4 border-b border-pink-100'>
                    <h1 className='text-xl font-semibold text-pink-600'>Your Products</h1>
                    <Link 
                        to='/seller/dashboard/add-product' 
                        className='bg-pink-500 hover:bg-pink-600 text-white rounded-md px-5 py-2 flex items-center gap-2 transition-all shadow-sm'
                    >
                        <FaPlus /> Add Product
                    </Link>
                </div>

                <div className='w-full flex flex-wrap justify-between items-center gap-4 py-4 bg-pink-50 px-4 mt-4 rounded-lg'>
                    <div className='flex flex-col md:flex-row md:w-[400px] items-start md:items-center gap-3'>
                        <div className='flex items-center gap-2 w-full md:w-auto'>
                            <select 
                                onChange={(e) => setPerPage(parseInt(e.target.value))} 
                                value={perPage} 
                                className='px-3 py-1.5 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700 text-sm w-full'
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={15}>15 per page</option>
                                <option value={20}>20 per page</option>
                            </select>
                        </div>
                        <div className='flex items-center gap-2 w-full'>
                            <select 
                                onChange={(e) => setSortBy(e.target.value)} 
                                value={sortBy} 
                                className='px-3 py-1.5 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700 text-sm w-1/2'
                            >
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="discount">Discount</option>
                                <option value="stock">Stock</option>
                            </select>
                            <select 
                                onChange={(e) => setSortOrder(e.target.value)} 
                                value={sortOrder} 
                                className='px-3 py-1.5 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700 text-sm w-1/2'
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                    <div className='flex md:w-[300px] items-center gap-2 w-full'>
                        <input 
                            onChange={(e) => setSearchValue(e.target.value)} 
                            value={searchValue} 
                            className='px-4 py-1.5 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700 w-full' 
                            type="text" 
                            placeholder='Search products...' 
                        />
                    </div>
                </div>

                {loader ? (
                    <div className='flex justify-center items-center h-48'>
                        <div className='animate-spin rounded-full h-8 w-8 border-4 border-pink-300 border-t-pink-600'></div>
                    </div>
                ) : (
                    <div className='relative overflow-x-auto shadow-sm sm:rounded-lg mt-4'>
                        <table className='w-full text-sm text-left text-gray-700'>
                            <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                                <tr>
                                    <th scope='col' className='py-3 px-4'>No</th>
                                    <th scope='col' className='py-3 px-4'>Image</th>
                                    <th scope='col' className='py-3 px-4'>Name</th>
                                    <th scope='col' className='py-3 px-4'>Category</th>
                                    <th scope='col' className='py-3 px-4'>Price</th>
                                    <th scope='col' className='py-3 px-4'>Cost Price</th>
                                    <th scope='col' className='py-3 px-4'>Discount</th>
                                    <th scope='col' className='py-3 px-4'>Stock</th>
                                    <th scope='col' className='py-3 px-4'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products && products.length > 0 ? (
                                    products.map((p, i) => (
                                        <tr key={p._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100 transition-all`}>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                {((currentPage - 1) * perPage) + i + 1}
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                {p.images && p.images.length > 0 ? (
                                                    <img 
                                                        className='w-[45px] h-[45px] rounded-md object-cover border border-pink-100' 
                                                        src={p.images[0]} 
                                                        alt={p.name} 
                                                    />
                                                ) : (
                                                    <div className='w-[45px] h-[45px] bg-gray-200 rounded-md flex items-center justify-center'>
                                                        <LuImageMinus className='text-gray-400' />
                                                    </div>
                                                )}
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                <span title={p.name}>{p.name.length > 18 ? `${p.name.slice(0, 18)}...` : p.name}</span>
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                <span>{p.categoryId?.name || "N/A"}</span>
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap text-pink-600'>
                                                ${p.price}
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                <span>${p.costPrice || 0}</span>
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                {p.discount > 0 ? (
                                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                        {p.discount}%
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                                        0%
                                                    </span>
                                                )}
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                {renderStockStatus(p.stock)}
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                <div className='flex justify-start items-center gap-2'>
                                                    <Link 
                                                        to={`/seller/dashboard/edit-product/${p._id}`} 
                                                        className='p-1.5 bg-blue-500 rounded-md hover:bg-blue-600 text-white transition-all'
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </Link>
                                                    <Link 
                                                        to={`/seller/dashboard/product-details/${p._id}`} 
                                                        className='p-1.5 bg-green-500 rounded-md hover:bg-green-600 text-white transition-all'
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDeleteProduct(p._id)} 
                                                        className='p-1.5 bg-red-500 rounded-md hover:bg-red-600 text-white transition-all'
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className='py-6 text-center text-gray-500'>
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {totalProducts > perPage && (
                    <div className='w-full flex justify-end mt-6'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalProducts}
                            perPage={perPage}
                            showItem={3}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;