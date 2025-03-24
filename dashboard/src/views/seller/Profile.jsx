// import React, { useEffect, useState } from 'react';
// import { FaImages } from "react-icons/fa6";
// import { FadeLoader } from 'react-spinners';
// import { FaRegEdit } from "react-icons/fa";
// import { useDispatch, useSelector } from 'react-redux';
// import { profile_image_upload, messageClear, profile_info_add, logout } from '../../store/Reducers/authReducer'
// import toast from 'react-hot-toast';
// import { PropagateLoader } from 'react-spinners';
// import { overrideStyle } from '../../utils/utils';
// import { create_stripe_connect_account } from '../../store/Reducers/sellerReducer';
// import api from '../../api/api';
// import { useNavigate } from 'react-router-dom';

// const Profile = () => {

//     const [state, setState] = useState({
//         division: '',
//         district: '',
//         shopName: '',
//         sub_district: ''
//     })

//     const [passwordState, setPasswordState] = useState({
//         old_password: '',
//         new_password: ''
//     })

//     const [passwordLoading, setPasswordLoading] = useState(false)
//     const navigate = useNavigate()

//     const dispatch = useDispatch()
//     const { userInfo, loader, successMessage } = useSelector(state => state.auth)

//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage)
//             messageClear()
//         }
//     }, [successMessage])

//     const add_image = (e) => {
//         if (e.target.files.length > 0) {
//             const formData = new FormData()
//             formData.append('image', e.target.files[0])
//             dispatch(profile_image_upload(formData))
//         }
//     }

//     const passwordInputHandle = (e) => {
//         setPasswordState({
//             ...passwordState,
//             [e.target.name]: e.target.value
//         })
//     }

//     const changePassword = async (e) => {
//         e.preventDefault()
        
//         if (!passwordState.old_password || !passwordState.new_password) {
//             return toast.error('Please fill in all information')
//         }

//         if (passwordState.old_password === passwordState.new_password) {
//             return toast.error('New password must be different from current password')
//         }

//         try {
//             setPasswordLoading(true)
//             const { data } = await api.post(`/change-password/${userInfo._id}`, {
//                 password: passwordState.old_password,
//                 newPassword: passwordState.new_password
//             }, { withCredentials: true })

//             setPasswordLoading(false)
//             toast.success(data.message + ' Please login with the new password.')
            
//             setTimeout(() => {
//                 dispatch(logout({ navigate }))
//             }, 3000)
            
//         } catch (error) {
//             setPasswordLoading(false)
//             toast.error(error.response.data.error || 'An error occurred')
//         }
//     }

//     return (
//         <div className='px-2 lg:px-7 py-5'>
//             <div className='w-full flex flex-wrap'>
//                 <div className='w-full  bg-[#6a5fdf] flex justify-center items-center'>
//                     <div className='w-full p-4 md:w-6/12 rounded-md text-[#d0d2d6]'>
//                         <div className='flex justify-center items-center py-3'>
//                             {
//                                 userInfo?.image ? <label htmlFor="img" className='h-[150px] w-[200px] relative p-3 cursor-pointer overflow-hidden'>
//                                     <img src={userInfo.image} alt="" />
//                                     {
//                                         loader && <div className='bg-slate-600 absolute left-0 top-0 w-full h-full opacity-70 flex justify-center items-center z-20'>
//                                             <span>
//                                                 <FadeLoader />
//                                             </span>

//                                         </div>
//                                     }


//                                 </label> : <label className='flex justify-center items-center flex-col h-[150px] w-[200px] cursor-pointer border border-dashed hover:border-red-500 border-[#d0d2d6] relative' htmlFor="img">
//                                     <span><FaImages /> </span>
//                                     <span>Select Image</span>
//                                     {
//                                         loader && <div className='bg-slate-600 absolute left-0 top-0 w-full h-full opacity-70 flex justify-center items-center z-20'>
//                                             <span>
//                                                 <FadeLoader />
//                                             </span>

//                                         </div>
//                                     }

//                                 </label>
//                             }
//                             <input onChange={add_image} type="file" className='hidden' id='img' />
//                         </div>

//                         <div className='px-0 md:px-5 py-2'>
//                             <div className='flex justify-between text-sm flex-col gap-2 p-4 bg-slate-800 rounded-md relative'>
//                                 <div className='flex gap-2'>
//                                     <span>Name : </span>
//                                     <span>{userInfo.name}</span>
//                                 </div>
//                                 <div className='flex gap-2'>
//                                     <span>Email : </span>
//                                     <span>{userInfo.email}</span>
//                                 </div>
//                                 <div className='flex gap-2'>
//                                     <span>Role : </span>
//                                     <span>{userInfo.role}</span>
//                                 </div>
//                                 <div className='flex gap-2'>
//                                     <span>Status : </span>
//                                     <span>{userInfo.status}</span>
//                                 </div>
//                             </div>
//                         </div>

