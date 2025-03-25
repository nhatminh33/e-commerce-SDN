// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom';
// import { update_order_status, messageClear, get_seller_order } from '../../store/Reducers/OrderReducer';
// import toast from 'react-hot-toast';
// import moment from 'moment';

// const OrderDetails = () => {
//     const { orderId } = useParams()
//     const dispatch = useDispatch()
//     const [status, setStatus] = useState('')
//     const { order, errorMessage, successMessage, loading } = useSelector(state => state.order)

//     useEffect(() => {
//         setStatus(order?.delivery_status)
//     }, [order])

//     useEffect(() => {
//         dispatch(get_seller_order(orderId))
//     }, [orderId, dispatch]);

//     const status_update = (e) => {
//         const newStatus = e.target.value;
//         setStatus(newStatus);
        
//         dispatch(update_order_status({
//             orderId, 
//             delivery_status: newStatus
//         }));
//     }

//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage)
//             dispatch(messageClear())
//         }
//         if (errorMessage) {
//             toast.error(errorMessage)
//             dispatch(messageClear())
//         }
//     }, [successMessage, errorMessage, dispatch])

//     const formatDate = (date) => {
//         if (!date) return '';
//         return moment(date).format('MM/DD/YYYY HH:mm');
//     }

//     const getStatusClass = (status) => {
//         return status === 'delivered' 
//             ? 'bg-green-500' 
//             : status === 'shipping' 
//             ? 'bg-blue-500' 
//             : status === 'pending' 
//             ? 'bg-yellow-500' 
//             : 'bg-red-500'
//     }

//     const getStatusText = (status) => {
//         return status === 'delivered' 
//             ? 'Delivered' 
//             : status === 'shipping' 
//             ? 'Shipping' 
//             : status === 'pending' 
//             ? 'Pending' 
//             : 'Canceled'
//     }

//     if (loading) {
//         return (
//             <div className='px-2 lg:px-7 pt-5'>
//                 <div className='w-full p-4 bg-[#6a5fdf] rounded-md flex justify-center items-center h-[400px]'>
//                     <div className='animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white'></div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//                 <div className='flex justify-between items-center p-4'>
//                     <h2 className='text-xl text-[#d0d2d6]'>Order Details</h2>
//                     <div className='flex items-center gap-3'>
//                         <span className='text-[#d0d2d6]'>Status:</span>
//                         <select 
//                             onChange={status_update} 
//                             value={status || ''} 
//                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#475569] border border-slate-700 rounded-md text-[#d0d2d6]'
//                         >
//                             <option value="pending">Pending</option>
//                             <option value="shipping">Shipping</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="canceled">Canceled</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div className='p-4'>
//                     <div className='flex flex-col gap-2 text-[#d0d2d6]'>
//                         <div className='flex justify-between items-center bg-[#8288ed] p-3 rounded-md'>
//                             <h2 className='text-lg font-semibold'>Order ID: #{order?._id}</h2>
//                             <div className='flex gap-3'>
//                                 <span>Date: {formatDate(order?.createdAt || order?.date)}</span>
//                                 <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order?.delivery_status)}`}>
//                                     {getStatusText(order?.delivery_status)}
//                                 </span>
//                             </div>
//                         </div>
                        
