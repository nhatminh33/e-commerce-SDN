import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FadeLoader } from 'react-spinners';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';
import api from '../api/api';

const VerifyEmail = () => {
    const { token } = useParams();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyEmailToken = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/verify-email/${token}`);
                setVerified(true);
                toast.success(data.message);
                dispatch(messageClear());
            } catch (error) {
                setError(error.response?.data?.error || 'An error occurred while verifying your email');
                toast.error(error.response?.data?.error || 'An error occurred while verifying your email');
                dispatch(messageClear());
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyEmailToken();
        }
    }, [token, dispatch]);

    return (
        <div>
            <Header />
            <div className="bg-[#eeeeee] pt-5 pb-5">
                <div className="bg-white w-[85%] md:w-[70%] lg:w-[50%] mx-auto p-8 rounded-md shadow-sm">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <FadeLoader />
                            <p className="mt-5 text-center text-gray-600">Verifying your email...</p>
                        </div>
                    ) : verified ? (
                        <div className="flex flex-col items-center justify-center py-5">
                            <div className="w-[70px] h-[70px] rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-medium mb-2">Email Verification Successful</h2>
                            <p className="text-gray-600 mb-5 text-center">Thank you for verifying your email. You can now use all the features of your account.</p>
                            <Link to="/login" className="py-2 px-5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
                                Login
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-5">
                            <div className="w-[70px] h-[70px] rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-medium mb-2">Email Verification Failed</h2>
                            <p className="text-gray-600 mb-5 text-center">{error || 'Invalid or expired verification link.'}</p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Link to="/login" className="py-2 px-5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
                                    Login
                                </Link>
                                <Link to="/resend-verification" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300">
                                    Resend Verification Email
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VerifyEmail; 