//                             <div className='w-full pl-0 md:pl-7 mt-6 md:mt-0'>
//                                 <div className='bg-[#6a5fdf] rounded-md text-[#d0d2d6] p-4'>
//                                     <h1 className='text-[#d0d2d6] text-lg mb-3 font-semibold'>Change Password</h1>
//                                     <form onSubmit={changePassword}>
//                                         <div className='flex flex-col w-full gap-1 mb-2'>
//                                             <label htmlFor="o_password">Old Password</label>
//                                             <input 
//                                                 className='px-4 py-2 focus:border-indigo-200 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
//                                                 type="password" 
//                                                 name='old_password' 
//                                                 id='o_password' 
//                                                 placeholder='Old Password' 
//                                                 value={passwordState.old_password}
//                                                 onChange={passwordInputHandle}
//                                             />
//                                         </div>

//                                         <div className='flex flex-col w-full gap-1 mb-2'>
//                                             <label htmlFor="n_password">New Password</label>
//                                             <input 
//                                                 className='px-4 py-2 focus:border-indigo-200 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' 
//                                                 type="password" 
//                                                 name='new_password' 
//                                                 id='n_password' 
//                                                 placeholder='New Password' 
//                                                 value={passwordState.new_password}
//                                                 onChange={passwordInputHandle}
//                                             />
//                                         </div>
//                                         <button 
//                                             disabled={passwordLoading} 
//                                             className='bg-red-500 hover:shadow-red-500/40 hover:shadow-md text-white rounded-md px-7 py-2 my-2 flex items-center justify-center'
//                                         >
//                                             {passwordLoading ? (
//                                                 <PropagateLoader color="#fff" cssOverride={overrideStyle} />
//                                             ) : (
//                                                 'Save Changes'
//                                             )}
//                                         </button>
//                                     </form>
//                                 </div>
//                             </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Profile;
import React, { useEffect, useState } from 'react';
import { FaImages } from "react-icons/fa6";
import { FadeLoader } from 'react-spinners';
import { FaRegEdit, FaKey, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { profile_image_upload, messageClear, profile_info_add, logout } from '../../store/Reducers/authReducer'
import toast from 'react-hot-toast';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { create_stripe_connect_account } from '../../store/Reducers/sellerReducer';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [state, setState] = useState({
        division: '',
        district: '',
        shopName: '',
        sub_district: ''
    });

    const [passwordState, setPasswordState] = useState({
        old_password: '',
        new_password: ''
    });

    const [passwordLoading, setPasswordLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo, loader, successMessage } = useSelector(state => state.auth);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            messageClear();
        }
    }, [successMessage]);

    const add_image = (e) => {
        if (e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('image', e.target.files[0]);
            dispatch(profile_image_upload(formData));
        }
    };

    const passwordInputHandle = (e) => {
        setPasswordState({
            ...passwordState,
            [e.target.name]: e.target.value
        });
    };

    const changePassword = async (e) => {
        e.preventDefault();
        
        if (!passwordState.old_password || !passwordState.new_password) {
            return toast.error('Please fill in all information');
        }

        if (passwordState.old_password === passwordState.new_password) {
            return toast.error('New password must be different from current password');
        }

        try {
            setPasswordLoading(true);
            const { data } = await api.post(`/change-password/${userInfo._id}`, {
                password: passwordState.old_password,
                newPassword: passwordState.new_password
            }, { withCredentials: true });

            setPasswordLoading(false);
            toast.success(data.message + ' Please login with the new password.');
            
            setTimeout(() => {
                dispatch(logout({ navigate }));
            }, 3000);
            
        } catch (error) {
            setPasswordLoading(false);
            toast.error(error.response.data.error || 'An error occurred');
        }
    };

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full flex flex-wrap'>
                <div className='w-full bg-white rounded-lg shadow-sm'>
                    <div className='p-5 border-b border-pink-100'>
                        <h1 className='text-xl font-semibold text-pink-600'>My Profile</h1>
                    </div>
                    
                    <div className='w-full p-6 md:flex md:gap-6'>
                        {/* Profile Image Section */}
                        <div className='md:w-1/3 flex flex-col items-center mb-6 md:mb-0'>
                            {userInfo?.image ? (
                                <label htmlFor="img" className='relative cursor-pointer overflow-hidden'>
                                    <div className='h-48 w-48 rounded-full overflow-hidden border-4 border-pink-100 shadow-sm'>
                                        <img 
                                            src={userInfo.image} 
                                            alt={userInfo.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className='absolute bottom-3 right-3 bg-pink-500 text-white p-2 rounded-full shadow-md hover:bg-pink-600 transition-all'>
                                        <FaRegEdit size={16} />
                                    </div>
                                    {loader && (
                                        <div className='bg-gray-800 bg-opacity-70 absolute inset-0 flex justify-center items-center rounded-full'>
                                            <FadeLoader color="#f9a8d4" />
                                        </div>
                                    )}
                                </label>
                            ) : (
                                <label 
                                    className='flex justify-center items-center flex-col h-48 w-48 cursor-pointer border-2 border-dashed border-pink-200 hover:border-pink-500 rounded-full bg-pink-50 relative transition-all' 
                                    htmlFor="img"
                                >
                                    <span className='text-4xl text-pink-300'><FaImages /></span>
                                    <span className='text-gray-500 mt-2'>Select Profile Image</span>
                                    {loader && (
                                        <div className='bg-gray-800 bg-opacity-70 absolute inset-0 flex justify-center items-center rounded-full'>
                                            <FadeLoader color="#f9a8d4" />
                                        </div>
                                    )}
                                </label>
                            )}
                            <input onChange={add_image} type="file" className='hidden' id='img' accept='image/*' />
                            
                            <div className='text-center mt-4'>
                                <h2 className='text-xl font-semibold text-gray-800'>{userInfo.name}</h2>
                                <p className='text-gray-500'>{userInfo.email}</p>
                            </div>
                        </div>
                        
                        {/* Profile Information Section */}
                        <div className='md:w-2/3'>
                            <div className='bg-white rounded-lg mb-6'>
                                <div className='flex items-center gap-2 mb-4 text-pink-600 border-b border-pink-100 pb-2'>
                                    <FaUser />
                                    <h2 className='font-semibold'>Account Information</h2>
                                </div>
                                
                                <div className='bg-pink-50 p-4 rounded-lg'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <p className='text-gray-500 text-sm mb-1'>Full Name</p>
                                            <p className='font-medium text-gray-800'>{userInfo.name}</p>
                                        </div>
                                        <div>
                                            <p className='text-gray-500 text-sm mb-1'>Email Address</p>
                                            <p className='font-medium text-gray-800'>{userInfo.email}</p>
                                        </div>
                                        <div>
                                            <p className='text-gray-500 text-sm mb-1'>Role</p>
                                            <p className='font-medium'>
                                                <span className='bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs'>
                                                    {userInfo.role}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-gray-500 text-sm mb-1'>Status</p>
                                            <p className='font-medium'>
                                                <span className={`px-3 py-1 rounded-full text-xs ${
                                                    userInfo.status === 'active' 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Change Password Section */}
                            <div className='bg-white rounded-lg'>
                                <div className='flex items-center gap-2 mb-4 text-pink-600 border-b border-pink-100 pb-2'>
                                    <FaKey />
                                    <h2 className='font-semibold'>Change Password</h2>
                                </div>
                                
                                <form onSubmit={changePassword} className='bg-pink-50 p-4 rounded-lg'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                        <div className='flex flex-col gap-1'>
                                            <label htmlFor="o_password" className='text-gray-600 text-sm font-medium'>Current Password</label>
                                            <input 
                                                className='px-4 py-2 bg-white border border-pink-200 focus:border-pink-500 outline-none rounded-md text-gray-700' 
                                                type="password" 
                                                name='old_password' 
                                                id='o_password' 
                                                placeholder='Enter current password' 
                                                value={passwordState.old_password}
                                                onChange={passwordInputHandle}
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label htmlFor="n_password" className='text-gray-600 text-sm font-medium'>New Password</label>
                                            <input 
                                                className='px-4 py-2 bg-white border border-pink-200 focus:border-pink-500 outline-none rounded-md text-gray-700' 
                                                type="password" 
                                                name='new_password' 
                                                id='n_password' 
                                                placeholder='Enter new password' 
                                                value={passwordState.new_password}
                                                onChange={passwordInputHandle}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className='flex justify-end'>
                                        <button 
                                            disabled={passwordLoading} 
                                            className='bg-pink-500 hover:bg-pink-600 text-white rounded-md px-5 py-2 transition-all shadow-sm disabled:opacity-70'
                                        >
                                            {passwordLoading ? (
                                                <PropagateLoader color="#fff" cssOverride={overrideStyle} size={10} />
                                            ) : (
                                                'Update Password'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;