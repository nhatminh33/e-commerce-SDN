import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { get_card_products, delete_card_product, messageClear, quantity_inc, quantity_dec, update_cart_quantity } from '../store/reducers/cardReducer';
import toast from 'react-hot-toast';

const Card = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { card_products, successMessage, price, buy_product_item, shipping_fee, outofstock_products } = useSelector(state => state.card);
    const navigate = useNavigate();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const toggleSelectProduct = (productId) => {
        setSelectedProducts(prevSelected =>
            prevSelected.includes(productId)
                ? prevSelected.filter(id => id !== productId)
                : [...prevSelected, productId]
        );
    };
    useEffect(() => {
        dispatch(get_card_products(userInfo.id));
    }, [userInfo.id]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            dispatch(get_card_products(userInfo.id));
        }
    }, [successMessage]);

    const redirect = () => {
        navigate('/shipping', {
            state: {
                products: card_products,
                price: price,
                shipping_fee: shipping_fee,
                items: card_products.length
            }
        });
    };

    const handleDelete = (productId) => {
        dispatch(delete_card_product({ userId: userInfo.id, productIds: selectedProducts }))
            .then(() => {
                dispatch(get_card_products(userInfo.id)); // Gọi lại API lấy giỏ hàng ngay sau khi xóa
            });
    };
    const handleQuantityChange = async (newQuantity, productId) => {
        if (newQuantity > 0) {
            await dispatch(update_cart_quantity({ userId: userInfo.id, productId, quantity: newQuantity }));
            dispatch(get_card_products(userInfo.id)); // Load lại giỏ hàng sau khi cập nhật số lượng
        }
    };

    const inc = (quantity, stock, productId) => {
        if (quantity + 1 <= stock) {
            handleQuantityChange(quantity + 1, productId);
        }
    };

    const dec = (quantity, productId) => {
        if (quantity - 1 > 0) {
            handleQuantityChange(quantity - 1, productId);
        }
    };

    return (
        <div>
            <Header />
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] mt-6 bg-cover bg-no-repeat relative bg-left'>
                <div className='absolute left-0 top-0 w-full h-full bg-[#2422228a]'>
                    <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                        <div className='flex flex-col justify-center gap-1 items-center h-full w-full text-white'>
                            <h2 className='text-3xl font-bold'>Cart Page</h2>
                            <div className='flex justify-center items-center gap-2 text-2xl w-full'>
                                <Link to='/'>Home</Link>
                                <span className='pt-1'><IoIosArrowForward /></span>
                                <span>Cart</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='bg-[#eeeeee]'>
                <div className='w-[85%] lg:w-[90%] md:w-[90%] sm:w-[90%] mx-auto py-16'>
                    {
                        card_products.length > 0 || (Array.isArray(outofstock_products) && outofstock_products.length > 0) ? (
                            <div className='flex flex-wrap'>
                                <div className='w-[67%] md-lg:w-full'>
                                    <div className='pr-3 md-lg:pr-0'>
                                        <div className='flex flex-col gap-3'>
                                            <div className='bg-white p-4'>
                                                <h2 className='text-md text-green-500 font-semibold'>Stock Products ({card_products.length})</h2>
                                            </div>

                                            {card_products.map((c, i) => (
                                                <div key={i} className='flex bg-white p-4 flex-col gap-2'>
                                                    <div>
                                                        <input
                                                            type='checkbox'
                                                            checked={selectedProducts.includes(c.productId)}
                                                            onChange={() => toggleSelectProduct(c.productId)}
                                                        />
                                                    </div>
                                                    <div className='flex justify-start items-center'>
                                                        <h2 className='text-md text-slate-600 font-bold'>{c.name}</h2>
                                                    </div>
                                                    <div className='w-full flex flex-wrap'>
                                                        <div className='flex sm:w-full gap-2 w-7/12'>
                                                            <div className='flex gap-2 justify-start items-center'>
                                                                <img className='w-[80px] h-[80px]' src={c.images[0]} alt={c.name} />
                                                                <div className='pr-4 text-slate-600'>
                                                                    <h2 className='text-md font-semibold'>{c.name}</h2>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className='flex justify-between w-5/12 sm:w-full sm:mt-3'>
                                                            <div className='pl-4 sm:pl-0'>
                                                                <h2 className='text-lg text-orange-500'>${c.price - Math.floor((c.price * c.discount) / 100)}</h2>
                                                                <p className='line-through'>${c.price}</p>
                                                                <p>-{c.discount}%</p>
                                                            </div>
                                                            <div className='flex gap-2 flex-col'>
                                                                <div className='flex bg-slate-200 h-[30px] justify-center items-center text-xl'>
                                                                    <div onClick={() => dec(c.quantity, c.productId)} className='px-3 cursor-pointer'>-</div>
                                                                    <div className='px-3'>{c.quantity}</div>
                                                                    <div onClick={() => inc(c.quantity, c.stock, c.productId)} className='px-3 cursor-pointer'>+</div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            className="bg-red-500 hover:bg-red-700 mt-2  text-white px-5 py-[5px] rounded-md transition-all"
                                        >
                                            Delete Product Select
                                        </button>
                                    </div>
                                </div>

                                <div className='w-[33%] md-lg:w-full'>
                                    <div className='pl-3 md-lg:pl-0 md-lg:mt-5'>
                                        {card_products.length > 0 && (
                                            <div className='bg-white p-3 text-slate-600 flex flex-col gap-3'>
                                                <h2 className='text-xl font-bold'>Order Summary</h2>
                                                <div className='flex justify-between items-center'>
                                                    <span>{card_products.length} Items</span>
                                                    <span>${price}</span>
                                                </div>
                                                <div className='flex justify-between items-center'>
                                                    <span>Shipping Fee</span>
                                                    <span>${shipping_fee}</span>
                                                </div>
                                                <div className='flex justify-between items-center'>
                                                    <span>Total</span>
                                                    <span className='text-lg text-[#059473]'>${price + shipping_fee}</span>
                                                </div>
                                                <button onClick={redirect} className='px-5 py-[6px] bg-red-500 text-white uppercase'>
                                                    Proceed to Checkout ({card_products.length})
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link className='px-4 py-1 bg-indigo-500 text-white' to='/'>Shop Now</Link>
                        )
                    }
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Card;
