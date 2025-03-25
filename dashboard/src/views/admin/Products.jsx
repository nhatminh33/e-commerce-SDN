// import React, { useEffect, useState } from 'react';
// import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
// import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { admin_delete_product, get_admin_products, messageClear } from '../../store/Reducers/productReducer';
// import { get_categories } from '../../store/Reducers/categoryReducer';
// import Pagination from '../../utils/Pagination';
// import Search from '../../utils/Search';
// import toast from 'react-hot-toast';

// const Products = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { products, totalProduct, totalPages, currentPage, loader, successMessage, errorMessage } = useSelector(state => state.product);
//     const { categories } = useSelector(state => state.category);

//     const [searchValue, setSearchValue] = useState('');
//     const [perPage, setPerPage] = useState(10);
//     const [filterOpen, setFilterOpen] = useState(false);
//     const [categoryId, setCategoryId] = useState('');
//     const [sellerId, setSellerId] = useState('');
//     const [priceRange, setPriceRange] = useState({ min: '', max: '' });
//     const [sortBy, setSortBy] = useState('createdAt');
//     const [sortOrder, setSortOrder] = useState('desc');

//     useEffect(() => {
//         dispatch(get_categories());
//     }, [dispatch]);

//     useEffect(() => {
//         dispatch(get_admin_products({
//             page: currentPage,
//             searchValue,
//             perPage,
//             categoryId, 
//             sellerId,
//             minPrice: priceRange.min,
//             maxPrice: priceRange.max,
//             sortBy,
//             sortOrder
//         }));
//     }, [dispatch, currentPage, perPage, categoryId, sellerId, sortBy, sortOrder]);

//     const handlePageChange = (page) => {
//         dispatch(get_admin_products({
//             page,
//             searchValue,
//             perPage,
//             categoryId,
//             sellerId,
//             minPrice: priceRange.min,
//             maxPrice: priceRange.max,
//             sortBy,
//             sortOrder
//         }));
//     };

//     const handleSearch = (e) => {
//         e.preventDefault();
//         dispatch(get_admin_products({
//             page: 1,
//             searchValue,
//             perPage,
//             categoryId,
//             sellerId,
//             minPrice: priceRange.min,
//             maxPrice: priceRange.max,
//             sortBy,
//             sortOrder
//         }));
//     };

//     const handleDeleteProduct = (productId) => {
//         if (window.confirm('Are you sure you want to delete this product?')) {
//             dispatch(admin_delete_product(productId));
//         }
//     };

//     const resetFilters = () => {
//         setSearchValue('');
//         setCategoryId('');
//         setSellerId('');
//         setPriceRange({ min: '', max: '' });
//         setSortBy('createdAt');
//         setSortOrder('desc');
//         dispatch(get_admin_products({
//             page: 1,
//             searchValue: '',
//             perPage,
//             categoryId: '',
//             sellerId: '',
//             minPrice: '',
//             maxPrice: '',
//             sortBy: 'createdAt',
//             sortOrder: 'desc'
//         }));
//     };

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

//     return (
//         <div className='px-2 lg:px-7 pt-5 rounded-md'>
//             <div className='w-full p-4 bg-[#6a5fdf]'>
//                 <div className='flex justify-between items-center'>
//                     <h2 className='text-xl font-semibold text-white pb-4'>Product Management</h2>
//                     <button 
//                         onClick={() => setFilterOpen(!filterOpen)}
//                         className='px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600'
//                     >
//                         {filterOpen ? 'Hide Filters' : 'Show Filters'}
//                     </button>
//                 </div>
                
