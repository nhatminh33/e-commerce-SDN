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
        categoryId: ''
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
                categoryId: product.categoryId?._id || product.categoryId
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
                <div className='w-full p-4 bg-[#6a5fdf] rounded-md flex justify-center items-center h-[200px]'>
                    <div className='animate-spin h-6 w-6 border-2 border-dotted border-white rounded-full'></div>
                </div>
            </div>
        );
    }
    
    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
                <div className='flex justify-between items-center pb-4 border-b border-slate-700'>
                    <div className='flex items-center gap-3'>
                        <Link to='/admin/dashboard/products' className='text-white p-2 rounded hover:bg-blue-600'>
                            <FaArrowLeft />
                        </Link>
                        <h2 className='text-xl font-semibold text-white'>Product Details</h2>
                    </div>
                    {!activateEdit && (
                        <button 
                            onClick={() => {
                                setActivateEdit(true);
                                navigate(`/admin/dashboard/product/details/${productId}?edit=true`, { replace: true });
                            }}
                            className='flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
                        >
                            <FaEdit />
                            <span>Edit</span>
                        </button>
                    )}
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                    {/* Left side - Product images */}
                    <div>
                        <div className='flex flex-col gap-4'>
                            <div className='w-full h-[350px] overflow-hidden relative'>
                                <img 
                                    src={imagePreview || product.images[currentImage] || 'https://via.placeholder.com/350'} 
                                    alt={product.name} 
                                    className='w-full h-full object-contain rounded-md'
                                />
                                
                                {activateEdit && (
                                    <div className='absolute bottom-2 right-2 flex gap-2'>
                                        <label htmlFor='image-upload' className='p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600'>
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
                                                className='p-2 bg-green-500 rounded-full hover:bg-green-600 text-xs'
                                            >
                                                Update
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {product.images.map((img, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setCurrentImage(i)}
                                        className={`w-[70px] h-[70px] overflow-hidden rounded-md cursor-pointer border-2 ${currentImage === i ? 'border-green-500' : 'border-transparent'}`}
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
                    <div className='text-white'>
                        {activateEdit ? (
                            <form onSubmit={updateProduct} className='flex flex-col gap-4'>
                                <div className='flex flex-col gap-1'>
                                    <label htmlFor='name'>Product Name</label>
                                    <input 
                                        type='text' 
                                        id='name' 
                                        name='name' 
                                        value={state.name} 
                                        onChange={handleInputChange}
                                        className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
                                        required
                                    />
                                </div>
                                
                                <div className='flex flex-col gap-1'>
                                    <label htmlFor='categoryId'>Category</label>
                                    <select 
                                        id='categoryId' 
                                        name='categoryId' 
                                        value={state.categoryId} 
                                        onChange={handleInputChange}
                                        className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
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
                                        <label htmlFor='price'>Price</label>
                                        <input 
                                            type='number' 
                                            id='price' 
                                            name='price' 
                                            value={state.price} 
                                            onChange={handleInputChange}
                                            className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
                                            required
                                            min='0'
                                        />
                                    </div>
                                    
                                    <div className='flex flex-col gap-1'>
                                        <label htmlFor='discount'>Discount (%)</label>
                                        <input 
                                            type='number' 
                                            id='discount' 
                                            name='discount' 
                                            value={state.discount} 
                                            onChange={handleInputChange}
                                            className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
                                            required
                                            min='0'
                                            max='100'
                                        />
                                    </div>
                                    
                                    <div className='flex flex-col gap-1'>
                                        <label htmlFor='stock'>Stock</label>
                                        <input 
                                            type='number' 
                                            id='stock' 
                                            name='stock' 
                                            value={state.stock} 
                                            onChange={handleInputChange}
                                            className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white'
                                            required
                                            min='0'
                                        />
                                    </div>
                                </div>
                                
                                <div className='flex flex-col gap-1'>
                                    <label htmlFor='description'>Description</label>
                                    <textarea 
                                        id='description' 
                                        name='description' 
                                        value={state.description} 
                                        onChange={handleInputChange}
                                        className='px-3 py-2 bg-[#475569] border border-slate-700 rounded-md outline-none focus:border-indigo-500 text-white min-h-[150px]'
                                        required
                                    ></textarea>
                                </div>
                                
                                <div className='flex gap-3 mt-4'>
                                    <button 
                                        type='submit' 
                                        disabled={loader}
                                        className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed'
                                    >
                                        {loader ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    
                                    <button 
                                        type='button' 
                                        onClick={() => {
                                            setActivateEdit(false);
                                            navigate(`/admin/dashboard/product/details/${productId}`, { replace: true });
                                        }}
                                        className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className='flex flex-col gap-4'>
                                <div>
                                    <h1 className='text-2xl font-bold'>{product.name}</h1>
                                    <div className='flex items-center gap-2 mt-2'>
                                        <span className='text-sm text-gray-300'>Category:</span>
                                        <span className='bg-blue-500 px-2 py-1 rounded text-xs'>
                                            {product.categoryId?.name || 'No category'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-3 gap-4 mt-2'>
                                    <div className='bg-[#475569] p-3 rounded-md'>
                                        <h3 className='text-gray-300 text-sm'>Price</h3>
                                        <p className='text-lg font-bold'>${product.price}</p>
                                    </div>
                                    
                                    <div className='bg-[#475569] p-3 rounded-md'>
                                        <h3 className='text-gray-300 text-sm'>Discount</h3>
                                        <p className='text-lg font-bold'>{product.discount}%</p>
                                    </div>
                                    
                                    <div className='bg-[#475569] p-3 rounded-md'>
                                        <h3 className='text-gray-300 text-sm'>Stock</h3>
                                        <p className='text-lg font-bold'>{product.stock}</p>
                                    </div>
                                </div>
                                
                                <div className='mt-4'>
                                    <h3 className='text-gray-300 mb-2'>Product Description</h3>
                                    <div className='bg-[#475569] p-3 rounded-md'>
                                        <p className='whitespace-pre-wrap'>{product.description}</p>
                                    </div>
                                </div>
                                
                                {product.sellerId && (
                                    <div className='mt-4'>
                                        <h3 className='text-gray-300 mb-2'>Seller Information</h3>
                                        <div className='bg-[#475569] p-3 rounded-md flex items-center gap-3'>
                                            <div className='w-12 h-12 rounded-full overflow-hidden'>
                                                <img 
                                                    src={product.sellerId.image || 'https://via.placeholder.com/100'} 
                                                    alt={product.sellerId.name} 
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                            <div>
                                                <h4 className='font-semibold'>{product.sellerId.name}</h4>
                                                <p className='text-sm text-gray-300'>{product.sellerId.email}</p>
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