// import React, { useEffect, useState } from 'react';
// import { FaRegImage } from "react-icons/fa";
// import { PropagateLoader } from 'react-spinners';
// import { overrideStyle } from '../../utils/utils';
// import { useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { add_banner,get_banner,messageClear, update_banner } from '../../store/Reducers/bannerReducer';
// import toast from 'react-hot-toast';

// const AddBanner = () => {
    
//     const {productId} = useParams()
//     const dispatch = useDispatch()

//     const { loader,successMessage,errorMessage,banner } = useSelector(state => state.banner)

//     const [imageShow, setImageShow] = useState('')
//     const [image, setImage] = useState('')

//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage)
//             dispatch(messageClear())
//         }
//         if (errorMessage) {
//             toast.error(errorMessage)
//             dispatch(messageClear())
//         }
//     },[successMessage,errorMessage])

//     const imageHandle = (e) => {
//         const files = e.target.files 
//         const length = files.length

//         if (length > 0) {
//             setImage(files[0])
//             setImageShow(URL.createObjectURL(files[0]))
//         } 
//     }

//     const add = (e) => {
//         e.preventDefault()
//         const formData = new FormData()
//         formData.append('productId',productId)
//         formData.append('mainban',image)
//         dispatch(add_banner(formData))
//     }

//     const update = (e) => {
//         e.preventDefault()
//         const formData = new FormData()
//         formData.append('mainban',image)
//         dispatch(update_banner({info:formData,bannerId: banner._id}))
//     }

//     useEffect(() => {
//         dispatch(get_banner(productId))
//     },[productId])

//     return (
//     <div className='px-2 lg:px-7 pt-5'>
//         <h1 className='text-[#000000] font-semibold text-lg mb-3'>Add Banner</h1> 
//         <div className='w-full p-4 bg-[#6a5fdf] rounded-md'> 
        

//         {
//             !banner && <div>
//                 <form onSubmit={add}>
//          <div className='mb-4'>
//             <label className='flex justify-center items-center flex-col h-[180px] cursor-pointer border border-dashed hover:border-red-500 w-full text-white' htmlFor="image">
//                 <span className='text-4xl'><FaRegImage /></span>
//                 <span>Select Banner Image </span>
//             </label>
//             <input required onChange={imageHandle} className='hidden' type="file" id='image' />
//             </div>

//             {
//                 imageShow && <div className='mb-4'>
//                     <img className='w-full h-[300px]' src={imageShow} alt="" />
//                 </div>
//             }

//             <button disabled={loader ? true : false}  className='bg-red-500 w-[280px] hover:shadow-red-300/50 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3'>
//             {
//                loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Add Banner'
//             } 
//             </button>

//         </form> 

//             </div>
//         }

//         {
//             banner && <div>
//                 {
//                     <div className='mb-4'>
//                     <img className='w-full h-[300px]' src={banner.banner} alt="" />
//                 </div>
//                 }

// <form onSubmit={update}>
//          <div className='mb-4'>
//             <label className='flex justify-center items-center flex-col h-[180px] cursor-pointer border border-dashed hover:border-red-500 w-full text-white' htmlFor="image">
//                 <span className='text-4xl'><FaRegImage /></span>
//                 <span>Select Banner Image </span>
//             </label>
//             <input required onChange={imageHandle} className='hidden' type="file" id='image' />
//             </div>

//             {
//                 imageShow && <div className='mb-4'>
//                     <img className='w-full h-[300px]' src={imageShow} alt="" />
//                 </div>
//             }

//             <button disabled={loader ? true : false}  className='bg-red-500 w-[280px] hover:shadow-red-300/50 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3'>
//             {
//                loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Update Banner'
//             } 
//             </button>

//         </form> 

//             </div>
//         }
 
       
        
//         </div> 
//     </div>
//     );
// };

// export default AddBanner;
import React, { useEffect, useState } from 'react';
import { FaRegImage } from "react-icons/fa";
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { add_banner, get_banner, messageClear, update_banner } from '../../store/Reducers/bannerReducer';
import toast from 'react-hot-toast';