//                 <div className='flex flex-wrap gap-2 md:gap-4 justify-between items-end mb-4'>
//                     <form onSubmit={handleSearch} className='flex items-center gap-3'>
//                         <div className='flex flex-col gap-1'>
//                             <input 
//                                 type="text" 
//                                 placeholder='Search products...' 
//                                 value={searchValue}
//                                 onChange={(e) => setSearchValue(e.target.value)}
//                                 className='px-3 py-2 rounded-md outline-none border border-slate-200 bg-[#475569] text-white w-full md:w-[300px]'
//                             />
//                         </div>
//                         <button 
//                             type='submit'
//                             className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
//                         >
//                             Search
//                         </button>
//                         <button 
//                             type='button'
//                             onClick={resetFilters}
//                             className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
//                         >
//                             Reset
//                         </button>
//                     </form>
                    
//                     <div className='flex items-center gap-3'>
//                         <select
//                             value={perPage}
//                             onChange={(e) => setPerPage(Number(e.target.value))}
//                             className='px-4 py-2 outline-none border border-slate-700 bg-[#475569] text-white rounded-md'
//                         >
//                             <option value={5}>5</option>
//                             <option value={10}>10</option>
//                             <option value={15}>15</option>
//                             <option value={25}>25</option>
//                             <option value={50}>50</option>
//                         </select>
//                     </div>
//                 </div>
                
//                 {filterOpen && (
//                     <div className='grid grid-cols-1 md:grid-cols-4 gap-3 pb-4 mt-4 border-t border-slate-600 pt-4'>
//                         <div className='flex flex-col gap-1'>
//                             <label className='text-white text-sm'>Sort By</label>
//                             <select 
//                                 value={sortBy}
//                                 onChange={(e) => setSortBy(e.target.value)}
//                                 className='px-4 py-2 outline-none border border-slate-700 bg-[#475569] text-white rounded-md'
//                             >
//                                 <option value="createdAt">Created Date</option>
//                                 <option value="name">Product Name</option>
//                                 <option value="price">Price</option>
//                                 <option value="stock">Stock</option>
//                                 <option value="discount">Discount</option>
//                             </select>
//                         </div>
                        
//                         <div className='flex flex-col gap-1'>
//                             <label className='text-white text-sm'>Sort Order</label>
//                             <select 
//                                 value={sortOrder}
//                                 onChange={(e) => setSortOrder(e.target.value)}
//                                 className='px-4 py-2 outline-none border border-slate-700 bg-[#475569] text-white rounded-md'
//                             >
//                                 <option value="desc">Descending</option>
//                                 <option value="asc">Ascending</option>
//                             </select>
//                         </div>
                        
//                         <div className='flex flex-col gap-1'>
//                             <label className='text-white text-sm'>Category</label>
//                             <select 
//                                 value={categoryId}
//                                 onChange={(e) => setCategoryId(e.target.value)}
//                                 className='px-4 py-2 outline-none border border-slate-700 bg-[#475569] text-white rounded-md'
//                             >
//                                 <option value="">All Categories</option>
//                                 {categories?.map((category) => (
//                                     <option key={category._id} value={category._id}>
//                                         {category.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
                        
//                         <div className='flex flex-col gap-1'>
//                             <label className='text-white text-sm'>Minimum Price</label>
//                             <input 
//                                 type="number" 
//                                 placeholder='Minimum price'
//                                 value={priceRange.min}
//                                 onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
//                                 className='px-4 py-2 outline-none border border-slate-700 bg-[#475569] text-white rounded-md'
//                             />
//                         </div>
                        
//                         <div className='flex flex-col gap-1'>
//                             <label className='text-white text-sm'>Maximum Price</label>
//                             <input 
//                                 type="number" 
//                                 placeholder='Maximum price'
//                                 value={priceRange.max}
//                                 onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
//                                 className='px-4 py-2 outline-none border border-slate-700 bg-[#475569] text-white rounded-md'
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
            
