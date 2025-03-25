// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom';
// import { admin_order_status_update, get_admin_order, messageClear } from '../../store/Reducers/OrderReducer';
// import toast from 'react-hot-toast';
// import moment from 'moment';

// const OrderDetails = () => {
//     const { orderId } = useParams() 
//     const dispatch = useDispatch() 
//     const [status, setStatus] = useState('')
//     const { order, errorMessage, successMessage, loading } = useSelector(state => state.order)
     
//     useEffect(() => {
//         setStatus(order?.delivery_status)
//     },[order])

//     useEffect(() => {
//         dispatch(get_admin_order(orderId))
//     },[orderId, dispatch])

//     const status_update = (e) => {
//         const newStatus = e.target.value;
//         if (newStatus !== status) {
//             dispatch(admin_order_status_update({orderId, info: {status: newStatus} }))
//             setStatus(newStatus)
//         }
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
//     },[successMessage, errorMessage, dispatch])

//     if (!order || Object.keys(order).length === 0) {
//         return (
//             <div className='px-2 lg:px-7 pt-5'>
//                 <div className='w-full p-4 bg-[#6a5fdf] rounded-md text-[#d0d2d6] flex justify-center'>
//                     <p>No order found</p>
//                 </div>
//             </div>
//         )
//     }

//     // Function to display status with colors
//     const getStatusBadge = (status) => {
//         switch(status) {
//             case 'pending':
//                 return <span className="bg-yellow-500 px-2 py-1 rounded text-white">Pending</span>;
//             case 'shipping':
//                 return <span className="bg-indigo-500 px-2 py-1 rounded text-white">Shipping</span>;
//             case 'delivered':
//                 return <span className="bg-green-500 px-2 py-1 rounded text-white">Delivered</span>;
//             case 'cancelled':
//                 return <span className="bg-red-500 px-2 py-1 rounded text-white">Cancelled</span>;
//             default:
//                 return <span className="bg-gray-500 px-2 py-1 rounded text-white">{status}</span>;
//         }
//     };

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//                 <div className='flex justify-between items-center p-4'>
//                     <h2 className='text-xl text-[#d0d2d6]'>Order Details</h2>
//                     <div className='flex items-center gap-3'>
//                         <span className='text-[#d0d2d6]'>Status: {getStatusBadge(order.delivery_status)}</span>
//                         <select 
//                             onChange={status_update} 
//                             value={status} 
//                             disabled={loading}
//                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#475569] border border-slate-700 rounded-md text-[#d0d2d6]'
//                         >
//                             <option value="pending">Pending</option>
//                             <option value="shipping">Shipping</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="canceled">Canceled</option>
//                         </select>
//                         {loading && <span className='text-sm text-yellow-300'>Updating...</span>}
//                     </div>
//                 </div>

//                 <div className='p-4'>
//                     <div className='flex flex-wrap gap-2 text-lg text-[#d0d2d6] mb-6'>
//                         <div className='flex items-center gap-2'>
//                             <h2 className='font-semibold'>Order ID:</h2>
//                             <span>#{order._id}</span>
//                         </div>
//                         <div className='flex items-center gap-2'>
//                             <h2 className='font-semibold'>Date:</h2>
//                             <span>{moment(order.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</span>
//                         </div>
//                         <div className='flex items-center gap-2 ml-auto'>
//                             <h2 className='font-semibold'>Total Amount:</h2>
//                             <span className='text-green-500 font-bold'>${order.totalPrice}</span>
//                         </div>
//                     </div>
                    
//                     <div className='flex flex-wrap'>
//                         <div className='w-full md:w-[30%]'>
//                             <div className='pr-3 text-[#d0d2d6]'>
//                                 <h2 className='pb-2 font-semibold text-lg border-b'>Customer Information</h2>
//                                 <div className='flex flex-col gap-1 mt-4'>
//                                     <div className='flex gap-2'>
//                                         <span className='font-semibold'>Name:</span>
//                                         <span>{order.userId?.name || order.shippingInfo?.fullName}</span>
//                                     </div>
//                                     <div className='flex gap-2'>
//                                         <span className='font-semibold'>Email:</span>
//                                         <span>{order.userId?.email || order.shippingInfo?.email}</span>
//                                     </div>
//                                     <div className='flex gap-2'>
//                                         <span className='font-semibold'>Phone:</span>
//                                         <span>{order.shippingInfo?.phoneNumber}</span>
//                                     </div>
//                                 </div>
                                
//                                 <h2 className='pb-2 font-semibold text-lg border-b mt-6'>Shipping Address</h2>
//                                 <div className='flex flex-col gap-1 mt-4'>
//                                     <p>{order.shippingInfo?.address}</p>
//                                     <p>{order.shippingInfo?.city}, {order.shippingInfo?.country}</p>
//                                 </div>
                                