const AddBanner = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage, banner } = useSelector(state => state.banner);

    const [imageShow, setImageShow] = useState('');
    const [image, setImage] = useState('');

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

    const imageHandle = (e) => {
        const files = e.target.files;
        const length = files.length;

        if (length > 0) {
            setImage(files[0]);
            setImageShow(URL.createObjectURL(files[0]));
        } 
    };

    const add = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('mainban', image);
        dispatch(add_banner(formData));
    };

    const update = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('mainban', image);
        dispatch(update_banner({info: formData, bannerId: banner._id}));
    };

    useEffect(() => {
        dispatch(get_banner(productId));
    }, [productId, dispatch]);

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-6 bg-white rounded-lg shadow-sm'>
                <div className='pb-4 mb-5 border-b border-pink-100'>
                    <h1 className='text-xl font-semibold text-pink-600'>
                        {banner ? 'Update Banner' : 'Add New Banner'}
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Upload a promotional banner for your product to attract customers
                    </p>
                </div>

                {!banner && (
                    <div>
                        <form onSubmit={add}>
                            <div className='mb-5'>
                                <label 
                                    className='flex justify-center items-center flex-col h-[180px] cursor-pointer border-2 border-dashed border-pink-200 hover:border-pink-500 w-full rounded-lg transition-all' 
                                    htmlFor="image"
                                >
                                    <span className='text-4xl text-pink-300'><FaRegImage /></span>
                                    <span className='mt-2 text-gray-500'>Select Banner Image</span>
                                    <span className='text-xs text-gray-400 mt-1'>Recommended size: 1200 x 300 pixels</span>
                                </label>
                                <input required onChange={imageHandle} className='hidden' type="file" id='image' />
                            </div>

                            {imageShow && (
                                <div className='mb-5'>
                                    <div className='border border-pink-100 rounded-lg overflow-hidden shadow-sm'>
                                        <img 
                                            className='w-full h-[300px] object-cover object-center' 
                                            src={imageShow} 
                                            alt="Banner preview" 
                                        />
                                    </div>
                                    <p className='text-xs text-gray-500 mt-2 text-center'>Preview of selected banner image</p>
                                </div>
                            )}

                            <button 
                                disabled={loader ? true : false}  
                                className='bg-pink-500 hover:bg-pink-600 transition-all text-white rounded-md px-7 py-3 shadow-sm disabled:opacity-70'
                            >
                                {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Add Banner'}
                            </button>
                        </form>
                    </div>
                )}

                {banner && (
                    <div>
                        <div className='mb-5'>
                            <h2 className='text-lg font-medium text-gray-700 mb-2'>Current Banner</h2>
                            <div className='border border-pink-100 rounded-lg overflow-hidden shadow-sm'>
                                <img 
                                    className='w-full h-[300px] object-cover object-center' 
                                    src={banner.banner} 
                                    alt="Current banner" 
                                />
                            </div>
                        </div>

                        <form onSubmit={update}>
                            <div className='mb-5'>
                                <h2 className='text-lg font-medium text-gray-700 mb-2'>Update Banner</h2>
                                <label 
                                    className='flex justify-center items-center flex-col h-[180px] cursor-pointer border-2 border-dashed border-pink-200 hover:border-pink-500 w-full rounded-lg transition-all' 
                                    htmlFor="image"
                                >
                                    <span className='text-4xl text-pink-300'><FaRegImage /></span>
                                    <span className='mt-2 text-gray-500'>Select New Banner Image</span>
                                    <span className='text-xs text-gray-400 mt-1'>Recommended size: 1200 x 300 pixels</span>
                                </label>
                                <input required onChange={imageHandle} className='hidden' type="file" id='image' />
                            </div>

                            {imageShow && (
                                <div className='mb-5'>
                                    <h2 className='text-lg font-medium text-gray-700 mb-2'>New Banner Preview</h2>
                                    <div className='border border-pink-100 rounded-lg overflow-hidden shadow-sm'>
                                        <img 
                                            className='w-full h-[300px] object-cover object-center' 
                                            src={imageShow} 
                                            alt="New banner preview" 
                                        />
                                    </div>
                                </div>
                            )}

                            <button 
                                disabled={loader || !imageShow ? true : false}  
                                className='bg-pink-500 hover:bg-pink-600 transition-all text-white rounded-md px-7 py-3 shadow-sm disabled:opacity-70'
                            >
                                {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Update Banner'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddBanner;