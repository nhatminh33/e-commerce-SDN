import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaPlus, FaTrash, FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/api';
import { user_update } from '../../store/reducers/authReducer';

const Profile = () => {
    const { userInfo } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        image: ''
    });
    
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({
        receiverName: '',
        phoneNumber: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: false
    });
    
    const [editAddress, setEditAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteAddressId, setDeleteAddressId] = useState(null);
    
    const fileInputRef = useRef(null);
    console.log('userInfo', userInfo);
    console.log('previewImage', previewImage);

    // Get user information
    useEffect(() => {
        fetchUserInfo();
        fetchAddresses();
    }, []);
    
    // Get current user info from API
    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/get-user');
            const user = data.userInfo;
            
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                image: user.image || ''
            });
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error.response?.data);
        }
    };
    
    // Get address list
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/address/get-all');
            setAddresses(data.addresses);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error.response?.data);
        }
    };
    
    // Update personal information
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await api.put('/update-profile', profile);
            setLoading(false);
            dispatch(user_update(data.userInfo));
            toast.success(data.message);
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };
    
    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024 * 2) { // 2MB
                toast.error('Image size cannot exceed 2MB');
                return;
            }
            
            const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!acceptedTypes.includes(file.type)) {
                toast.error('Only JPEG, PNG, JPG image formats are accepted');
                return;
            }
            
            // Create URL for image preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Upload image
            handleUploadImage(file);
        }
    };
    
    // Upload profile image
    const handleUploadImage = async (file) => {
        try {
            setImageLoading(true);
            const formData = new FormData();
            formData.append('image', file);
            
            const { data } = await api.post('/profile-image-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setImageLoading(false);
            dispatch(user_update(data.userInfo));
            toast.success(data.message);
        } catch (error) {
            setImageLoading(false);
            toast.error(error.response?.data?.message || 'Error uploading image');
        }
    };
    
    // Add new address
    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // If adding a default address, backend will automatically update other addresses
            const { data } = await api.post('/address/add', newAddress);
            setLoading(false);
            setShowAddressForm(false);
            setNewAddress({
                receiverName: '',
                phoneNumber: '',
                province: '',
                district: '',
                ward: '',
                streetAddress: '',
                isDefault: false
            });
            // Update address list after adding
            fetchAddresses();
            toast.success(data.message || 'New address added successfully');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };
    
    // Update address
    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // If updating an address to default, backend will automatically update other addresses
            const { data } = await api.put(`/address/update/${editAddress._id}`, editAddress);
            setLoading(false);
            setEditAddress(null);
            // Update address list after editing
            fetchAddresses();
            toast.success(data.message || 'Address updated successfully');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };
    
    // Delete address - Show confirmation modal
    const handleDeleteAddress = (addressId) => {
        setDeleteAddressId(addressId);
        setShowDeleteModal(true);
    };
    
    // Confirm delete address
    const confirmDeleteAddress = async () => {
        try {
            setLoading(true);
            const { data } = await api.delete(`/address/delete/${deleteAddressId}`);
            setLoading(false);
            setShowDeleteModal(false);
            fetchAddresses();
            toast.success(data.message);
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };
    
    // Set default address
    const handleSetDefaultAddress = async (addressId) => {
        try {
            setLoading(true);
            // API will automatically set all other addresses to non-default
            const { data } = await api.put(`/address/set-default/${addressId}`);
            setLoading(false);
            // Update address list after setting default
            fetchAddresses();
            toast.success(data.message || 'Default address set successfully');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };
    
    // Handle edit address
    const handleEditAddress = (address) => {
        // Use address fields directly from model, no conversion needed
        setEditAddress({...address});
        // Ensure edit form is shown and add form is hidden
        setShowAddressForm(false);
    };
    
    return (
        <div className="w-full p-5">
            <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
            
            <div className="bg-white p-4 rounded-md shadow mb-6">
                <h3 className="text-xl font-medium mb-4">Personal Information</h3>
                
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-green-500 mb-2">
                            <img 
                                src={previewImage || profile?.image || 'https://via.placeholder.com/150?text=User'} 
                                alt="Profile Picture" 
                                className="w-full h-full object-cover"
                            />
                            <div 
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <FaCamera className="text-white text-2xl" />
                            </div>
                            {imageLoading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/jpeg, image/png, image/jpg"
                            onChange={handleImageChange}
                        />
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="text-green-600 text-sm font-medium hover:underline"
                        >
                            Change Image
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            Max size: 2MB<br />
                            Formats: JPG, PNG
                        </p>
                    </div>
                    
                    {/* Information Form */}
                    <div className="flex-1">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-green-500" 
                                    value={profile.name} 
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-green-500 bg-gray-100" 
                                    value={profile.email} 
                                    readOnly
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-green-500" 
                                    value={profile.phoneNumber} 
                                    onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-green-500" 
                                        value={profile.dateOfBirth} 
                                        onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Gender</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-green-500" 
                                        value={profile.gender} 
                                        onChange={(e) => setProfile({...profile, gender: e.target.value})}
                                    >
                                        <option value="">-- Select Gender --</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Information'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-md shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">My Addresses</h3>
                    {!showAddressForm && !editAddress && (
                        <button 
                            onClick={() => setShowAddressForm(true)} 
                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition flex items-center gap-1"
                        >
                            <FaPlus /> Add New Address
                        </button>
                    )}
                </div>
                
                {/* Add Address Form */}
                {showAddressForm && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h4 className="text-lg font-medium mb-3">Add New Address</h4>
                        <form onSubmit={handleAddAddress}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Receiver's Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={newAddress.receiverName} 
                                        onChange={(e) => setNewAddress({...newAddress, receiverName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={newAddress.phoneNumber} 
                                        onChange={(e) => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Province/City</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={newAddress.province} 
                                        onChange={(e) => setNewAddress({...newAddress, province: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">District</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={newAddress.district} 
                                        onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Ward/Commune</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={newAddress.ward} 
                                        onChange={(e) => setNewAddress({...newAddress, ward: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3 md:col-span-2">
                                    <label className="block text-gray-700 mb-1">Street Address</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={newAddress.streetAddress} 
                                        onChange={(e) => setNewAddress({...newAddress, streetAddress: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3 md:col-span-2">
                                    <label className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="mr-2" 
                                            checked={newAddress.isDefault}
                                            onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                                        />
                                        Set as default address
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button 
                                    type="submit" 
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Address'}
                                </button>
                                <button 
                                    type="button" 
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                                    onClick={() => setShowAddressForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* Update Address Form */}
                {editAddress && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h4 className="text-lg font-medium mb-3">Update Address</h4>
                        <form onSubmit={handleUpdateAddress}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Receiver's Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={editAddress.receiverName} 
                                        onChange={(e) => setEditAddress({...editAddress, receiverName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={editAddress.phoneNumber} 
                                        onChange={(e) => setEditAddress({...editAddress, phoneNumber: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Province/City</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={editAddress.province} 
                                        onChange={(e) => setEditAddress({...editAddress, province: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">District</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={editAddress.district} 
                                        onChange={(e) => setEditAddress({...editAddress, district: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-1">Ward/Commune</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={editAddress.ward} 
                                        onChange={(e) => setEditAddress({...editAddress, ward: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3 md:col-span-2">
                                    <label className="block text-gray-700 mb-1">Street Address</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                                        value={editAddress.streetAddress} 
                                        onChange={(e) => setEditAddress({...editAddress, streetAddress: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3 md:col-span-2">
                                    <label className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="mr-2" 
                                            checked={editAddress.isDefault}
                                            onChange={(e) => setEditAddress({...editAddress, isDefault: e.target.checked})}
                                        />
                                        Set as default address
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button 
                                    type="submit" 
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Address'}
                                </button>
                                <button 
                                    type="button" 
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                                    onClick={() => setEditAddress(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* Address List */}
                <div className="mt-4">
                    {loading && !showAddressForm && !editAddress ? (
                        <p className="text-center text-gray-600">Loading data...</p>
                    ) : addresses.length > 0 ? (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div key={address._id} className={`border rounded-md p-4 ${address.isDefault ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                    <div className="flex justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-medium">{address.receiverName}</p>
                                                <p className="text-gray-600">{address.phoneNumber}</p>
                                                {address.isDefault && (
                                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Default</span>
                                                )}
                                            </div>
                                            <p className="text-gray-700">
                                                {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => handleEditAddress(address)} 
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAddress(address._id)} 
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    {!address.isDefault && (
                                        <button 
                                            onClick={() => handleSetDefaultAddress(address._id)}
                                            className="mt-3 text-sm text-green-600 hover:text-green-800"
                                        >
                                            Set as default address
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">You don't have any addresses yet. Please add a new address.</p>
                    )}
                </div>
            </div>
            
            {/* Delete Address Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-md shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-medium mb-3">Confirm Deletion</h4>
                        <p className="text-gray-600 mb-4">Are you sure you want to delete this address? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDeleteAddress}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile; 