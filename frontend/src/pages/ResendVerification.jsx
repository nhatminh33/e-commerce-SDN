import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FadeLoader } from 'react-spinners';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';

const ResendVerification = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.post('/api/resend-verification', { email });
            toast.success(data.message);
            dispatch(messageClear());
            setSent(true);
        } catch (error) {
            toast.error(error.response?.data?.error || 'An error occurred while resending the verification email');
            dispatch(messageClear());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading && (
                <div className='w-screen h-screen flex justify-center items-center fixed left-0 top-0 bg-[#38303033] z-[999]'>
                    <FadeLoader />
                </div>
            )}

            <Header />
            <div className="bg-[#eeeeee] pt-5 pb-5">
                <div className="bg-white w-[85%] md:w-[70%] lg:w-[40%] mx-auto p-8 rounded-md shadow-sm">
                    {sent ? (
                        <div className="flex flex-col items-center justify-center py-5">
                            <div className="w-[70px] h-[70px] rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-medium mb-2">Email Sent</h2>
                            <p className="text-gray-600 mb-5 text-center">
                                We have sent a verification email to {email}. 
                                Please check your inbox and follow the instructions.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Link to="/login" className="py-2 px-5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
                                    Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-medium mb-5 text-center">Resend Verification Email</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-[40px] border border-gray-300 px-3 rounded-md focus:outline-none focus:border-blue-500"
                                        placeholder="Enter your registered email"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full h-[40px] bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                                >
                                    Resend Verification Email
                                </button>
                            </form>
                            <div className="text-center mt-5">
                                <p className="text-gray-600">
                                    Back to{' '}
                                    <Link to="/login" className="text-blue-500 hover:underline">
                                        login
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResendVerification; 