//                         <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
//                             {/* Customer Info */}
//                             <div className='bg-[#8288ed] p-4 rounded-md'>
//                                 <h3 className='text-lg font-semibold mb-3'>Recipient Information</h3>
//                                 {order?.shippingInfo && (
//                                     <div className='flex flex-col gap-1'>
//                                         <p><span className='font-medium'>Name:</span> {order.shippingInfo.fullName}</p>
//                                         <p><span className='font-medium'>Email:</span> {order.shippingInfo.email}</p>
//                                         <p><span className='font-medium'>Phone:</span> {order.shippingInfo.phoneNumber}</p>
//                                         <p><span className='font-medium'>Address:</span> {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.country}</p>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Payment Info */}
//                             <div className='bg-[#8288ed] p-4 rounded-md'>
//                                 <h3 className='text-lg font-semibold mb-3'>Payment Information</h3>
//                                 <div className='flex flex-col gap-1'>
//                                     <p>
//                                         <span className='font-medium'>Payment Status:</span> 
//                                         <span className={`ml-2 px-2 py-1 rounded text-xs ${
//                                             order?.payment_status === 'paid' 
//                                                 ? 'bg-green-500' 
//                                                 : order?.payment_status === 'pending' 
//                                                 ? 'bg-yellow-500' 
//                                                 : 'bg-red-500'
//                                         }`}>
//                                             {order?.payment_status === 'paid' 
//                                                 ? 'Paid' 
//                                                 : order?.payment_status === 'pending' 
//                                                 ? 'Pending' 
//                                                 : 'Failed'
//                                             }
//                                         </span>
//                                     </p>
//                                     <p><span className='font-medium'>Payment Method:</span> {order?.payment_method || 'No information'}</p>
//                                     <p><span className='font-medium'>Total (your products):</span> ${order?.sellerTotal || 0}</p>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         {/* Product List */}
//                         <div className='mt-5 bg-[#8288ed] p-4 rounded-md'>
//                             <h3 className='text-lg font-semibold mb-3'>Products</h3>
                            
//                             {order?.products && order.products.length > 0 ? (
//                                 <div className='overflow-x-auto'>
//                                     <table className='w-full border-collapse'>
//                                         <thead>
//                                             <tr className='border-b border-slate-600'>
//                                                 <th className='text-left py-2 px-2'>Product</th>
//                                                 <th className='text-center py-2 px-2'>Price</th>
//                                                 <th className='text-center py-2 px-2'>Quantity</th>
//                                                 <th className='text-right py-2 px-2'>Subtotal</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {order.products.map((product, index) => (
//                                                 <tr key={index} className='border-b border-slate-700'>
//                                                     <td className='py-3 px-2'>
//                                                         <div className='flex items-center gap-3'>
//                                                             {product.productId?.images && product.productId.images[0] && (
//                                                                 <img 
//                                                                     className='w-[60px] h-[60px] object-cover rounded' 
//                                                                     src={product.productId.images[0]} 
//                                                                     alt={product.productId.name} 
//                                                                 />
//                                                             )}
//                                                             <div>
//                                                                 <h4 className='font-medium'>{product.productId?.name}</h4>
//                                                             </div>
//                                                         </div>
//                                                     </td>
//                                                     <td className='py-3 px-2 text-center'>
//                                                         ${product.productId?.price}
//                                                         {product.productId?.discount > 0 && (
//                                                             <span className='text-sm line-through ml-2'>
//                                                                 ${product.productId.price + product.productId.discount}
//                                                             </span>
//                                                         )}
//                                                     </td>
//                                                     <td className='py-3 px-2 text-center'>{product.quantity}</td>
//                                                     <td className='py-3 px-2 text-right'>${product.subTotal}</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                         <tfoot>
//                                             <tr>
//                                                 <td colSpan="3" className='text-right py-3 px-2 font-semibold'>Total:</td>
//                                                 <td className='text-right py-3 px-2 font-semibold'>${order?.sellerTotal}</td>
//                                             </tr>
//                                         </tfoot>
//                                     </table>
//                                 </div>
//                             ) : (
//                                 <p className='text-center py-4'>No products found</p>
//                             )}
//                         </div>
//                     </div>
//                 </div>   
//             </div> 
//         </div>
//     );
// };

