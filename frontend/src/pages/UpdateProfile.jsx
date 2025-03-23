import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../api/api';
import { FaEdit, FaTrash, FaStar, FaPlus } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { user_info_update } from '../store/reducers/authReducer';

const UpdateProfile = () => {
    const { userInfo } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    // State cho thông tin cá nhân
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // State cho quản lý địa chỉ
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editAddressId, setEditAddressId] = useState(null);
    const [addressLoading, setAddressLoading] = useState(false);

    // State cho form địa chỉ
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        country: '',
        city: '',
        district: '',
        ward: '',
        street: '',
        isDefault: false
    });

    // Lấy thông tin người dùng khi component mount
    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name || '');
            setEmail(userInfo.email || '');
            setImagePreview(userInfo.image || '');
        }
        fetchAddresses();
    }, [userInfo]);

    // Hàm lấy danh sách địa chỉ
    const fetchAddresses = async () => {
        try {
            setAddressLoading(true);
            const { data } = await api.get('/address/get-all');
            setAddresses(data);
            setAddressLoading(false);
        } catch (error) {
            setAddressLoading(false);
            console.log(error.response?.data?.message || error.message);
        }
    };

    // Xử lý thay đổi ảnh đại diện
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Xử lý cập nhật thông tin cá nhân
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Cập nhật thông tin
            const { data } = await api.put('/update-profile', { name, email });
            
            // Nếu có ảnh mới, cập nhật ảnh đại diện
            if (profileImage) {
                const formData = new FormData();
                formData.append('image', profileImage);
                await api.post('/profile-image-upload', formData);
            }
            
            // Cập nhật thông tin trong Redux store
            dispatch(user_info_update(data.userInfo));
            setLoading(false);
            toast.success('Cập nhật thông tin thành công');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Xử lý thay đổi trường trong form địa chỉ
    const handleAddressChange = (e) => {
        const { name, value, checked, type } = e.target;
        setAddressForm({
            ...addressForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Xử lý mở form edit địa chỉ
    const handleEditAddress = (address) => {
        setEditAddressId(address._id);
        setAddressForm({
            fullName: address.fullName || '',
            phone: address.phone || '',
            country: address.country || '',
            city: address.city || '',
            district: address.district || '',
            ward: address.ward || '',
            street: address.street || '',
            isDefault: address.isDefault || false
        });
        setShowAddressForm(true);
    };

    // Reset form địa chỉ
    const resetAddressForm = () => {
        setAddressForm({
            fullName: '',
            phone: '',
            country: '',
            city: '',
            district: '',
            ward: '',
            street: '',
            isDefault: false
        });
        setEditAddressId(null);
        setShowAddressForm(false);
    };

    // Xử lý thêm/cập nhật địa chỉ
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            setAddressLoading(true);
            if (editAddressId) {
                // Cập nhật địa chỉ hiện có
                await api.put(`/address/update/${editAddressId}`, addressForm);
                toast.success('Cập nhật địa chỉ thành công');
            } else {
                // Thêm địa chỉ mới
                await api.post('/address/add', addressForm);
                toast.success('Thêm địa chỉ thành công');
            }
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            setAddressLoading(false);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Xử lý xóa địa chỉ
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
            try {
                setAddressLoading(true);
                await api.delete(`/address/delete/${addressId}`);
                toast.success('Xóa địa chỉ thành công');
                fetchAddresses();
            } catch (error) {
                setAddressLoading(false);
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        }
    };

    // Xử lý đặt địa chỉ mặc định
    const handleSetDefaultAddress = async (addressId) => {
        try {
            setAddressLoading(true);
            await api.put(`/address/set-default/${addressId}`);
            toast.success('Đã đặt làm địa chỉ mặc định');
            fetchAddresses();
        } catch (error) {
            setAddressLoading(false);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="px-2 lg:px-5 py-5">
            <div className="w-full bg-white p-4 rounded-md">
                <h2 className="text-2xl font-semibold text-slate-600 pb-5 border-b">Cập nhật thông tin cá nhân</h2>
                <div className="flex flex-wrap">
                    <div className="w-full md:w-1/3 p-3 flex justify-center">
                        <div className="relative">
                            <div className="w-[180px] h-[180px] rounded-full overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover" 
                                    src={imagePreview || "https://via.placeholder.com/180"} 
                                    alt="User avatar" 
                                />
                            </div>
                            <label 
                                htmlFor="profileImage" 
                                className="absolute bottom-3 right-3 bg-white p-2 rounded-full cursor-pointer shadow-md"
                            >
                                <FaEdit className="text-green-500" />
                            </label>
                            <input 
                                type="file" 
                                id="profileImage" 
                                onChange={handleImageChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 p-3">
                        <form onSubmit={handleProfileUpdate}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="Họ và tên"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="Email"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all"
                                disabled={loading}
                            >
                                {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="w-full bg-white p-4 rounded-md mt-5">
                <div className="flex justify-between items-center pb-4 border-b">
                    <h2 className="text-2xl font-semibold text-slate-600">Quản lý địa chỉ</h2>
                    <button 
                        onClick={() => setShowAddressForm(!showAddressForm)} 
                        className="flex items-center bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all"
                    >
                        {showAddressForm ? <IoMdClose className="mr-1" /> : <FaPlus className="mr-1" />}
                        {showAddressForm ? 'Đóng' : 'Thêm địa chỉ mới'}
                    </button>
                </div>

                {showAddressForm && (
                    <div className="mt-4 p-4 border rounded-md bg-gray-50">
                        <h3 className="text-lg font-medium mb-3">
                            {editAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                        </h3>
                        <form onSubmit={handleAddressSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input 
                                        type="text" 
                                        id="fullName" 
                                        name="fullName"
                                        value={addressForm.fullName} 
                                        onChange={handleAddressChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Họ và tên"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input 
                                        type="text" 
                                        id="phone" 
                                        name="phone"
                                        value={addressForm.phone} 
                                        onChange={handleAddressChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Số điện thoại"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                                    <input 
                                        type="text" 
                                        id="country" 
                                        name="country"
                                        value={addressForm.country} 
                                        onChange={handleAddressChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Quốc gia"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                                    <input 
                                        type="text" 
                                        id="city" 
                                        name="city"
                                        value={addressForm.city} 
                                        onChange={handleAddressChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Thành phố"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                                    <input 
                                        type="text" 
                                        id="district" 
                                        name="district"
                                        value={addressForm.district} 
                                        onChange={handleAddressChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Quận/Huyện"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                                    <input 
                                        type="text" 
                                        id="ward" 
                                        name="ward"
                                        value={addressForm.ward} 
                                        onChange={handleAddressChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Phường/Xã"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Đường/Số nhà</label>
                                    <input 
                                        type="text" 
                                        id="street" 
                                        name="street"
                                        value={addressForm.street} 
                                        onChange={handleAddressChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Đường/Số nhà"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            name="isDefault"
                                            checked={addressForm.isDefault} 
                                            onChange={handleAddressChange} 
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Đặt làm địa chỉ mặc định</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button 
                                    type="submit" 
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all"
                                    disabled={addressLoading}
                                >
                                    {addressLoading ? 'Đang xử lý...' : (editAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ')}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={resetAddressForm}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mt-4">
                    {addressLoading && !showAddressForm ? (
                        <p className="text-center py-5">Đang tải...</p>
                    ) : addresses.length === 0 ? (
                        <p className="text-center py-5 text-gray-500">Bạn chưa có địa chỉ nào.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map(address => (
                                <div key={address._id} className="border rounded-md p-4 shadow-sm relative">
                                    {address.isDefault && (
                                        <span className="absolute top-2 right-2 text-green-500">
                                            <FaStar />
                                        </span>
                                    )}
                                    <h4 className="font-semibold">{address.fullName}</h4>
                                    <p className="text-gray-600 text-sm">{address.phone}</p>
                                    <p className="text-gray-600 text-sm mt-2">
                                        {address.street}, {address.ward}, {address.district}, {address.city}, {address.country}
                                    </p>
                                    <div className="mt-3 pt-3 border-t flex gap-3">
                                        <button 
                                            onClick={() => handleEditAddress(address)}
                                            className="text-blue-500 flex items-center text-sm"
                                        >
                                            <FaEdit className="mr-1" /> Sửa
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteAddress(address._id)}
                                            className="text-red-500 flex items-center text-sm"
                                        >
                                            <FaTrash className="mr-1" /> Xóa
                                        </button>
                                        {!address.isDefault && (
                                            <button 
                                                onClick={() => handleSetDefaultAddress(address._id)}
                                                className="text-green-500 flex items-center text-sm"
                                            >
                                                <FaStar className="mr-1" /> Đặt mặc định
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateProfile; 