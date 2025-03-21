import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FadeLoader } from 'react-spinners';
import api from '../api/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const [loading, setLoading] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Validate token and email
        const validateToken = async () => {
            try {
                if (!token || !email) {
                    setError('Invalid reset link. Please request a new password reset.');
                    setLoading(false);
                    return;
                }

                // Check if token is valid by making an API call
                const { data } = await api.post('/verify-reset-token', { token, email });
                setValidToken(true);
                setLoading(false);
            } catch (error) {
                setError(error.response?.data?.error || 'Invalid or expired reset link. Please request a new password reset.');
                setLoading(false);
            }
        };

        validateToken();
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            setIsResetting(true);
            const { data } = await api.post('/reset-password', {
                token,
                email,
                newPassword
            });

            toast.success(data.message || 'Password has been reset successfully');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="bg-slate-200 py-8">
                <div className="max-w-md mx-auto bg-white p-8 rounded-md shadow-md">
                    <h2 className="text-2xl font-semibold text-center mb-6">Reset Your Password</h2>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <FadeLoader color="#059473" />
                        </div>
                    ) : validToken ? (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="newPassword" className="block mb-1 font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Enter your new password"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirm your new password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isResetting}
                                    className="w-full bg-[#059473] text-white py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-opacity-70"
                                >
                                    {isResetting ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                                {error}
                            </div>
                            <p className="mb-4">Need a new reset link?</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 bg-[#059473] text-white rounded-md hover:bg-green-600"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPassword; 