//                                 <h2 className='pb-2 font-semibold text-lg border-b mt-6'>Payment Information</h2>
//                                 <div className='flex flex-col gap-1 mt-4'>
//                                     <div className='flex gap-2'>
//                                         <span className='font-semibold'>Status:</span>
//                                         <span className={`${order.payment_status === 'paid' ? 'text-green-500' : order.payment_status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
//                                             {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div> 

//                         <div className='w-full md:w-[70%] mt-4 md:mt-0'>
//                             <div className='pl-0 md:pl-3'>
//                                 <h2 className='pb-2 font-semibold text-lg border-b text-[#d0d2d6]'>Order Items</h2>
//                                 <div className='mt-4 flex flex-col gap-3'>
//                                     {order.products && order.products.map((p, i) => (
//                                         <div key={i} className='flex bg-[#8288ed] rounded-md p-3'>
//                                             <div className='w-[80px] h-[80px]'>
//                                                 <img 
//                                                     className='w-full h-full object-cover rounded' 
//                                                     src={p.productInfo?.images?.[0] || 'https://via.placeholder.com/80'}
//                                                     alt="" 
//                                                 />
//                                             </div>
//                                             <div className='flex-grow pl-3 text-[#d0d2d6]'>
//                                                 <h2 className='text-lg font-medium'>{p.productInfo?.name}</h2>
//                                                 <div className='flex flex-wrap gap-4 mt-1'>
//                                                     <p>
//                                                         <span className='font-semibold'>Price:</span> ${p.productInfo?.price}
//                                                     </p>
//                                                     <p>
//                                                         <span className='font-semibold'>Quantity:</span> {p.quantity}
//                                                     </p>
//                                                     <p>
//                                                         <span className='font-semibold'>Subtotal:</span> ${p.subTotal}
//                                                     </p>
//                                                 </div>
//                                                 {p.productInfo?.sellerId && (
//                                                     <div className='mt-2'>
//                                                         <span className='font-semibold'>Seller:</span> {p.productInfo.sellerId.shopInfo?.shopName || p.productInfo.sellerId.name}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
                                