// export default OrderDetails;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { update_order_status, messageClear, get_seller_order } from '../../store/Reducers/OrderReducer';
import toast from 'react-hot-toast';
import moment from 'moment';
import { FaArrowLeft } from 'react-icons/fa';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('');
    const { order, errorMessage, successMessage, loading } = useSelector(state => state.order);

    useEffect(() => {
        setStatus(order?.delivery_status);
    }, [order]);

    useEffect(() => {
        dispatch(get_seller_order(orderId));
    }, [orderId, dispatch]);

    const status_update = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        
        dispatch(update_order_status({
            orderId, 
            delivery_status: newStatus
        }));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const formatDate = (date) => {
        if (!date) return '';
        return moment(date).format('MM/DD/YYYY HH:mm');
    };

    const getStatusClass = (status) => {
        return status === 'delivered' 
            ? 'bg-green-500 text-white' 
            : status === 'shipping' 
            ? 'bg-blue-500 text-white' 
            : status === 'pending' 
            ? 'bg-yellow-500 text-white' 
            : 'bg-red-500 text-white';
    };

    const getStatusText = (status) => {
        return status === 'delivered' 
            ? 'Delivered' 
            : status === 'shipping' 
            ? 'Shipping' 
            : status === 'pending' 
            ? 'Pending' 
            : 'Canceled';
    };

    if (loading) {
        return (
            <div className='px-2 lg:px-7 pt-5'>
                <div className='w-full p-4 bg-white rounded-lg shadow-sm flex justify-center items-center h-[400px]'>
                    <div className='animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600'></div>
                </div>
            </div>
        );
    }

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-lg shadow-sm'>
                <div className='flex justify-between items-center p-4 border-b border-pink-100'>
                    <div className='flex items-center gap-3'>
                        <Link to='/seller/dashboard/orders' className='text-gray-600 hover:text-pink-600 transition-all'>
                            <FaArrowLeft />
                        </Link>
                        <h2 className='text-xl font-semibold text-pink-600'>Order Details</h2>
                    </div>
                    <div className='flex items-center gap-3'>
                        <span className='text-gray-700'>Status:</span>
                        <select 
                            onChange={status_update} 
                            value={status || ''} 
                            className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700 shadow-sm'
                        >
                            <option value="pending">Pending</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
                </div>

                <div className='p-4'>
                    <div className='flex flex-col gap-4 text-gray-700'>
                        <div className='flex justify-between items-center bg-pink-50 p-4 rounded-lg border border-pink-100 shadow-sm'>
                            <h2 className='text-lg font-semibold text-gray-800'>Order ID: <span className='text-pink-600'>#{order?._id}</span></h2>
                            <div className='flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4'>
                                <span className='text-gray-600 text-sm'>Date: {formatDate(order?.createdAt || order?.date)}</span>
                                <span className={`px-3 py-1 rounded-full text-xs ${getStatusClass(order?.delivery_status)}`}>
                                    {getStatusText(order?.delivery_status)}
                                </span>
                            </div>
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-2'>
                            {/* Customer Info */}
                            <div className='bg-white p-5 rounded-lg border border-pink-100 shadow-sm'>
                                <h3 className='text-lg font-semibold mb-3 text-gray-800 border-b border-pink-100 pb-2'>Recipient Information</h3>
                                {order?.shippingInfo && (
                                    <div className='flex flex-col gap-2'>
                                        <p className='flex'>
                                            <span className='font-medium w-20 text-gray-600'>Name:</span> 
                                            <span className='text-gray-800'>{order.shippingInfo.fullName}</span>
                                        </p>
                                        <p className='flex'>
                                            <span className='font-medium w-20 text-gray-600'>Email:</span> 
                                            <span className='text-gray-800'>{order.shippingInfo.email}</span>
                                        </p>
                                        <p className='flex'>
                                            <span className='font-medium w-20 text-gray-600'>Phone:</span> 
                                            <span className='text-gray-800'>{order.shippingInfo.phoneNumber}</span>
                                        </p>
                                        <p className='flex flex-col sm:flex-row'>
                                            <span className='font-medium w-20 text-gray-600'>Address:</span> 
                                            <span className='text-gray-800'>
                                                {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.country}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className='bg-white p-5 rounded-lg border border-pink-100 shadow-sm'>
                                <h3 className='text-lg font-semibold mb-3 text-gray-800 border-b border-pink-100 pb-2'>Payment Information</h3>
                                <div className='flex flex-col gap-2'>
                                    <p className='flex items-center'>
                                        <span className='font-medium w-36 text-gray-600'>Payment Status:</span> 
                                        <span className={`px-3 py-1 rounded-full text-xs ${
                                            order?.payment_status === 'paid' 
                                                ? 'bg-green-500 text-white' 
                                                : order?.payment_status === 'pending' 
                                                ? 'bg-yellow-500 text-white' 
                                                : 'bg-red-500 text-white'
                                        }`}>
                                            {order?.payment_status === 'paid' 
                                                ? 'Paid' 
                                                : order?.payment_status === 'pending' 
                                                ? 'Pending' 
                                                : 'Failed'
                                            }
                                        </span>
                                    </p>
                                    <p className='flex'>
                                        <span className='font-medium w-36 text-gray-600'>Payment Method:</span>
                                        <span className='text-gray-800'>{order?.payment_method || 'No information'}</span>
                                    </p>
                                    <p className='flex'>
                                        <span className='font-medium w-36 text-gray-600'>Total (your products):</span>
                                        <span className='text-pink-600 font-semibold'>${order?.sellerTotal || 0}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Product List */}
                        <div className='mt-5 bg-white p-5 rounded-lg border border-pink-100 shadow-sm'>
                            <h3 className='text-lg font-semibold mb-4 text-gray-800 border-b border-pink-100 pb-2'>Products</h3>
                            
                            {order?.products && order.products.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full border-collapse'>
                                        <thead>
                                            <tr className='bg-pink-50'>
                                                <th className='text-left py-3 px-4 font-semibold text-gray-700 border-b border-pink-100'>Product</th>
                                                <th className='text-center py-3 px-4 font-semibold text-gray-700 border-b border-pink-100'>Price</th>
                                                <th className='text-center py-3 px-4 font-semibold text-gray-700 border-b border-pink-100'>Quantity</th>
                                                <th className='text-right py-3 px-4 font-semibold text-gray-700 border-b border-pink-100'>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.products.map((product, index) => (
                                                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100`}>
                                                    <td className='py-4 px-4'>
                                                        <div className='flex items-center gap-3'>
                                                            {product.productId?.images && product.productId.images[0] ? (
                                                                <img 
                                                                    className='w-[60px] h-[60px] object-cover rounded-md border border-pink-100' 
                                                                    src={product.productId.images[0]} 
                                                                    alt={product.productId.name} 
                                                                />
                                                            ) : (
                                                                <div className='w-[60px] h-[60px] bg-gray-100 rounded-md border border-pink-100 flex items-center justify-center text-gray-400'>
                                                                    No image
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className='font-medium text-gray-800'>{product.productId?.name}</h4>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='py-4 px-4 text-center'>
                                                        <span className='text-pink-600 font-medium'>${product.productId?.price}</span>
                                                        {product.productId?.discount > 0 && (
                                                            <span className='text-sm text-gray-400 line-through ml-2'>
                                                                ${product.productId.price + product.productId.discount}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='py-4 px-4 text-center'>{product.quantity}</td>
                                                    <td className='py-4 px-4 text-right font-medium text-pink-600'>${product.subTotal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className='bg-pink-50'>
                                                <td colSpan="3" className='text-right py-4 px-4 font-semibold text-gray-800'>Total:</td>
                                                <td className='text-right py-4 px-4 font-semibold text-pink-600'>${order?.sellerTotal}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className='text-center py-8 bg-pink-50 rounded-lg border border-pink-100'>
                                    <p className='text-gray-500'>No products found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>   
            </div> 
        </div>
    );
};

export default OrderDetails;