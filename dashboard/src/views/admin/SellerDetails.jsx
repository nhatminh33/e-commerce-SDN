// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom';
// import { get_seller, seller_status_update, messageClear, update_seller_info } from '../../store/Reducers/sellerReducer';
// import { profile_image_upload } from '../../store/Reducers/authReducer';
// import toast from 'react-hot-toast';
// import { FaImages } from 'react-icons/fa6';

// const SellerDetails = () => {
//     const dispatch = useDispatch()
//     const { seller, successMessage } = useSelector(state => state.seller)
//     const { sellerId } = useParams()

//     const [status, setStatus] = useState('')
//     const [isEditing, setIsEditing] = useState(false)
//     const [sellerInfo, setSellerInfo] = useState({
//         name: '',
//         email: '',
//         image: ''
//     })

//     useEffect(() => {
//         dispatch(get_seller(sellerId))
//     }, [sellerId])

//     useEffect(() => {
//         if (seller) {
//             setStatus(seller.status)
//             setSellerInfo({
//                 name: seller.name || '',
//                 email: seller.email || '',
//                 image: seller.image || ''
//             })
//         }
//     }, [seller])

//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage)
//             dispatch(messageClear())
//             setIsEditing(false)
//         }
//     }, [successMessage])

//     const handleStatusSubmit = (e) => {
//         e.preventDefault()
//         dispatch(seller_status_update({
//             sellerId,
//             status
//         }))
//     }

//     const handleInfoSubmit = (e) => {
//         e.preventDefault()
//         dispatch(update_seller_info({
//             id: sellerId,
//             info: sellerInfo
//         }))
//     }

//     const handleChange = (e) => {
//         setSellerInfo({
//             ...sellerInfo,
//             [e.target.name]: e.target.value
//         })
//     }

//     const imageHandle = (e) => {
//         if (e.target.files.length > 0) {
//             const formData = new FormData()
//             formData.append('image', e.target.files[0])
//             dispatch(profile_image_upload(formData))
//                 .then((result) => {
//                     if (result.payload?.image) {
//                         setSellerInfo(prev => ({
//                             ...prev,
//                             image: result.payload.image
//                         }))
//                         dispatch(update_seller_info({
//                             id: sellerId,
//                             info: {
//                                 ...sellerInfo,
//                                 image: result.payload.image
//                             }
//                         }))
//                     }
//                 })
//         }
//     }

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <h1 className='text-[20px] font-bold mb-3'>Seller Details</h1>
//             <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//                 <div className='w-full flex flex-wrap text-[#d0d2d6]'>
//                     <div className='w-3/12 flex justify-center items-center py-3'>
//                         <div className='relative w-full h-[230px] flex justify-center items-center'>
//                             {seller?.image ? (
//                                 <>
//                                     <img className='w-full h-full object-cover' src={seller.image} alt="" />
//                                     {isEditing && (
//                                         <label htmlFor="image" className='absolute cursor-pointer p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full'>
//                                             <FaImages size={20} />
//                                             <input type="file" id='image' className='hidden' onChange={imageHandle} />
//                                         </label>
//                                     )}
//                                 </>
//                             ) : (
//                                 <label htmlFor="image" className='flex justify-center items-center flex-col cursor-pointer'>
//                                     <FaImages size={30} />
//                                     <span>Select image</span>
//                                     <input type="file" id='image' className='hidden' onChange={imageHandle} />
//                                 </label>
//                             )}
//                         </div>
//                     </div>

//                     <div className='w-4/12'>
//                         <div className='px-0 md:px-5 py-2'>
//                             <div className='py-2 text-lg flex justify-between items-center'>
//                                 <h2>Basic Info</h2>
//                                 <button 
//                                     onClick={() => setIsEditing(!isEditing)}
//                                     className='bg-blue-500 hover:shadow-blue-500/50 hover:shadow-md text-white rounded-md px-7 py-2 my-2'
//                                 >
//                                     {isEditing ? 'Cancel' : 'Edit'}
//                                 </button>
//                             </div>

