import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoMdImages } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { get_category } from '../../store/Reducers/categoryReducer';
import { get_product, update_product, messageClear, product_image_update } from '../../store/Reducers/productReducer';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import toast from 'react-hot-toast';

const EditProduct = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const { categorys } = useSelector(state => state.category);
    const { product, loader, successMessage, errorMessage } = useSelector(state => state.product);
    const { userInfo } = useSelector(state => state.auth);
    
    useEffect(() => {
        dispatch(get_category({
            searchValue: '',
            parPage: '',
            page: ""
        }));
    }, [dispatch]);

    useEffect(() => {
        if (productId) {
            dispatch(get_product(productId));
        }
    }, [productId, dispatch]);

    const [state, setState] = useState({
        name: "",
        description: '',
        discount: 0,
        price: "",
        stock: "",
        costPrice: ""
    });

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const [cateShow, setCateShow] = useState(false);
    const [category, setCategory] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [allCategory, setAllCategory] = useState([]);
    const [searchValue, setSearchValue] = useState(''); 
  
    const categorySearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (value) {
            let srcValue = allCategory.filter(c => c.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
            setAllCategory(srcValue);
        } else {
            setAllCategory(categorys);
        }
    };
 
    const [imageShow, setImageShow] = useState([]);

    const changeImage = (img, files) => {
        if (files.length > 0) {
            dispatch(product_image_update({
                oldImage: img,
                newImage: files[0],
                productId
            }));
        }
    };

    useEffect(() => {
        if (product && product._id) {
            setState({
                name: product.name || '',
                description: product.description || '',
                discount: product.discount || 0,
                price: product.price || '',
                stock: product.stock || '',
                costPrice: product.costPrice || ''
            });
            setCategory(product.categoryId?.name || '');
            setCategoryId(product.categoryId?._id || '');
            setImageShow(product.images || []);
        }
    }, [product]);

    useEffect(() => {
        if (categorys.length > 0) {
            setAllCategory(categorys);
        }
    }, [categorys]);

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

    const update = (e) => {
        e.preventDefault();
        const obj = {
            name: state.name,
            description: state.description,
            discount: state.discount,
            price: state.price,
            stock: state.stock,
            costPrice: state.costPrice || 0,
            categoryId: categoryId,
            productId: productId,
            sellerId: userInfo._id
        };
        dispatch(update_product(obj));
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
                <div className='flex justify-between items-center pb-4'>
                    <h1 className='text-[#d0d2d6] text-xl font-semibold'>Edit Product</h1>
                    <Link to='/seller/dashboard/products' className='bg-blue-500 hover:shadow-blue-500/50 hover:shadow-lg text-white rounded-sm px-7 py-2 my-2'>All Products</Link> 
                </div>
                <div>
                    <form onSubmit={update}>
                        <div className='flex flex-col mb-3 md:flex-row gap-4 w-full text-[#d0d2d6]'>
                            <div className='flex flex-col w-full gap-1'>
                                <label htmlFor="name">Product Name</label>
                                <input 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
                                    onChange={inputHandle} 
                                    value={state.name} 
                                    type="text" 
                                    name='name' 
                                    id='name' 
                                    placeholder='Product Name' 
                                    required
                                />
                            </div>  

                            <div className='flex flex-col w-full gap-1 relative'>
                                <label htmlFor="category">Category</label>
                                <input 
                                    readOnly 
                                    onClick={()=> setCateShow(!cateShow)} 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
                                    value={category} 
                                    type="text" 
                                    id='category' 
                                    placeholder='--Select Category--' 
                                    required
                                />

                                <div className={`absolute top-[101%] bg-[#475569] w-full transition-all ${cateShow ? 'scale-100' : 'scale-0' } `}>
                                    <div className='w-full px-4 py-2 fixed'>
                                        <input 
                                            value={searchValue} 
                                            onChange={categorySearch} 
                                            className='px-3 py-1 w-full focus:border-indigo-500 outline-none bg-transparent border border-slate-700 rounded-md text-[#d0d2d6] overflow-hidden' 
                                            type="text" 
                                            placeholder='Search' 
                                        /> 
                                    </div>
                                    <div className='pt-14'></div>
                                    <div className='flex justify-start items-start flex-col h-[200px] overflow-x-scrool'>
                                        {
                                            allCategory.length > 0 && allCategory.map((c, i) => (
                                                <span 
                                                    key={i}
                                                    className={`px-4 py-2 hover:bg-indigo-500 hover:text-white hover:shadow-lg w-full cursor-pointer ${category === c.name && 'bg-indigo-500'}`} 
                                                    onClick={()=> {
                                                        setCateShow(false);
                                                        setCategory(c.name);
                                                        setCategoryId(c._id);
                                                        setSearchValue('');
                                                        setAllCategory(categorys);
                                                    }}
                                                >
                                                    {c.name}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>  
                        </div>

                        <div className='flex flex-col mb-3 md:flex-row gap-4 w-full text-[#d0d2d6]'>
                            <div className='flex flex-col w-full gap-1'>
                                <label htmlFor="stock">Stock</label>
                                <input 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
                                    onChange={inputHandle} 
                                    value={state.stock} 
                                    type="number" 
                                    name='stock' 
                                    id='stock' 
                                    placeholder='Stock Quantity' 
                                    required
                                />
                            </div>  

                            <div className='flex flex-col w-full gap-1'>
                                <label htmlFor="price">Price</label>
                                <input 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
                                    onChange={inputHandle} 
                                    value={state.price} 
                                    type="number" 
                                    name='price' 
                                    id='price' 
                                    placeholder='Price' 
                                    required
                                />
                            </div>

                            <div className='flex flex-col w-full gap-1'>
                                <label htmlFor="costPrice">Cost Price</label>
                                <input 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
                                    onChange={inputHandle} 
                                    value={state.costPrice} 
                                    type="number" 
                                    name='costPrice' 
                                    id='costPrice' 
                                    placeholder='Cost Price' 
                                />
                            </div>
                        </div>

                        <div className='flex flex-col mb-3 md:flex-row gap-4 w-full text-[#d0d2d6]'>
                            <div className='flex flex-col w-full gap-1'>
                                <label htmlFor="discount">Discount (%)</label>
                                <input 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
                                    onChange={inputHandle} 
                                    value={state.discount} 
                                    type="number" 
                                    name='discount' 
                                    id='discount' 
                                    placeholder='Discount (%)' 
                                />
                            </div> 

                            <div className='flex flex-col w-full gap-1'>
                                <label htmlFor="description" className='text-[#d0d2d6]'>Description</label>
                                <textarea 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
                                    onChange={inputHandle} 
                                    value={state.description} 
                                    name='description' 
                                    id='description' 
                                    placeholder='Product Description' 
                                    cols="10" 
                                    rows="4"
                                    required
                                ></textarea> 
                            </div>
                        </div> 

                        <div className='grid lg:grid-cols-4 grid-cols-1 md:grid-cols-3 sm:grid-cols-2 sm:gap-4 md:gap-4 gap-3 w-full text-[#d0d2d6] mb-4'>
                            {
                                (imageShow && imageShow.length > 0) && imageShow.map((img, i) => (
                                    <div key={i} className='h-[180px] relative'>
                                        <label htmlFor={`img-${i}`}>
                                            <img className='w-full h-full object-cover rounded-sm' src={img} alt="" />
                                        </label>
                                        <input 
                                            onChange={(e) => changeImage(img, e.target.files)} 
                                            type="file" 
                                            id={`img-${i}`} 
                                            className='hidden' 
                                        />
                                    </div>
                                ))
                            }
                        </div>

                        <div className='flex'>
                            <button 
                                disabled={loader ? true : false}  
                                className='bg-red-500 w-[280px] hover:shadow-red-300/50 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3'
                            >
                                {
                                    loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Save Changes'
                                } 
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;