//             <div className='w-full'>
//                 <div className='w-full overflow-x-auto bg-[#6a5fdf]'>
//                     {loader ? (
//                         <div className='flex justify-center items-center h-[200px]'>
//                             <div className='animate-spin h-6 w-6 border-2 border-dotted border-white rounded-full'></div>
//                         </div>
//                     ) : (
//                         <>
//                             <table className='w-full text-sm text-left text-white'>
//                                 <thead className='text-sm text-white uppercase border-b border-slate-700'>
//                                     <tr>
//                                         <th scope='col' className='py-3 px-4'>Image</th>
//                                         <th scope='col' className='py-3 px-4'>Product Name</th>
//                                         <th scope='col' className='py-3 px-4'>Category</th>
//                                         <th scope='col' className='py-3 px-4'>Seller</th>
//                                         <th scope='col' className='py-3 px-4'>Price</th>
//                                         <th scope='col' className='py-3 px-4'>Discount</th>
//                                         <th scope='col' className='py-3 px-4'>Stock</th>
//                                         <th scope='col' className='py-3 px-4'>Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {products.length > 0 ? (
//                                         products.map((product, index) => (
//                                             <tr key={product._id} className='border-b border-slate-700'>
//                                                 <td className='py-3 px-4'>
//                                                     <img 
//                                                         className='w-[45px] h-[45px] object-cover rounded-md'
//                                                         src={product.images[0] || 'https://via.placeholder.com/45'} 
//                                                         alt={product.name} 
//                                                     />
//                                                 </td>
//                                                 <td className='py-3 px-4 font-medium whitespace-nowrap'>{product.name}</td>
//                                                 <td className='py-3 px-4'>{product.categoryName || 'N/A'}</td>
//                                                 <td className='py-3 px-4'>{product.sellerName || 'N/A'}</td>
//                                                 <td className='py-3 px-4'>${product.price}</td>
//                                                 <td className='py-3 px-4'>{product.discount}%</td>
//                                                 <td className='py-3 px-4'>{product.stock}</td>
//                                                 <td className='py-3 px-4 flex gap-2'>
//                                                     <Link 
//                                                         to={`/admin/dashboard/product/details/${product._id}`}
//                                                         className='p-[6px] bg-green-500 rounded-sm hover:bg-green-600'
//                                                     >
//                                                         <FaEye />
//                                                     </Link>
//                                                     <button 
//                                                         onClick={() => navigate(`/admin/dashboard/product/details/${product._id}?edit=true`)}
//                                                         className='p-[6px] bg-blue-500 rounded-sm hover:bg-blue-600'
//                                                     >
//                                                         <FaEdit />
//                                                     </button>
//                                                     <button 
//                                                         onClick={() => handleDeleteProduct(product._id)}
//                                                         className='p-[6px] bg-red-500 rounded-sm hover:bg-red-600'
//                                                     >
//                                                         <FaTrash />
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={8} className='py-4 text-center'>No products found</td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
                            
