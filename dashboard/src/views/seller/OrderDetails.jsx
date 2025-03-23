import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { update_order_status, messageClear, get_seller_order } from '../../store/Reducers/OrderReducer';
import toast from 'react-hot-toast';
import moment from 'moment';

const OrderDetails = () => {
    const { orderId } = useParams()
    const dispatch = useDispatch()
    const [status, setStatus] = useState('')
    const { order, errorMessage, successMessage, loading } = useSelector(state => state.order)

    useEffect(() => {
        setStatus(order?.delivery_status)
    }, [order])

    useEffect(() => {
        dispatch(get_seller_order(orderId))
    }, [orderId, dispatch]);

    const status_update = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        
        dispatch(update_order_status({
            orderId, 
            delivery_status: newStatus
        }));
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    const formatDate = (date) => {
        if (!date) return '';
        return moment(date).format('MM/DD/YYYY HH:mm');
    }

    const getStatusClass = (status) => {
        return status === 'delivered' 
            ? 'bg-green-500' 
            : status === 'shipping' 
            ? 'bg-blue-500' 
            : status === 'pending' 
            ? 'bg-yellow-500' 
            : 'bg-red-500'
    }

    const getStatusText = (status) => {
        return status === 'delivered' 
            ? 'Delivered' 
            : status === 'shipping' 
            ? 'Shipping' 
            : status === 'pending' 
            ? 'Pending' 
            : 'Canceled'
    }

    if (loading) {
        return (
            <div className='px-2 lg:px-7 pt-5'>
                <div className='w-full p-4 bg-[#6a5fdf] rounded-md flex justify-center items-center h-[400px]'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white'></div>
                </div>
            </div>
        );
    }

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
                <div className='flex justify-between items-center p-4'>
                    <h2 className='text-xl text-[#d0d2d6]'>Order Details</h2>
                    <div className='flex items-center gap-3'>
                        <span className='text-[#d0d2d6]'>Status:</span>
                        <select 
                            onChange={status_update} 
                            value={status || ''} 
                            className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#475569] border border-slate-700 rounded-md text-[#d0d2d6]'
                        >
                            <option value="pending">Pending</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
                </div>

                <div className='p-4'>
                    <div className='flex flex-col gap-2 text-[#d0d2d6]'>
                        <div className='flex justify-between items-center bg-[#8288ed] p-3 rounded-md'>
                            <h2 className='text-lg font-semibold'>Order ID: #{order?._id}</h2>
                            <div className='flex gap-3'>
                                <span>Date: {formatDate(order?.createdAt || order?.date)}</span>
                                <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order?.delivery_status)}`}>
                                    {getStatusText(order?.delivery_status)}
                                </span>
                            </div>
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                            {/* Customer Info */}
                            <div className='bg-[#8288ed] p-4 rounded-md'>
                                <h3 className='text-lg font-semibold mb-3'>Recipient Information</h3>
                                {order?.shippingInfo && (
                                    <div className='flex flex-col gap-1'>
                                        <p><span className='font-medium'>Name:</span> {order.shippingInfo.fullName}</p>
                                        <p><span className='font-medium'>Email:</span> {order.shippingInfo.email}</p>
                                        <p><span className='font-medium'>Phone:</span> {order.shippingInfo.phoneNumber}</p>
                                        <p><span className='font-medium'>Address:</span> {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.country}</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className='bg-[#8288ed] p-4 rounded-md'>
                                <h3 className='text-lg font-semibold mb-3'>Payment Information</h3>
                                <div className='flex flex-col gap-1'>
                                    <p>
                                        <span className='font-medium'>Payment Status:</span> 
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                            order?.payment_status === 'paid' 
                                                ? 'bg-green-500' 
                                                : order?.payment_status === 'pending' 
                                                ? 'bg-yellow-500' 
                                                : 'bg-red-500'
                                        }`}>
                                            {order?.payment_status === 'paid' 
                                                ? 'Paid' 
                                                : order?.payment_status === 'pending' 
                                                ? 'Pending' 
                                                : 'Failed'
                                            }
                                        </span>
                                    </p>
                                    <p><span className='font-medium'>Payment Method:</span> {order?.payment_method || 'No information'}</p>
                                    <p><span className='font-medium'>Total (your products):</span> ${order?.sellerTotal || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Product List */}
                        <div className='mt-5 bg-[#8288ed] p-4 rounded-md'>
                            <h3 className='text-lg font-semibold mb-3'>Products</h3>
                            
                            {order?.products && order.products.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full border-collapse'>
                                        <thead>
                                            <tr className='border-b border-slate-600'>
                                                <th className='text-left py-2 px-2'>Product</th>
                                                <th className='text-center py-2 px-2'>Price</th>
                                                <th className='text-center py-2 px-2'>Quantity</th>
                                                <th className='text-right py-2 px-2'>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.products.map((product, index) => (
                                                <tr key={index} className='border-b border-slate-700'>
                                                    <td className='py-3 px-2'>
                                                        <div className='flex items-center gap-3'>
                                                            {product.productId?.images && product.productId.images[0] && (
                                                                <img 
                                                                    className='w-[60px] h-[60px] object-cover rounded' 
                                                                    src={product.productId.images[0]} 
                                                                    alt={product.productId.name} 
                                                                />
                                                            )}
                                                            <div>
                                                                <h4 className='font-medium'>{product.productId?.name}</h4>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='py-3 px-2 text-center'>
                                                        ${product.productId?.price}
                                                        {product.productId?.discount > 0 && (
                                                            <span className='text-sm line-through ml-2'>
                                                                ${product.productId.price + product.productId.discount}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='py-3 px-2 text-center'>{product.quantity}</td>
                                                    <td className='py-3 px-2 text-right'>${product.subTotal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" className='text-right py-3 px-2 font-semibold'>Total:</td>
                                                <td className='text-right py-3 px-2 font-semibold'>${order?.sellerTotal}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <p className='text-center py-4'>No products found</p>
                            )}
                        </div>
                    </div>
                </div>   
            </div> 
        </div>
    );
};

export default OrderDetails;