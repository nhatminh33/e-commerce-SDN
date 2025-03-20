import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change_password, messageClear, user_reset } from '../../store/reducers/authReducer';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirm_password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirm_password) {
            dispatch({
                type: 'auth/setError',
                payload: { error: 'New password and confirm password do not match' }
            });
            setTimeout(() => {
                dispatch(messageClear());
            }, 3000);
            return;
        }
        
        const result = await dispatch(change_password(formData));
        if (!result.error) {
            // Clear user data and redirect to login
            dispatch(user_reset());
            localStorage.removeItem('customerToken');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    return (
        <div className='p-4 bg-white'>
            <h2 className='text-xl text-slate-600 pb-5'>Change Password</h2>
            
            {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errorMessage}</div>}
            {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>}
        
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col gap-1 mb-2'>
                    <label htmlFor="oldPassword">Old Password</label>
                    <input 
                        className='outline-none px-3 py-1 border rounded-md text-slate-600' 
                        type="password" 
                        name="oldPassword" 
                        id="oldPassword"  
                        placeholder='Enter old password'
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className='flex flex-col gap-1 mb-2'>
                    <label htmlFor="newPassword">New Password</label>
                    <input 
                        className='outline-none px-3 py-1 border rounded-md text-slate-600' 
                        type="password" 
                        name="newPassword" 
                        id="newPassword"  
                        placeholder='Enter new password'
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className='flex flex-col gap-1 mb-2'>
                    <label htmlFor="confirm_password">Confirm Password</label>
                    <input 
                        className='outline-none px-3 py-1 border rounded-md text-slate-600' 
                        type="password" 
                        name="confirm_password" 
                        id="confirm_password"  
                        placeholder='Confirm new password'
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <button 
                        type="submit"
                        disabled={loader}
                        className='px-8 py-2 bg-[#059473] shadow-lg hover:shadow-green-500/30 text-white rounded-md disabled:opacity-50'
                    >
                        {loader ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;