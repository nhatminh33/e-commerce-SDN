import React, { useEffect, useState } from 'react';
// import Header from './components/Header';
// import Footer from './components/Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { place_order } from '../store/reducers/orderReducer';
import { messageClear } from '../store/reducers/cardReducer';
import api from '../api/api';
// import { place_order } from './store/reducers/orderReducer';

const Shipping = () => {

    const { state: { products, price, shipping_fee, items } } = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation();
    const { userInfo } = useSelector(state => state.auth)
    const { successMessage, myOrder } = useSelector(state => state.order);
    const [res, setRes] = useState(false)
    
    // Địa chỉ người dùng
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Thông tin mới tạo địa chỉ
    const [newAddress, setNewAddress] = useState({
        receiverName: '',
        phoneNumber: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: false
    });
    
    // State cho việc chỉnh sửa địa chỉ
    const [editAddress, setEditAddress] = useState(null);
    
    // Lấy danh sách địa chỉ của người dùng
    useEffect(() => {
        fetchAddresses();
    }, []);
    
    // Lấy danh sách địa chỉ người dùng từ API
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/address/get-all');
            setAddresses(data.addresses);
            
            // Nếu có địa chỉ mặc định, chọn nó
            const defaultAddress = data.addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress._id);
            } else if (data.addresses.length > 0) {
                setSelectedAddressId(data.addresses[0]._id);
            }
            
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error.response?.data);
        }
    };
    
    // Xử lý thêm địa chỉ mới
    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
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
            fetchAddresses();
            toast.success(data.message || 'Đã thêm địa chỉ mới thành công');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.error || 'Đã xảy ra lỗi');
        }
    };
    
    // Xử lý cập nhật địa chỉ
    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await api.put(`/address/update/${editAddress._id}`, editAddress);
            setLoading(false);
            setEditAddress(null);
            fetchAddresses();
            toast.success(data.message || 'Cập nhật địa chỉ thành công');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.error || 'Đã xảy ra lỗi');
        }
    };
    
    // Xử lý xóa địa chỉ
    const handleDeleteAddress = async (addressId) => {
        try {
            setLoading(true);
            const { data } = await api.delete(`/address/delete/${addressId}`);
            setLoading(false);
            fetchAddresses();
            toast.success(data.message || 'Đã xóa địa chỉ');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.error || 'Đã xảy ra lỗi');
        }
    };
    
    // Đặt địa chỉ mặc định
    const handleSetDefaultAddress = async (addressId) => {
        try {
            setLoading(true);
            const { data } = await api.put(`/address/set-default/${addressId}`);
            setLoading(false);
            fetchAddresses();
            toast.success(data.message || 'Đặt địa chỉ mặc định thành công');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.error || 'Đã xảy ra lỗi');
        }
    };
    
    // Chọn địa chỉ để chỉnh sửa
    const handleEditAddress = (address) => {
        setEditAddress({...address});
        setShowAddressForm(false);
    };
    
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setRes(true)
            dispatch(messageClear());
        }
    }, [successMessage]);

    // Lấy thông tin địa chỉ đã chọn
    const getSelectedAddressInfo = () => {
        const selected = addresses.find(addr => addr._id === selectedAddressId);
        if (selected) {
            return {
                fullName: selected.receiverName,
                phoneNumber: selected.phoneNumber,
                address: selected.streetAddress,
                city: selected.province,
                country: selected.district,
                email: userInfo?.email || 'customer@gmail.com'
            };
        }
        return null;
    };

    const handlePlaceOrder = async () => {
        const selectedAddress = getSelectedAddressInfo();
        if (!selectedAddress) {
            toast.error("Please select a shipping address");
            return;
        }

        dispatch(place_order({
            userId: userInfo.id,
            shippingInfo: selectedAddress,
            selectedItems: products.map(p => p.itemId),
        }));
    };

    console.log(myOrder);
    const hanleCheckout = async () => {

        try {
            const response = await api.post("http://localhost:5000/api/create_payment_url", {
                orderId: myOrder[0]._id,
                amount: myOrder[0].totalPrice,
                bankCode: "NCB",
                language: "vn"
            });

            if (response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                toast.error("Thanh toán thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            toast.error("Có lỗi xảy ra!");
        }
    }

    return (
        <div>
            <Header />
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] mt-6 bg-cover bg-no-repeat relative bg-left'>
                <div className='absolute left-0 top-0 w-full h-full bg-[#2422228a]'>
                    <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                        <div className='flex flex-col justify-center gap-1 items-center h-full w-full text-white'>
                            <h2 className='text-3xl font-bold'>Shipping Page </h2>
                            <div className='flex justify-center items-center gap-2 text-2xl w-full'>
                                <Link to='/'>Home</Link>
                                <span className='pt-1'>
                                    <IoIosArrowForward />
                                </span>
                                <span>Shipping </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className='bg-[#eeeeee]'>
                <div className='w-[85%] lg:w-[90%] md:w-[90%] sm:w-[90%] mx-auto py-16'>
                    <div className='w-full flex flex-wrap'>
                        <div className='w-[67%] md-lg:w-full'>
                            <div className='flex flex-col gap-3'>
                                <div className='bg-white p-6 shadow-sm rounded-md'>
                                    <div className='flex justify-between items-center'>
                                        <h2 className='text-slate-600 font-bold pb-3'>Shipping Information </h2>
                                        <button 
                                            onClick={() => setShowAddressForm(true)} 
                                            className='bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1 hover:bg-green-600 transition-all'
                                        >
                                            <FaPlus size={12} /> Add Address
                                        </button>
                                    </div>

                                    {/* Danh sách địa chỉ */}
                                    {addresses.length > 0 ? (
                                        <div className='flex flex-col gap-3 my-4'>
                                            {addresses.map((address) => (
                                                <div 
                                                    key={address._id} 
                                                    className={`border rounded-md p-3 flex justify-between items-start ${address._id === selectedAddressId ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                                                >
                                                    <div className='flex items-start gap-3'>
                                                        <input 
                                                            type="radio"
                                                            name="selectedAddress"
                                                            checked={address._id === selectedAddressId}
                                                            onChange={() => setSelectedAddressId(address._id)}
                                                            className='mt-1'
                                                        />
                                                        <div>
                                                            <div className='flex items-center gap-2'>
                                                                <h3 className='font-medium'>{address.receiverName}</h3>
                                                                {address.isDefault && (
                                                                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'>Mặc định</span>
                                                                )}
                                                            </div>
                                                            <p className='text-gray-600 text-sm'>{address.phoneNumber}</p>
                                                            <p className='text-gray-600 text-sm'>
                                                                {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <button 
                                                            onClick={() => handleEditAddress(address)}
                                                            className='text-blue-500 hover:text-blue-700'
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAddress(address._id)}
                                                            className='text-red-500 hover:text-red-700'
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                        {!address.isDefault && (
                                                            <button 
                                                                onClick={() => handleSetDefaultAddress(address._id)}
                                                                className='text-xs text-green-600 hover:text-green-800 ml-2'
                                                            >
                                                                Set as default
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='py-3 text-gray-500'>You don't have any shipping addresses yet. Please add a new address.</p>
                                    )}

                                    {/* Form thêm địa chỉ mới */}
                                    {showAddressForm && (
                                        <div className='border-t border-gray-200 pt-4 mt-4'>
                                            <h3 className='font-medium mb-3'>Add New Address</h3>
                                            <form onSubmit={handleAddAddress} className='grid grid-cols-2 gap-4'>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='receiverName'>Receiver's Name</label>
                                                    <input
                                                        type='text'
                                                        id='receiverName'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={newAddress.receiverName}
                                                        onChange={(e) => setNewAddress({...newAddress, receiverName: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='phoneNumber'>Phone Number</label>
                                                    <input
                                                        type='text'
                                                        id='phoneNumber'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={newAddress.phoneNumber}
                                                        onChange={(e) => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='province'>Province/City</label>
                                                    <input
                                                        type='text'
                                                        id='province'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={newAddress.province}
                                                        onChange={(e) => setNewAddress({...newAddress, province: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='district'>District</label>
                                                    <input
                                                        type='text'
                                                        id='district'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={newAddress.district}
                                                        onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='ward'>Ward/Commune</label>
                                                    <input
                                                        type='text'
                                                        id='ward'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={newAddress.ward}
                                                        onChange={(e) => setNewAddress({...newAddress, ward: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='streetAddress'>Street Address</label>
                                                    <input
                                                        type='text'
                                                        id='streetAddress'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={newAddress.streetAddress}
                                                        onChange={(e) => setNewAddress({...newAddress, streetAddress: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='col-span-2 flex items-center gap-2 mt-2'>
                                                    <input
                                                        type='checkbox'
                                                        id='isDefault'
                                                        checked={newAddress.isDefault}
                                                        onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                                                    />
                                                    <label htmlFor='isDefault'>Set as default address</label>
                                                </div>
                                                <div className='col-span-2 flex gap-3 mt-2'>
                                                    <button 
                                                        type='submit' 
                                                        className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all'
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Processing...' : 'Add Address'}
                                                    </button>
                                                    <button 
                                                        type='button' 
                                                        className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all'
                                                        onClick={() => setShowAddressForm(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Form chỉnh sửa địa chỉ */}
                                    {editAddress && (
                                        <div className='border-t border-gray-200 pt-4 mt-4'>
                                            <h3 className='font-medium mb-3'>Edit Address</h3>
                                            <form onSubmit={handleUpdateAddress} className='grid grid-cols-2 gap-4'>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='edit-receiverName'>Receiver's Name</label>
                                                    <input
                                                        type='text'
                                                        id='edit-receiverName'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={editAddress.receiverName}
                                                        onChange={(e) => setEditAddress({...editAddress, receiverName: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='edit-phoneNumber'>Phone Number</label>
                                                    <input
                                                        type='text'
                                                        id='edit-phoneNumber'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={editAddress.phoneNumber}
                                                        onChange={(e) => setEditAddress({...editAddress, phoneNumber: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='edit-province'>Province/City</label>
                                                    <input
                                                        type='text'
                                                        id='edit-province'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={editAddress.province}
                                                        onChange={(e) => setEditAddress({...editAddress, province: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='edit-district'>District</label>
                                                    <input
                                                        type='text'
                                                        id='edit-district'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={editAddress.district}
                                                        onChange={(e) => setEditAddress({...editAddress, district: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='edit-ward'>Ward/Commune</label>
                                                    <input
                                                        type='text'
                                                        id='edit-ward'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={editAddress.ward}
                                                        onChange={(e) => setEditAddress({...editAddress, ward: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <label htmlFor='edit-streetAddress'>Street Address</label>
                                                    <input
                                                        type='text'
                                                        id='edit-streetAddress'
                                                        className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                        value={editAddress.streetAddress}
                                                        onChange={(e) => setEditAddress({...editAddress, streetAddress: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className='col-span-2 flex items-center gap-2 mt-2'>
                                                    <input
                                                        type='checkbox'
                                                        id='edit-isDefault'
                                                        checked={editAddress.isDefault}
                                                        onChange={(e) => setEditAddress({...editAddress, isDefault: e.target.checked})}
                                                    />
                                                    <label htmlFor='edit-isDefault'>Set as default address</label>
                                                </div>
                                                <div className='col-span-2 flex gap-3 mt-2'>
                                                    <button 
                                                        type='submit' 
                                                        className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all'
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Processing...' : 'Update Address'}
                                                    </button>
                                                    <button 
                                                        type='button' 
                                                        className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all'
                                                        onClick={() => setEditAddress(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Hiển thị thông tin đã xác nhận */}
                                    {res && (
                                        <div className='flex flex-col gap-1 mt-4'>
                                            <h2 className='text-slate-600 font-semibold pb-2'>Shipping to {getSelectedAddressInfo()?.fullName}</h2>
                                            <p>
                                                <span className='bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-2 py-1 rounded'>Address</span>
                                                <span>{getSelectedAddressInfo()?.phoneNumber} {getSelectedAddressInfo()?.address} {getSelectedAddressInfo()?.city} {getSelectedAddressInfo()?.country}</span>
                                                <span onClick={() => setRes(false)} className='text-indigo-500 cursor-pointer ml-2'>Change</span>
                                            </p>
                                            <p className='text-slate-600 text-sm'>Email: {getSelectedAddressInfo()?.email}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Hiển thị thông tin sản phẩm */}
                                {
                                    products.map((p, i) => (
                                        <div key={i} className='flex bg-white p-4 flex-col gap-2'>
                                            <div className='flex justify-start items-center'>
                                                <h2 className='text-md text-slate-600 font-bold'>{p.category.name}</h2>
                                            </div>

                                            {products.length > 0 ? (
                                                <div className="flex items-center border-b py-4">
                                                    <img
                                                        src={p.images[0]}
                                                        alt={p.name}
                                                        className="w-[80px] h-[80px] object-cover rounded-md"
                                                    />

                                                    <div className="ml-4 flex-1">
                                                        <h3 className="text-lg font-semibold">{p.name}</h3>
                                                        <p className="text-sm text-gray-500">{p.description}</p>
                                                        <p className="text-sm">Quantity: <span className="font-bold">{p.quantity}</span></p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-lg text-orange-500">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                                                .format(p.price - (p.price * p.discount) / 100)}
                                                        </p>
                                                        <p className="text-sm line-through text-gray-400">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                                                .format(p.price)}
                                                        </p>
                                                        <p className="text-sm text-red-500">-{p.discount}%</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500">Không có sản phẩm nào trong đơn hàng</p>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className='w-[33%] md-lg:w-full'>
                            <div className='pl-3 md-lg:pl-0 md-lg:mt-5'>
                                <div className='bg-white p-3 text-slate-600 flex flex-col gap-3'>
                                    <h2 className='text-xl font-bold'>Order Summary</h2>
                                    <div className='flex justify-between items-center'>
                                        <span>Items Total</span>
                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Delivery Fee</span>
                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping_fee)} </span>
                                    </div>

                                    <div className='flex justify-between items-center'>
                                        <span>Total Payment</span>
                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price + shipping_fee)} </span>
                                    </div>

                                    <div className='flex justify-between items-center'>
                                        <span>Total</span>
                                        <span className='text-lg text-[#059473]'>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price + shipping_fee)} </span>
                                    </div>
                                    <button 
                                        onClick={handlePlaceOrder} 
                                        disabled={!selectedAddressId || editAddress || showAddressForm || loading || res} 
                                        className={`px-5 py-[6px] rounded-sm hover:shadow-green-500/50 hover:shadow-lg ${selectedAddressId && !editAddress && !showAddressForm && !loading && !res ? 'bg-green-500' : 'bg-green-300'}  text-sm text-white uppercase mb-2`}
                                    >
                                        Create Order
                                    </button>
                                    <button 
                                        onClick={hanleCheckout} 
                                        disabled={!res} 
                                        className={`px-5 py-[6px] rounded-sm hover:shadow-red-500/50 hover:shadow-lg ${res ? 'bg-red-500' : 'bg-red-300'}  text-sm text-white uppercase`}
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Shipping;