//                             {totalProduct > perPage && (
//                                 <div className='flex justify-end mt-4 bottom-4 right-4'>
//                                     <Pagination 
//                                         pageNumber={currentPage}
//                                         setPageNumber={handlePageChange}
//                                         totalItem={totalProduct}
//                                         perPage={perPage}
//                                         showItem={3}
//                                     />
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Products; 
import React, { useEffect, useState } from 'react';
import { FaEdit, FaEye, FaTrash, FaFilter } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { admin_delete_product, get_admin_products, messageClear } from '../../store/Reducers/productReducer';
import { get_categories } from '../../store/Reducers/categoryReducer';
import Pagination from '../../utils/Pagination';
import Search from '../../utils/Search';
import toast from 'react-hot-toast';

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, totalProduct, totalPages, currentPage, loader, successMessage, errorMessage } = useSelector(state => state.product);
    const { categories } = useSelector(state => state.category);

    const [searchValue, setSearchValue] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [filterOpen, setFilterOpen] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [sellerId, setSellerId] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        dispatch(get_categories());
    }, [dispatch]);

    useEffect(() => {
        dispatch(get_admin_products({
            page: currentPage,
            searchValue,
            perPage,
            categoryId, 
            sellerId,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            sortBy,
            sortOrder
        }));
    }, [dispatch, currentPage, perPage, categoryId, sellerId, sortBy, sortOrder]);

    const handlePageChange = (page) => {
        dispatch(get_admin_products({
            page,
            searchValue,
            perPage,
            categoryId,
            sellerId,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            sortBy,
            sortOrder
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(get_admin_products({
            page: 1,
            searchValue,
            perPage,
            categoryId,
            sellerId,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            sortBy,
            sortOrder
        }));
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            dispatch(admin_delete_product(productId));
        }
    };

    const resetFilters = () => {
        setSearchValue('');
        setCategoryId('');
        setSellerId('');
        setPriceRange({ min: '', max: '' });
        setSortBy('createdAt');
        setSortOrder('desc');
        dispatch(get_admin_products({
            page: 1,
            searchValue: '',
            perPage,
            categoryId: '',
            sellerId: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }));
    };

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

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-md shadow-md'>
                <div className='flex justify-between items-center mb-5 border-b border-pink-100 pb-3'>
                    <h2 className='text-xl text-pink-600 font-bold'>Product Management</h2>
                    <button 
                        onClick={() => setFilterOpen(!filterOpen)}
                        className='flex items-center gap-2 bg-pink-500 px-4 py-2 rounded-md text-white hover:bg-pink-600 transition-all shadow-md'
                    >
                        <FaFilter /> {filterOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
                
                <div className='flex flex-wrap gap-2 md:gap-4 justify-between items-end mb-4'>
                    <form onSubmit={handleSearch} className='flex flex-wrap items-center gap-3'>
                        <div className='flex flex-col gap-1'>
                            <input 
                                type="text" 
                                placeholder='Search products...' 
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className='px-4 py-2 rounded-md outline-none border border-pink-200 focus:border-pink-500 bg-white text-gray-700 w-full md:w-[300px]'
                            />
                        </div>
                        <button 
                            type='submit'
                            className='px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-blue-600 transition-all shadow-sm'
                        >
                            Search
                        </button>
                        <button 
                            type='button'
                            onClick={resetFilters}
                            className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all shadow-sm'
                        >
                            Reset
                        </button>
                    </form>
                    
                    <div className='flex items-center gap-3'>
                        <select
                            value={perPage}
                            onChange={(e) => setPerPage(Number(e.target.value))}
                            className='px-4 py-2 outline-none border border-pink-200 focus:border-pink-500 bg-white text-gray-700 rounded-md'
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={15}>15 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
                
                {filterOpen && (
                    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pb-4 mb-4 bg-pink-50 p-4 rounded-lg'>
                        <div className='flex flex-col gap-1'>
                            <label className='text-gray-700 text-sm font-medium'>Sort By</label>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className='px-4 py-2 outline-none border border-pink-200 focus:border-pink-500 bg-white text-gray-700 rounded-md'
                            >
                                <option value="createdAt">Created Date</option>
                                <option value="name">Product Name</option>
                                <option value="price">Price</option>
                                <option value="costPrice">Cost Price</option>
                                <option value="stock">Stock</option>
                                <option value="discount">Discount</option>
                            </select>
                        </div>
                        
                        <div className='flex flex-col gap-1'>
                            <label className='text-gray-700 text-sm font-medium'>Sort Order</label>
                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className='px-4 py-2 outline-none border border-pink-200 focus:border-pink-500 bg-white text-gray-700 rounded-md'
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>
                        
                        <div className='flex flex-col gap-1'>
                            <label className='text-gray-700 text-sm font-medium'>Category</label>
                            <select 
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className='px-4 py-2 outline-none border border-pink-200 focus:border-pink-500 bg-white text-gray-700 rounded-md'
                            >
                                <option value="">All Categories</option>
                                {categories?.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className='flex flex-col gap-1'>
                            <label className='text-gray-700 text-sm font-medium'>Minimum Price</label>
                            <input 
                                type="number" 
                                placeholder='Minimum price'
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                                className='px-4 py-2 outline-none border border-pink-200 focus:border-pink-500 bg-white text-gray-700 rounded-md'
                            />
                        </div>
                        
                        <div className='flex flex-col gap-1'>
                            <label className='text-gray-700 text-sm font-medium'>Maximum Price</label>
                            <input 
                                type="number" 
                                placeholder='Maximum price'
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                                className='px-4 py-2 outline-none border border-pink-200 focus:border-pink-500 bg-white text-gray-700 rounded-md'
                            />
                        </div>
                    </div>
                )}
            
                <div className='w-full'>
                    <div className='w-full overflow-x-auto'>
                        {loader ? (
                            <div className='flex justify-center items-center h-[200px]'>
                                <div className='animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full'></div>
                            </div>
                        ) : (
                            <>
                                <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
                                    <table className='w-full text-sm text-left text-gray-700'>
                                        <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                                            <tr>
                                                <th scope='col' className='py-3 px-4'>Image</th>
                                                <th scope='col' className='py-3 px-4'>Product Name</th>
                                                <th scope='col' className='py-3 px-4'>Category</th>
                                                <th scope='col' className='py-3 px-4'>Seller</th>
                                                <th scope='col' className='py-3 px-4'>Price</th>
                                                <th scope='col' className='py-3 px-4'>Cost Price</th>
                                                <th scope='col' className='py-3 px-4'>Discount</th>
                                                <th scope='col' className='py-3 px-4'>Stock</th>
                                                <th scope='col' className='py-3 px-4'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length > 0 ? (
                                                products.map((product, index) => (
                                                    <tr key={product._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                                                        <td className='py-3 px-4'>
                                                            <img 
                                                                className='w-[45px] h-[45px] object-cover rounded-md'
                                                                src={product.images[0] || 'https://via.placeholder.com/45'} 
                                                                alt={product.name} 
                                                            />
                                                        </td>
                                                        <td className='py-3 px-4 font-medium whitespace-nowrap'>{product.name}</td>
                                                        <td className='py-3 px-4'>{product.categoryName || 'N/A'}</td>
                                                        <td className='py-3 px-4'>{product.sellerName || 'N/A'}</td>
                                                        <td className='py-3 px-4 text-pink-600 font-medium'>${product.price}</td>
                                                        <td className='py-3 px-4'>${product.costPrice || 0}</td>
                                                        <td className='py-3 px-4'>
                                                            {product.discount > 0 ? (
                                                                <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">
                                                                    {product.discount}%
                                                                </span>
                                                            ) : (
                                                                <span className="bg-gray-300 px-2 py-1 rounded text-gray-700 text-xs">
                                                                    0%
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className='py-3 px-4'>
                                                            {product.stock > 10 ? (
                                                                <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">
                                                                    {product.stock}
                                                                </span>
                                                            ) : product.stock > 0 ? (
                                                                <span className="bg-yellow-500 px-2 py-1 rounded text-white text-xs">
                                                                    {product.stock}
                                                                </span>
                                                            ) : (
                                                                <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">
                                                                    Out of stock
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className='py-3 px-4 flex gap-2'>
                                                            <Link 
                                                                to={`/admin/dashboard/product/details/${product._id}`}
                                                                className='p-[6px] bg-green-500 rounded-md hover:bg-green-600 text-white'
                                                                title="View"
                                                            >
                                                                <FaEye />
                                                            </Link>
                                                            <button 
                                                                onClick={() => navigate(`/admin/dashboard/product/details/${product._id}?edit=true`)}
                                                                className='p-[6px] bg-blue-500 rounded-md hover:bg-blue-600 text-white'
                                                                title="Edit"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteProduct(product._id)}
                                                                className='p-[6px] bg-red-500 rounded-md hover:bg-red-600 text-white'
                                                                title="Delete"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="bg-white border-b border-pink-100">
                                                    <td colSpan={8} className='py-4 text-center'>No products found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {totalProduct > perPage && (
                                    <div className='flex justify-end mt-4'>
                                        <Pagination 
                                            pageNumber={currentPage}
                                            setPageNumber={handlePageChange}
                                            totalItem={totalProduct}
                                            perPage={perPage}
                                            showItem={3}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;