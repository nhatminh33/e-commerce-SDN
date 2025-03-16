import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaFacebookF } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { customer_register, messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';
import { FadeLoader } from 'react-spinners';

const Register = () => {
    const navigate = useNavigate()
    const { loader, errorMessage, successMessage, userInfo } = useSelector(state => state.auth)
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const [state, setState] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',        
        dateOfBirth: '',
        gender: '',
        address: {
            receiverName: '',
            phoneNumber: '',
            province: '',
            district: '',
            ward: '',
            streetAddress: ''
        }
    })
    const dispatch = useDispatch()

    const inputHandle = (e) => {
        const { name, value } = e.target;
        
        // Handle address fields separately
        if (['streetAddress', 'province', 'district', 'ward', 'receiverName'].includes(name)) {
            setState({
                ...state,
                address: {
                    ...state.address,
                    [name]: value,
                }
            });
        } else if(name === 'phoneNumber') {
            setState({
                ...state,
                address: {
                    ...state.address,
                    phoneNumber: value
                }
            });
        } else if (name === 'name') {
            setState({
                ...state,
                address: {
                    ...state.address,
                    name: value
                }
            });
        } else {
            // Handle other fields normally
            setState({
                ...state,
                [name]: value
            });
        }
    }

    const register = (e) => {
        e.preventDefault()
        setState({
            ...state,
            address: {
                ...state.address,
                receiverName: state.name,
                phoneNumber: state.phoneNumber,
            }
        });

        dispatch(customer_register(state))
    }

    useEffect(() => {
        if (successMessage) {
            setRegistrationSuccess(true);
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
        if (userInfo) {
            navigate('/')
        }
    }, [successMessage, errorMessage])


    return (
        <div>
            {
                loader && <div className='w-screen h-screen flex justify-center items-center fixed left-0 top-0 bg-[#38303033] z-[999]'>
                    <FadeLoader />
                </div>
            }

            <Header />
            <div className='bg-slate-200 mt-4'>
                <div className='w-full justify-center items-center p-10'>
                    <div className='grid grid-cols-2 w-[60%] mx-auto bg-white rounded-md'>
                        <div className='px-8 py-8'>
                            <h2 className='text-center w-full text-xl text-slate-600 font-bold'>Register</h2>

                            {registrationSuccess ? (
                                <div className="mt-5">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 mb-4">
                                        <p className="font-medium">Registration successful!</p>
                                        <p className="text-sm mt-1">
                                            Please check your email inbox to verify your account before logging in.
                                        </p>
                                    </div>
                                    <Link 
                                        to="/login" 
                                        className="px-8 w-full py-2 bg-[#059473] shadow-lg hover:shadow-green-500/40 text-white rounded-md block text-center"
                                    >
                                        Go to Login
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 mb-4 mt-3">
                                        <p className="text-sm">
                                            <span className="font-medium">Note:</span> You will need to verify your email after registration before you can log in.
                                        </p>
                                    </div>
                                    <form onSubmit={register} className='text-slate-600'>
                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="name">Name</label>
                                            <input onChange={inputHandle} value={state.name} className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' type="text" name="name" id="name" placeholder='Enter your full name' required />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="email">Email</label>
                                            <input onChange={inputHandle} value={state.email} className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' type="email" name="email" id="email" placeholder='Enter your email' required />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="password">Password</label>
                                            <input onChange={inputHandle} value={state.password} className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' type="password" name="password" id="password" placeholder='Create a password' required />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="phoneNumber">Phone Number</label>
                                            <input onChange={inputHandle} value={state.phoneNumber} className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' type="text" name="phoneNumber" id="phoneNumber" placeholder='10-digit phone number' required />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="dateOfBirth">Date of Birth</label>
                                            <input onChange={inputHandle} value={state.dateOfBirth} className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' type="date" name="dateOfBirth" id="dateOfBirth" required />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="gender">Gender</label>
                                            <select 
                                                onChange={inputHandle} 
                                                value={state.gender} 
                                                className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' 
                                                name="gender" 
                                                id="gender"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {/* Address Fields */}
                                        <div className='mt-4 mb-2'>
                                            <h3 className='font-medium text-gray-700'>Address Information</h3>
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="streetAddress">Street Address</label>
                                            <input 
                                                onChange={inputHandle} 
                                                value={state.address.streetAddress} 
                                                className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' 
                                                type="text" 
                                                name="streetAddress" 
                                                id="streetAddress" 
                                                placeholder='Enter your address' 
                                                required 
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="province">Province</label>
                                            <input 
                                                onChange={inputHandle} 
                                                value={state.address.province} 
                                                className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' 
                                                type="text" 
                                                name="province" 
                                                id="province" 
                                                placeholder='Enter your province' 
                                                required 
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="district">District</label>
                                            <input 
                                                onChange={inputHandle} 
                                                value={state.address.district} 
                                                className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' 
                                                type="text" 
                                                name="district" 
                                                id="district" 
                                                placeholder='Enter your district' 
                                                required 
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <label htmlFor="ward">Ward</label>
                                            <input 
                                                onChange={inputHandle} 
                                                value={state.address.ward} 
                                                className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' 
                                                type="text" 
                                                name="ward" 
                                                id="ward" 
                                                placeholder='Enter your ward' 
                                                required 
                                            />
                                        </div>

                                        <button className='px-8 w-full py-2 bg-[#059473] shadow-lg hover:shadow-green-500/40 text-white rounded-md mt-4'>Register</button>
                                    </form>

                                    <div className='text-center text-slate-600 pt-4'>
                                        <p>Already have an account? <Link className='text-blue-500' to='/login'>Login</Link> </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='w-full h-full py-4 pr-4'>
                            <img src="http://localhost:3000/images/login.jpg" alt="" />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Register;