//                             {!isEditing ? (
//                                 <div className='flex justify-between text-sm flex-col gap-2 p-4 bg-[#9e97e9] rounded-md'>
//                                     <div className='flex gap-2 font-bold text-[#000000]'>
//                                         <span>Name : </span>
//                                         <span>{seller?.name}</span>
//                                     </div>
//                                     <div className='flex gap-2 font-bold text-[#000000]'>
//                                         <span>Email : </span>
//                                         <span>{seller?.email}</span>
//                                     </div>
//                                     <div className='flex gap-2 font-bold text-[#000000]'>
//                                         <span>Role : </span>
//                                         <span>{seller?.role}</span>
//                                     </div>
//                                     <div className='flex gap-2 font-bold text-[#000000]'>
//                                         <span>Status : </span>
//                                         <span>{seller?.status}</span>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <form onSubmit={handleInfoSubmit} className='flex flex-col gap-3 p-4 bg-[#9e97e9] rounded-md'>
//                                     <div className='flex flex-col gap-1'>
//                                         <label htmlFor="name" className='text-[#000000] font-bold'>Name:</label>
//                                         <input
//                                             type="text"
//                                             name="name"
//                                             id="name"
//                                             value={sellerInfo.name}
//                                             onChange={handleChange}
//                                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'
//                                         />
//                                     </div>
//                                     <div className='flex flex-col gap-1'>
//                                         <label htmlFor="email" className='text-[#000000] font-bold'>Email:</label>
//                                         <input
//                                             type="email"
//                                             name="email"
//                                             id="email"
//                                             value={sellerInfo.email}
//                                             onChange={handleChange}
//                                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'
//                                         />
//                                     </div>
//                                     <button type="submit" className='bg-blue-500 hover:shadow-blue-500/50 hover:shadow-md text-white rounded-md px-7 py-2 my-2'>
//                                         Save Changes
//                                     </button>
//                                 </form>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div>
//                     <form onSubmit={handleStatusSubmit}>
//                         <div className='flex gap-4 py-3'>
//                             <select 
//                                 value={status} 
//                                 onChange={(e) => setStatus(e.target.value)} 
//                                 className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
//                                 required
//                             >
//                                 <option value="">--Select Status--</option>
//                                 <option value="active">Active</option>
//                                 <option value="deactive">Deactive</option>
//                             </select>
//                             <button className='bg-red-500 hover:shadow-red-500/50 hover:shadow-md text-white rounded-md px-7 py-2'>
//                                 Submit
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SellerDetails;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { get_seller, seller_status_update, messageClear, update_seller_info } from '../../store/Reducers/sellerReducer';
import { profile_image_upload } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';
import { FaImages, FaCamera, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SellerDetails = () => {
    const dispatch = useDispatch()
    const { seller, successMessage } = useSelector(state => state.seller)
    const { sellerId } = useParams()

    const [status, setStatus] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [sellerInfo, setSellerInfo] = useState({
        name: '',
        email: '',
        image: ''
    })

    useEffect(() => {
        dispatch(get_seller(sellerId))
    }, [sellerId])

    useEffect(() => {
        if (seller) {
            setStatus(seller.status)
            setSellerInfo({
                name: seller.name || '',
                email: seller.email || '',
                image: seller.image || ''
            })
        }
    }, [seller])

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            setIsEditing(false)
        }
    }, [successMessage])

    const handleStatusSubmit = (e) => {
        e.preventDefault()
        dispatch(seller_status_update({
            sellerId,
            status
        }))
    }

    const handleInfoSubmit = (e) => {
        e.preventDefault()
        dispatch(update_seller_info({
            id: sellerId,
            info: sellerInfo
        }))
    }

    const handleChange = (e) => {
        setSellerInfo({
            ...sellerInfo,
            [e.target.name]: e.target.value
        })
    }

    const imageHandle = (e) => {
        if (e.target.files.length > 0) {
            const formData = new FormData()
            formData.append('image', e.target.files[0])
            dispatch(profile_image_upload(formData))
                .then((result) => {
                    if (result.payload?.image) {
                        setSellerInfo(prev => ({
                            ...prev,
                            image: result.payload.image
                        }))
                        dispatch(update_seller_info({
                            id: sellerId,
                            info: {
                                ...sellerInfo,
                                image: result.payload.image
                            }
                        }))
                    }
                })
        }
    }

    // Function to display status badge
    const getStatusBadge = (status) => {
        switch(status) {
            case 'active':
                return <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">Active</span>;
            case 'deactive':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Deactive</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white text-xs">{status}</span>;
        }
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-md shadow-md'>
                <div className='flex justify-between items-center pb-4 border-b border-pink-100 mb-4'>
                    <div className='flex items-center gap-3'>
                        <Link to='/admin/dashboard/sellers' className='text-gray-600 p-2 rounded-full hover:bg-pink-50 transition-all'>
                            <FaArrowLeft />
                        </Link>
                        <h2 className='text-xl font-bold text-pink-600'>Seller Details</h2>
                    </div>
                </div>

                <div className='w-full flex flex-wrap'>
                    {/* Seller Image */}
                    <div className='w-full md:w-3/12 flex justify-center items-start py-3'>
                        <div className='w-[200px] h-[200px] relative rounded-lg overflow-hidden shadow-md border border-pink-100'>
                            {seller?.image ? (
                                <>
                                    <img 
                                        className='w-full h-full object-cover' 
                                        src={seller.image} 
                                        alt={seller.name} 
                                    />
                                    {isEditing && (
                                        <label 
                                            htmlFor="image" 
                                            className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-all cursor-pointer'
                                        >
                                            <div className='bg-white p-2 rounded-full'>
                                                <FaCamera className='text-gray-700' size={24} />
                                            </div>
                                            <input type="file" id='image' className='hidden' onChange={imageHandle} />
                                        </label>
                                    )}
                                </>
                            ) : (
                                <label 
                                    htmlFor="image" 
                                    className='w-full h-full flex justify-center items-center flex-col cursor-pointer bg-gray-100 hover:bg-gray-200 transition-all'
                                >
                                    <FaImages className='text-gray-400' size={40} />
                                    <span className='text-gray-500 mt-2'>Select image</span>
                                    <input type="file" id='image' className='hidden' onChange={imageHandle} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Seller Information */}
                    <div className='w-full md:w-9/12 p-3'>
                        <div className='mb-4'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold text-gray-700'>Seller Information</h3>
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`${isEditing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-pink-500 hover:bg-pink-600'} text-white rounded-md px-4 py-2 transition-all shadow-sm`}
                                >
                                    {isEditing ? 'Cancel' : 'Edit Information'}
                                </button>
                            </div>

                            {!isEditing ? (
                                <div className='bg-pink-50 rounded-lg p-4 border border-pink-100'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='flex flex-col gap-1'>
                                            <span className='text-gray-500 text-sm'>Name</span>
                                            <span className='text-gray-700 font-medium'>{seller?.name}</span>
                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <span className='text-gray-500 text-sm'>Email</span>
                                            <span className='text-gray-700 font-medium'>{seller?.email}</span>
                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <span className='text-gray-500 text-sm'>Role</span>
                                            <span className='text-gray-700 font-medium'>{seller?.role}</span>
                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <span className='text-gray-500 text-sm'>Status</span>
                                            <div>{getStatusBadge(seller?.status)}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleInfoSubmit} className='bg-pink-50 rounded-lg p-4 border border-pink-100'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='flex flex-col gap-1'>
                                            <label htmlFor="name" className='text-gray-600 text-sm font-medium'>Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={sellerInfo.name}
                                                onChange={handleChange}
                                                className='px-4 py-2 bg-white border border-pink-200 focus:border-pink-500 outline-none rounded-md text-gray-700'
                                            />
                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <label htmlFor="email" className='text-gray-600 text-sm font-medium'>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={sellerInfo.email}
                                                onChange={handleChange}
                                                className='px-4 py-2 bg-white border border-pink-200 focus:border-pink-500 outline-none rounded-md text-gray-700'
                                            />
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <button type="submit" className='bg-pink-500 hover:bg-pink-600 text-white rounded-md px-4 py-2 transition-all shadow-sm'>
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Status Update Form */}
                        <div className='bg-pink-50 rounded-lg p-4 border border-pink-100 mt-6'>
                            <h3 className='text-lg font-semibold text-gray-700 mb-3'>Update Seller Status</h3>
                            <form onSubmit={handleStatusSubmit} className='flex flex-wrap gap-4 items-end'>
                                <div className='flex flex-col gap-1 flex-grow'>
                                    <label className='text-gray-600 text-sm font-medium'>Status</label>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)} 
                                        className='px-4 py-2 bg-white border border-pink-200 focus:border-pink-500 outline-none rounded-md text-gray-700' 
                                        required
                                    >
                                        <option value="">--Select Status--</option>
                                        <option value="active">Active</option>
                                        <option value="deactive">Deactive</option>
                                    </select>
                                </div>
                                <button className='px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md transition-all shadow-sm'>
                                    Update Status
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDetails;