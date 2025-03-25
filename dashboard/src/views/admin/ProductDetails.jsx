// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import { admin_update_product, get_product, messageClear, product_image_update } from '../../store/Reducers/productReducer';
// import { get_categories } from '../../store/Reducers/categoryReducer';
// import toast from 'react-hot-toast';
// import { FaEdit, FaArrowLeft, FaCamera } from 'react-icons/fa';

// const ProductDetails = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { productId } = useParams();
//     const [searchParams] = useSearchParams();
//     const isEditMode = searchParams.get('edit') === 'true';
    
//     const { product, loader, successMessage, errorMessage } = useSelector(state => state.product);
//     const { categorys } = useSelector(state => state.category);
    
//     const [state, setState] = useState({
//         name: '',
//         description: '',
//         price: 0,
//         discount: 0,
//         stock: 0,
//         categoryId: ''
//     });
    
//     const [activateEdit, setActivateEdit] = useState(isEditMode);
//     const [currentImage, setCurrentImage] = useState(0);
//     const [imageFile, setImageFile] = useState(null);
//     const [imagePreview, setImagePreview] = useState('');
    
//     useEffect(() => {
//         dispatch(get_categories());
        
//         if (productId) {
//             dispatch(get_product(productId));
//         }
//     }, [dispatch, productId]);
    
//     useEffect(() => {
//         if (product && Object.keys(product).length > 0) {
//             setState({
//                 name: product.name,
//                 description: product.description,
//                 price: product.price,
//                 discount: product.discount,
//                 stock: product.stock,
//                 categoryId: product.categoryId?._id || product.categoryId
//             });
//         }
//     }, [product]);
    
//     const handleInputChange = (e) => {
//         setState({
//             ...state,
//             [e.target.name]: e.target.value
//         });
//     };
    
//     const updateProduct = (e) => {
//         e.preventDefault();
        
//         const updatedProduct = {
//             name: state.name,
//             description: state.description,
//             price: Number(state.price),
//             discount: Number(state.discount),
//             stock: Number(state.stock),
//             categoryId: state.categoryId,
//             productId: productId
//         };
        
//         dispatch(admin_update_product(updatedProduct));
//     };
    
//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setImageFile(file);
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setImagePreview(reader.result);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const updateImage = () => {
//         if (imageFile && product && product.images && product.images.length > 0) {
//             const formData = new FormData();
//             formData.append('newImage', imageFile);
//             dispatch(product_image_update({
//                 oldImage: product.images[currentImage],
//                 newImage: imageFile,
//                 productId: productId
//             }));
//             setImageFile(null);
//             setImagePreview('');
//         } else {
//             toast.error('Please select a new image to update');
//         }
//     };
    
//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage);
//             dispatch(messageClear());
            
//             // If in edit mode, turn off edit mode
//             if (activateEdit) {
//                 setActivateEdit(false);
//                 // Remove edit=true param from URL
//                 navigate(`/admin/dashboard/product/details/${productId}`, { replace: true });
//             }
//         }
//         if (errorMessage) {
//             toast.error(errorMessage);
//             dispatch(messageClear());
//         }
//     }, [successMessage, errorMessage, dispatch, navigate, productId, activateEdit]);
    
//     if (!product || Object.keys(product).length === 0) {
//         return (
//             <div className='px-2 lg:px-7 pt-5'>
//                 <div className='w-full p-4 bg-[#6a5fdf] rounded-md flex justify-center items-center h-[200px]'>
//                     <div className='animate-spin h-6 w-6 border-2 border-dotted border-white rounded-full'></div>
//                 </div>
//             </div>
//         );
//     }
    
//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//                 <div className='flex justify-between items-center pb-4 border-b border-slate-700'>
//                     <div className='flex items-center gap-3'>
//                         <Link to='/admin/dashboard/products' className='text-white p-2 rounded hover:bg-blue-600'>
//                             <FaArrowLeft />
//                         </Link>
//                         <h2 className='text-xl font-semibold text-white'>Product Details</h2>
//                     </div>
//                     {!activateEdit && (
//                         <button 
//                             onClick={() => {
//                                 setActivateEdit(true);
//                                 navigate(`/admin/dashboard/product/details/${productId}?edit=true`, { replace: true });
//                             }}
//                             className='flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
//                         >
//                             <FaEdit />
//                             <span>Edit</span>
//                         </button>
//                     )}
//                 </div>
                
//                 <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
//                     {/* Left side - Product images */}
//                     <div>
//                         <div className='flex flex-col gap-4'>
//                             <div className='w-full h-[350px] overflow-hidden relative'>
//                                 <img 
//                                     src={imagePreview || product.images[currentImage] || 'https://via.placeholder.com/350'} 
//                                     alt={product.name} 
//                                     className='w-full h-full object-contain rounded-md'
//                                 />
                                
//                                 {activateEdit && (
//                                     <div className='absolute bottom-2 right-2 flex gap-2'>
//                                         <label htmlFor='image-upload' className='p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600'>
//                                             <FaCamera />
//                                             <input 
//                                                 type='file' 
//                                                 id='image-upload' 
//                                                 className='hidden' 
//                                                 accept='image/*'
//                                                 onChange={handleImageChange}
//                                             />
//                                         </label>
                                        
//                                         {imageFile && (
//                                             <button 
//                                                 onClick={updateImage}
//                                                 className='p-2 bg-green-500 rounded-full hover:bg-green-600 text-xs'
//                                             >
//                                                 Update
//                                             </button>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                             <div className='flex flex-wrap gap-2'>
//                                 {product.images.map((img, i) => (
//                                     <div 
//                                         key={i} 
//                                         onClick={() => setCurrentImage(i)}
//                                         className={`w-[70px] h-[70px] overflow-hidden rounded-md cursor-pointer border-2 ${currentImage === i ? 'border-green-500' : 'border-transparent'}`}
//                                     >
//                                         <img 
//                                             src={img} 
//                                             alt={`Product ${i+1}`} 
//                                             className='w-full h-full object-cover'
//                                         />
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
                    
//                     {/* Right side - Product information */}
//                     <div className='text-white'>
//                         {activateEdit ? (
//                             <form onSubmit={updateProduct} className='flex flex-col gap-4'>
//                                 <div className='flex flex-col gap-1'>
//                                     <label htmlFor='name'>Product Name</label>
//                                     <input 
//                                         type='text' 
//                                         id='name' 
//                                         name='name' 
//                                         value={state.name} 
//                                         onChange={handleInputChange}
//                                         className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
//                                         required
//                                     />
//                                 </div>
                                
//                                 <div className='flex flex-col gap-1'>
//                                     <label htmlFor='categoryId'>Category</label>
//                                     <select 
//                                         id='categoryId' 
//                                         name='categoryId' 
//                                         value={state.categoryId} 
//                                         onChange={handleInputChange}
//                                         className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
//                                         required
//                                     >
//                                         <option value=''>Select category</option>
//                                         {categorys?.map(category => (
//                                             <option key={category._id} value={category._id}>{category.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                
//                                 <div className='grid grid-cols-3 gap-3'>
//                                     <div className='flex flex-col gap-1'>
//                                         <label htmlFor='price'>Price</label>
//                                         <input 
//                                             type='number' 
//                                             id='price' 
//                                             name='price' 
//                                             value={state.price} 
//                                             onChange={handleInputChange}
//                                             className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
//                                             required
//                                             min='0'
//                                         />
//                                     </div>
                                    
//                                     <div className='flex flex-col gap-1'>
//                                         <label htmlFor='discount'>Discount (%)</label>
//                                         <input 
//                                             type='number' 
//                                             id='discount' 
//                                             name='discount' 
//                                             value={state.discount} 
//                                             onChange={handleInputChange}
//                                             className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
//                                             required
//                                             min='0'
//                                             max='100'
//                                         />
//                                     </div>
                                    
//                                     <div className='flex flex-col gap-1'>
//                                         <label htmlFor='stock'>Stock</label>
//                                         <input 
//                                             type='number' 
//                                             id='stock' 
//                                             name='stock' 
//                                             value={state.stock} 
//                                             onChange={handleInputChange}
//                                             className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
//                                             required
//                                             min='0'
//                                         />
//                                     </div>
//                                 </div>
                                
//                                 <div className='flex flex-col gap-1'>
//                                     <label htmlFor='description'>Description</label>
//                                     <textarea 
//                                         id='description' 
//                                         name='description' 
//                                         value={state.description} 
//                                         onChange={handleInputChange}
//                                         className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white min-h-[150px]'
//                                         required
//                                     ></textarea>
//                                 </div>
                                
//                                 <div className='flex gap-3 mt-4'>
//                                     <button 
//                                         type='submit' 
//                                         disabled={loader}
//                                         className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed'
//                                     >
//                                         {loader ? 'Saving...' : 'Save Changes'}
//                                     </button>
                                    
//                                     <button 
//                                         type='button' 
//                                         onClick={() => {
//                                             setActivateEdit(false);
//                                             navigate(`/admin/dashboard/product/details/${productId}`, { replace: true });
//                                         }}
//                                         className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </form>
//                         ) : (
//                             <div className='flex flex-col gap-4'>
//                                 <div>
//                                     <h1 className='text-2xl font-bold'>{product.name}</h1>
//                                     <div className='flex items-center gap-2 mt-2'>
//                                         <span className='text-sm text-gray-300'>Category:</span>
//                                         <span className='bg-blue-500 px-2 py-1 rounded text-xs'>
//                                             {product.categoryId?.name || 'No category'}
//                                         </span>
//                                     </div>
//                                 </div>
                                
//                                 <div className='grid grid-cols-3 gap-4 mt-2'>
//                                     <div className='bg-[#475569] p-3 rounded-md'>
//                                         <h3 className='text-gray-500 text-sm'>Price</h3>
//                                         <p className='text-lg font-bold'>${product.price}</p>
//                                     </div>
                                    
//                                     <div className='bg-[#475569] p-3 rounded-md'>
//                                         <h3 className='text-gray-500 text-sm'>Discount</h3>
//                                         <p className='text-lg font-bold'>{product.discount}%</p>
//                                     </div>
                                    
//                                     <div className='bg-[#475569] p-3 rounded-md'>
//                                         <h3 className='text-gray-500 text-sm'>Stock</h3>
//                                         <p className='text-lg font-bold'>{product.stock}</p>
//                                     </div>
//                                 </div>
                                
//                                 <div className='mt-4'>
//                                     <h3 className='text-gray-300 mb-2'>Product Description</h3>
//                                     <div className='bg-[#475569] p-3 rounded-md'>
//                                         <p className='whitespace-pre-wrap'>{product.description}</p>
//                                     </div>
//                                 </div>
                                
//                                 {product.sellerId && (
//                                     <div className='mt-4'>
//                                         <h3 className='text-gray-300 mb-2'>Seller Information</h3>
//                                         <div className='bg-[#475569] p-3 rounded-md flex items-center gap-3'>
//                                             <div className='w-12 h-12 rounded-full overflow-hidden'>
//                                                 <img 
//                                                     src={product.sellerId.image || 'https://via.placeholder.com/100'} 
//                                                     alt={product.sellerId.name} 
//                                                     className='w-full h-full object-cover'
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <h4 className='font-semibold'>{product.sellerId.name}</h4>
//                                                 <p className='text-sm text-gray-300'>{product.sellerId.email}</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProductDetails; 
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { admin_update_product, get_product, messageClear, product_image_update } from '../../store/Reducers/productReducer';
import { get_categories } from '../../store/Reducers/categoryReducer';
import toast from 'react-hot-toast';
import { FaEdit, FaArrowLeft, FaCamera } from 'react-icons/fa';

const ProductDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { productId } = useParams();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    
    const { product, loader, successMessage, errorMessage } = useSelector(state => state.product);
    const { categorys } = useSelector(state => state.category);
    
    const [state, setState] = useState({
        name: '',
        description: '',
        price: 0,
        discount: 0,
        stock: 0,
        categoryId: '',
        costPrice: 0
    });
    
    const [activateEdit, setActivateEdit] = useState(isEditMode);
    const [currentImage, setCurrentImage] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    
    useEffect(() => {
        dispatch(get_categories());
        
        if (productId) {
            dispatch(get_product(productId));
        }
    }, [dispatch, productId]);
    
    useEffect(() => {
        if (product && Object.keys(product).length > 0) {
            setState({
                name: product.name,
                description: product.description,
                price: product.price,
                discount: product.discount,
                stock: product.stock,
                categoryId: product.categoryId?._id || product.categoryId,
                costPrice: product.costPrice || 0
            });
        }
    }, [product]);
    
    const handleInputChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };
    
    const updateProduct = (e) => {
        e.preventDefault();
        
        const updatedProduct = {
            name: state.name,
            description: state.description,
            price: Number(state.price),
            discount: Number(state.discount),
            stock: Number(state.stock),
            categoryId: state.categoryId,
            costPrice: Number(state.costPrice),
            productId: productId
        };
        
        dispatch(admin_update_product(updatedProduct));
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateImage = () => {
        if (imageFile && product && product.images && product.images.length > 0) {
            const formData = new FormData();
            formData.append('newImage', imageFile);
            dispatch(product_image_update({
                oldImage: product.images[currentImage],
                newImage: imageFile,
                productId: productId
            }));
            setImageFile(null);
            setImagePreview('');
        } else {
            toast.error('Please select a new image to update');
        }
    };
    
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            
            // If in edit mode, turn off edit mode
            if (activateEdit) {
                setActivateEdit(false);
                // Remove edit=true param from URL
                navigate(`/admin/dashboard/product/details/${productId}`, { replace: true });
            }
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate, productId, activateEdit]);
    
    if (!product || Object.keys(product).length === 0) {
        return (
            <div className='px-2 lg:px-7 pt-5'>
                <div className='w-full p-4 bg-white rounded-md shadow-md flex justify-center items-center h-[200px]'>
                    <div className='animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full'></div>
                </div>
            </div>
        );
    }
    
    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-md shadow-md'>
                <div className='flex justify-between items-center pb-4 border-b border-pink-100'>
                    <div className='flex items-center gap-3'>
                        <Link to='/admin/dashboard/products' className='text-gray-600 p-2 rounded-full hover:bg-pink-50 transition-all'>
                            <FaArrowLeft />
                        </Link>
                        <h2 className='text-xl font-semibold text-pink-600'>Product Details</h2>
                    </div>
                    {!activateEdit && (
                        <button 
                            onClick={() => {
                                setActivateEdit(true);
                                navigate(`/admin/dashboard/product/details/${productId}?edit=true`, { replace: true });
                            }}
                            className='flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-all shadow-sm'
                        >
                            <FaEdit />
                            <span>Edit Product</span>
                        </button>
                    )}
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                    {/* Left side - Product images */}
                    <div>
                        <div className='flex flex-col gap-4'>
                            <div className='w-full h-[350px] overflow-hidden relative bg-gray-50 rounded-lg border border-pink-100 flex items-center justify-center'>
                                <img 
                                    src={imagePreview || product.images[currentImage] || 'https://via.placeholder.com/350'} 
                                    alt={product.name} 
                                    className='max-w-full max-h-full object-contain'
                                />
                                
                                {activateEdit && (
                                    <div className='absolute bottom-3 right-3 flex gap-2'>
                                        <label htmlFor='image-upload' className='p-2 bg-pink-500 text-white rounded-full cursor-pointer hover:bg-pink-600 transition-all shadow-md'>
                                            <FaCamera />
                                            <input 
                                                type='file' 
                                                id='image-upload' 
                                                className='hidden' 
                                                accept='image/*'
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        
                                        {imageFile && (
                                            <button 
                                                onClick={updateImage}
                                                className='p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-md'
                                            >
                                                Update
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {product.images && product.images.map((img, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setCurrentImage(i)}
                                        className={`w-[70px] h-[70px] overflow-hidden rounded-md cursor-pointer border-2 ${currentImage === i ? 'border-pink-500' : 'border-pink-100'}`}
                                    >
                                        <img 
                                            src={img} 
                                            alt={`Product ${i+1}`} 
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side - Product information */}
                    <div className='text-gray-700'>
                        {activateEdit ? (
                            <form onSubmit={updateProduct} className='flex flex-col gap-4'>
                                <div className='flex flex-col gap-1'>
                                    <label htmlFor='name' className='text-gray-600 font-medium'>Product Name</label>
                                    <input 
                                        type='text' 
                                        id='name' 
                                        name='name' 
                                        value={state.name} 
                                        onChange={handleInputChange}
                                        className='px-4 py-2 bg-white border border-pink-200 rounded-md outline-none focus:border-pink-500'
                                        required
                                    />
                                </div>
                                
                                <div className='flex flex-col gap-1'>
                                    <label htmlFor='categoryId' className='text-gray-600 font-medium'>Category</label>
                                    <select 
                                        id='categoryId' 
                                        name='categoryId' 
                                        value={state.categoryId} 
                                        onChange={handleInputChange}
                                        className='px-4 py-2 bg-white border border-pink-200 rounded-md outline-none focus:border-pink-500'
                                        required
                                    >
                                        <option value=''>Select category</option>   
                                        {categorys?.map(category => (
                                            <option key={category._id} value={category._id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className='grid grid-cols-3 gap-3'>
                                    <div className='flex flex-col gap-1'>
                                        <label htmlFor='price' className='text-gray-600 font-medium'>Price</label>
                                        <input 
                                            type='number' 
                                            id='price' 
                                            name='price' 
                                            value={state.price} 
                                            onChange={handleInputChange}
                                            className='px-4 py-2 bg-white border border-pink-200 rounded-md outline-none focus:border-pink-500'
                                            required
                                        />
                                    </div>
                                    
                                    <div className='flex flex-col gap-1'>
                                        <label htmlFor='text-gray-600 font-medium'>Cost Price</label>
                                        <input 
                                            type='number' 
                                            id='costPrice' 
                                            name='costPrice' 
                                            value={state.costPrice} 
                                            onChange={handleInputChange}
                                            className='px-4 py-2 bg-white border border-pink-200 rounded-md outline-none focus:border-pink-500'
                                        />
                                    </div>
                                    
                                    <div className='flex flex-col gap-1'>
                                        <label htmlFor='discount' className='text-gray-600 font-medium'>Discount (%)</label>
                                        <input 
                                            type='number' 
                                            id='discount' 
                                            name='discount' 
                                            value={state.discount} 
                                            onChange={handleInputChange}
                                            className='px-4 py-2 bg-white border border-pink-200 rounded-md outline-none focus:border-pink-500'
                                            required
                                            min='0'
                                            max='100'
                                        />
                                    </div>
                                    
                                    <div className='flex flex-col gap-1'>
                                        <label htmlFor='stock' className='text-gray-600 font-medium'>Stock</label>
                                        <input 
                                            type='number' 
                                            id='stock' 
                                            name='stock' 
                                            value={state.stock} 
                                            onChange={handleInputChange}
                                            className='px-4 py-2 bg-white border border-pink-200 rounded-md outline-none focus:border-pink-500'
                                            required
                                            min='0'
                                        />
                                    </div>
                                </div>
                                
                                <div className='flex flex-col gap-1'>
                                    <label htmlFor='description' className='text-gray-600 font-medium'>Description</label>
                                    <textarea 
                                        id='description' 
                                        name='description' 
                                        value={state.description} 
                                        onChange={handleInputChange}
                                        className='px-4 py-2 bg-white border border-pink-200 rounded-md outline-none focus:border-pink-500 min-h-[150px]'
                                        required
                                    ></textarea>
                                </div>
                                
                                <div className='flex gap-3 mt-4'>
                                    <button 
                                        type='submit' 
                                        disabled={loader}
                                        className='px-5 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-all shadow-sm disabled:bg-pink-300 disabled:cursor-not-allowed'
                                    >
                                        {loader ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    
                                    <button 
                                        type='button' 
                                        onClick={() => {
                                            setActivateEdit(false);
                                            navigate(`/admin/dashboard/product/details/${productId}`, { replace: true });
                                        }}
                                        className='px-5 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all shadow-sm'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className='flex flex-col gap-4'>
                                <div className='border-b border-pink-100 pb-3'>
                                    <h1 className='text-2xl font-bold text-gray-800'>{product.name}</h1>
                                    <div className='flex items-center gap-2 mt-2'>
                                        <span className='text-sm text-gray-500'>Category:</span>
                                        <span className='bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-medium'>
                                            {product.categoryId?.name || 'No category'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-3 gap-4 mt-2'>
                                    <div className='bg-pink-50 p-4 rounded-lg border border-pink-100'>
                                        <h3 className='text-gray-500 text-sm'>Price</h3>
                                        <p className='text-lg font-bold text-pink-600'>${product.price}</p>
                                    </div>
                                    
                                    <div className='bg-pink-50 p-4 rounded-lg border border-pink-100'>
                                        <h3 className='text-gray-500 text-sm'>Cost Price</h3>
                                        <p className='text-lg font-bold'>${product.costPrice || 0}</p>
                                    </div>
                                    
                                    <div className='bg-pink-50 p-4 rounded-lg border border-pink-100'>
                                        <h3 className='text-gray-500 text-sm'>Discount</h3>
                                        <p className='text-lg font-bold'>{product.discount}%</p>
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-2 gap-4 mt-2'>
                                    <div className='bg-pink-50 p-4 rounded-lg border border-pink-100'>
                                        <h3 className='text-gray-500 text-sm'>Stock</h3>
                                        <p className='text-lg font-bold'>{product.stock}</p>
                                    </div>
                                    
                                    <div className='bg-pink-50 p-4 rounded-lg border border-pink-100'>
                                        <h3 className='text-gray-500 text-sm'>Discount</h3>
                                        <p className='text-lg font-bold'>
                                            {product.discount > 0 ? (
                                                <span className="text-green-600">{product.discount}%</span>
                                            ) : (
                                                <span className="text-gray-500">0%</span>
                                            )}
                                        </p>
                                    </div>
                                    
                                    <div className='bg-pink-50 p-4 rounded-lg border border-pink-100'>
                                        <h3 className='text-gray-500 text-sm'>Stock</h3>
                                        <p className='text-lg font-bold'>
                                            {product.stock > 10 ? (
                                                <span className="text-green-600">{product.stock}</span>
                                            ) : product.stock > 0 ? (
                                                <span className="text-yellow-600">{product.stock}</span>
                                            ) : (
                                                <span className="text-red-600">Out of stock</span>
                                            )}
                                        </p>
                                    </div>
                                    
                                    <div className='bg-pink-50 p-4 rounded-lg border border-pink-100'>
                                        <h3 className='text-gray-500 text-sm'>Profit Margin</h3>
                                        <p className='text-lg font-bold'>
                                            {product.costPrice ? ((product.price - product.costPrice) / product.price * 100).toFixed(2) : 100}%
                                        </p>
                                    </div>
                                </div>
                                
                                <div className='mt-4'>
                                    <h3 className='text-gray-700 font-medium mb-2'>Product Description</h3>
                                    <div className='bg-gray-50 p-4 rounded-lg border border-pink-100'>
                                        <p className='whitespace-pre-wrap text-gray-700'>{product.description}</p>
                                    </div>
                                </div>
                                
                                {product.sellerId && (
                                    <div className='mt-6'>
                                        <h3 className='text-gray-700 font-medium mb-2'>Seller Information</h3>
                                        <div className='bg-pink-50 p-4 rounded-lg border border-pink-100 flex items-center gap-4'>
                                            <div className='w-12 h-12 rounded-full overflow-hidden shadow-sm border border-pink-200'>
                                                <img 
                                                    src={product.sellerId.image || 'https://via.placeholder.com/100'} 
                                                    alt={product.sellerId.name} 
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                            <div>
                                                <h4 className='font-semibold text-gray-800'>{product.sellerId.name}</h4>
                                                <p className='text-sm text-gray-500'>{product.sellerId.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;