//                                 <div className='mt-4 flex flex-col gap-3 text-[#d0d2d6]'>
//                                     <div className='flex justify-between px-3'>
//                                         <span>Subtotal:</span>
//                                         <span>${order.totalPrice - (order.shippingCost || 0)}</span>
//                                     </div>
//                                     <div className='flex justify-between px-3'>
//                                         <span>Shipping Cost:</span>
//                                         <span>${order.shippingCost || 0}</span>
//                                     </div>
//                                     <div className='flex justify-between px-3 border-t pt-2'>
//                                         <span className='font-bold'>Total:</span>
//                                         <span className='font-bold'>${order.totalPrice}</span>
//                                     </div>
//                                 </div>
//                             </div>
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
import { useParams } from 'react-router-dom';
import { admin_order_status_update, get_admin_order, messageClear } from '../../store/Reducers/OrderReducer';
import toast from 'react-hot-toast';
import moment from 'moment';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('');
    const { order, errorMessage, successMessage, loading } = useSelector(state => state.order);
     
    useEffect(() => {
        setStatus(order?.delivery_status);
    }, [order]);

    useEffect(() => {
        dispatch(get_admin_order(orderId));
    }, [orderId, dispatch]);

    const status_update = (e) => {
        const newStatus = e.target.value;
        if (newStatus !== status) {
            dispatch(admin_order_status_update({orderId, info: {status: newStatus} }));
            setStatus(newStatus);
        }
    }

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

    if (!order || Object.keys(order).length === 0) {
        return (
            <div className='px-2 lg:px-7 pt-5'>
                <div className='w-full p-4 bg-white rounded-md shadow-md text-gray-700 flex justify-center'>
                    <p>No order found</p>
                </div>
            </div>
        )
    }

    // Function to display status with colors
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending':
                return <span className="bg-yellow-500 px-2 py-1 rounded text-white">Pending</span>;
            case 'shipping':
                return <span className="bg-pink-400 px-2 py-1 rounded text-white">Shipping</span>;
            case 'delivered':
                return <span className="bg-green-500 px-2 py-1 rounded text-white">Delivered</span>;
            case 'cancelled':
            case 'canceled':
                return <span className="bg-red-500 px-2 py-1 rounded text-white">Cancelled</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white">{status}</span>;
        }
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-md shadow-md'>
                <div className='flex justify-between items-center p-4 border-b border-pink-100'>
                    <h2 className='text-xl text-pink-600 font-bold'>Order Details</h2>
                    <div className='flex items-center gap-3'>
                        <span className='text-gray-700'>Status: {getStatusBadge(order.delivery_status)}</span>
                        <select 
                            onChange={status_update} 
                            value={status} 
                            disabled={loading}
                            className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                        >
                            <option value="pending">Pending</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="canceled">Canceled</option>
                        </select>
                        {loading && <span className='text-sm text-pink-500'>Updating...</span>}
                    </div>
                </div>

                <div className='p-4'>
                    <div className='flex flex-wrap gap-2 text-lg text-gray-700 mb-6 bg-pink-50 p-4 rounded-lg'>
                        <div className='flex items-center gap-2'>
                            <h2 className='font-semibold'>Order ID:</h2>
                            <span>#{order._id}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <h2 className='font-semibold'>Date:</h2>
                            <span>{moment(order.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</span>
                        </div>
                        <div className='flex items-center gap-2 ml-auto'>
                            <h2 className='font-semibold'>Total Amount:</h2>
                            <span className='text-pink-600 font-bold'>${order.totalPrice}</span>
                        </div>
                    </div>
                    
                    <div className='flex flex-wrap'>
                        <div className='w-full md:w-[30%]'>
                            <div className='pr-3 text-gray-700'>
                                <h2 className='pb-2 font-semibold text-lg border-b border-pink-200 text-pink-600'>Customer Information</h2>
                                <div className='flex flex-col gap-1 mt-4'>
                                    <div className='flex gap-2'>
                                        <span className='font-semibold'>Name:</span>
                                        <span>{order.userId?.name || order.shippingInfo?.fullName}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span className='font-semibold'>Email:</span>
                                        <span>{order.userId?.email || order.shippingInfo?.email}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span className='font-semibold'>Phone:</span>
                                        <span>{order.shippingInfo?.phoneNumber}</span>
                                    </div>
                                </div>
                                
                                <h2 className='pb-2 font-semibold text-lg border-b border-pink-200 mt-6 text-pink-600'>Shipping Address</h2>
                                <div className='flex flex-col gap-1 mt-4'>
                                    <p>{order.shippingInfo?.address}</p>
                                    <p>{order.shippingInfo?.city}, {order.shippingInfo?.country}</p>
                                </div>
                                
                                <h2 className='pb-2 font-semibold text-lg border-b border-pink-200 mt-6 text-pink-600'>Payment Information</h2>
                                <div className='flex flex-col gap-1 mt-4'>
                                    <div className='flex gap-2'>
                                        <span className='font-semibold'>Status:</span>
                                        <span className={`${order.payment_status === 'paid' ? 'text-green-500' : order.payment_status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div> 

                        <div className='w-full md:w-[70%] mt-4 md:mt-0'>
                            <div className='pl-0 md:pl-3'>
                                <h2 className='pb-2 font-semibold text-lg border-b border-pink-200 text-pink-600'>Order Items</h2>
                                <div className='mt-4 flex flex-col gap-3'>
                                    {order.products && order.products.map((p, i) => (
                                        <div key={i} className='flex bg-white rounded-md p-3 border border-pink-100 shadow-sm'>
                                            <div className='w-[80px] h-[80px]'>
                                                <img 
                                                    className='w-full h-full object-cover rounded' 
                                                    src={p.productInfo?.images?.[0] || 'https://via.placeholder.com/80'}
                                                    alt="" 
                                                />
                                            </div>
                                            <div className='flex-grow pl-3 text-gray-700'>
                                                <h2 className='text-lg font-medium text-pink-600'>{p.productInfo?.name}</h2>
                                                <div className='flex flex-wrap gap-4 mt-1'>
                                                    <p>
                                                        <span className='font-semibold'>Price:</span> ${p.productInfo?.price}
                                                    </p>
                                                    <p>
                                                        <span className='font-semibold'>Quantity:</span> {p.quantity}
                                                    </p>
                                                    <p>
                                                        <span className='font-semibold'>Subtotal:</span> ${p.subTotal}
                                                    </p>
                                                </div>
                                                {p.productInfo?.sellerId && (
                                                    <div className='mt-2'>
                                                        <span className='font-semibold'>Seller:</span> {p.productInfo.sellerId.shopInfo?.shopName || p.productInfo.sellerId.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className='mt-4 flex flex-col gap-3 text-gray-700 bg-pink-50 p-4 rounded-lg'>
                                    <div className='flex justify-between px-3'>
                                        <span>Subtotal:</span>
                                        <span>${order.totalPrice - (order.shippingCost || 0)}</span>
                                    </div>
                                    <div className='flex justify-between px-3'>
                                        <span>Shipping Cost:</span>
                                        <span>${order.shippingCost || 0}</span>
                                    </div>
                                    <div className='flex justify-between px-3 border-t border-pink-200 pt-2'>
                                        <span className='font-bold'>Total:</span>
                                        <span className='font-bold text-pink-600'>${order.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;