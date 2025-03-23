import React, { useEffect, useState } from 'react';
// import Header from './components/Header';
// import Footer from './components/Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
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
    const [state, setState] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        email: '',
    })

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setRes(true)
            dispatch(messageClear());
        }
    }, [successMessage]);
    const save = (e) => {
        e.preventDefault()
        const { fullName, address, phoneNumber, city, country, email } = state;
        if (fullName && address && phoneNumber && city && country && email) {
            setRes(true);
        } else {
            toast.error("Please fill in all fields!");
        }

    }

    const handlePlaceOrder = async () => {
        dispatch(place_order({
            userId: userInfo.id,
            shippingInfo: state,
            selectedItems: products.map(p => p.itemId),
        }))

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

                                    <h2 className='text-slate-600 font-bold pb-3'>Shipping Information </h2>

                                    {
                                        !res && <>
                                            <form onSubmit={save} className='flex flex-col gap-4'>
                                                {['fullName', 'address', 'phoneNumber', 'city', 'country', 'email'].map((field, index) => (
                                                    <div key={index} className='flex flex-col gap-1'>
                                                        <label htmlFor={field} className='capitalize'>{field.replace(/([A-Z])/g, ' $1')}</label>
                                                        <input
                                                            onChange={inputHandle}
                                                            value={state[field]}
                                                            type='text'
                                                            className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                            name={field}
                                                            id={field}
                                                            placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
                                                        />
                                                    </div>
                                                ))}
                                                <button onClick={handlePlaceOrder} type='submit' className='px-3 py-[6px] rounded-sm bg-green-500 text-white hover:shadow-lg'>Save Change</button>
                                            </form>


                                        </>
                                    }

                                    {
                                        res && <div className='flex flex-col gap-1'>
                                            <h2 className='text-slate-600 font-semibold pb-2'>Deliver To {state.name}</h2>
                                            <p>
                                                <span className='bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-2 py-1 rounded'>Home</span>
                                                <span>{state.phoneNumber} {state.address} {state.fullName} {state.city} {state.country}  </span>

                                                <span onClick={() => setRes(false)} className='text-indigo-500 cursor-pointer'>Change </span>
                                            </p>

                                            <p className='text-slate-600 text-sm' >Email To {state.email}</p>

                                        </div>
                                    }
                                </div>

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
                                                        <p className="text-sm">Số lượng: <span className="font-bold">{parseFloat.quantity}</span></p>
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
                                        <span>Items Total (items) </span>
                                        <span>${price}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Delivery Fee </span>
                                        <span>${shipping_fee} </span>
                                    </div>

                                    <div className='flex justify-between items-center'>
                                        <span>Total Payment </span>
                                        <span>${price + shipping_fee} </span>
                                    </div>


                                    <div className='flex justify-between items-center'>
                                        <span>Total</span>
                                        <span className='text-lg text-[#059473]'>${price + shipping_fee} </span>
                                    </div>
                                    <button onClick={hanleCheckout} disabled={res ? false : true} className={`px-5 py-[6px] rounded-sm hover:shadow-red-500/50 hover:shadow-lg ${res ? 'bg-red-500' : 'bg-red-300'}  text-sm text-white uppercase`}>
                                        Place Order
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