// import React, { useEffect, useState } from 'react'; 
// import Search from '../components/Search';
// import { Link } from 'react-router-dom';
// import Pagination from '../Pagination'; 
// import { FaEye } from 'react-icons/fa'; 
// import { useDispatch, useSelector } from 'react-redux';
// import { manage_seller_orders, update_order_status, messageClear } from '../../store/Reducers/OrderReducer';
// import moment from 'moment';
// import toast from 'react-hot-toast';

// const Orders = () => {
//     const dispatch = useDispatch()
//     const { myOrders, totalOrder, loading, successMessage, errorMessage } = useSelector(state => state.order)

//     const [currentPage, setCurrentPage] = useState(1)
//     const [searchValue, setSearchValue] = useState('')
//     const [parPage, setParPage] = useState(5)
//     const [deliveryStatus, setDeliveryStatus] = useState('')
//     const [paymentStatus, setPaymentStatus] = useState('')
//     const [startDate, setStartDate] = useState('')
//     const [endDate, setEndDate] = useState('')
//     const [editOrderId, setEditOrderId] = useState(null)
//     const [updatingStatus, setUpdatingStatus] = useState(false)

//     useEffect(() => {
//         const obj = {
//             parPage: parseInt(parPage),
//             page: parseInt(currentPage),
//             searchValue,
//             delivery_status: deliveryStatus,
//             payment_status: paymentStatus,
//             startDate: startDate ? formatDateForServer(startDate) : '',
//             endDate: endDate ? formatDateForServer(endDate) : ''
//         }
//         dispatch(manage_seller_orders(obj))
//     }, [searchValue, currentPage, parPage, deliveryStatus, paymentStatus, startDate, endDate])

//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage)
//             dispatch(messageClear())
//         }
//         if (errorMessage) {
//             toast.error(errorMessage)
//             dispatch(messageClear())
//         }
//     }, [successMessage, errorMessage])

//     const handleFilterReset = () => {
//         setDeliveryStatus('')
//         setPaymentStatus('')
//         setStartDate('')
//         setEndDate('')
//     }

//     const handleStatusEdit = (orderId) => {
//         setEditOrderId(orderId)
//     }

//     const handleStatusChange = (orderId, newStatus) => {
//         if (updatingStatus) return
//         setUpdatingStatus(true)
        
//         dispatch(update_order_status({
//             orderId,
//             delivery_status: newStatus
//         })).then(() => {
//             setEditOrderId(null)
//             setUpdatingStatus(false)
//         }).catch(() => {
//             setUpdatingStatus(false)
//         })
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

//     const StatusSelector = ({ order }) => {
//         if (editOrderId === order._id) {
//             return (
//                 <div className="flex flex-col gap-2">
//                     <select 
//                         className="px-2 py-1 bg-slate-800 text-white rounded border border-slate-600 text-xs"
//                         defaultValue={order.delivery_status}
//                         onChange={(e) => handleStatusChange(order._id, e.target.value)}
//                         disabled={updatingStatus}
//                     >
//                         <option value="pending">Pending</option>
//                         <option value="shipping">Shipping</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="canceled">Canceled</option>
//                     </select>
//                     <button 
//                         className="px-2 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600"
//                         onClick={() => setEditOrderId(null)}
//                         disabled={updatingStatus}
//                     >
//                         Cancel
//                     </button>
//                 </div>
//             )
//         }
        
//         return (
//             <div className="flex items-center gap-2">
//                 <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order.delivery_status)}`}>
//                     {getStatusText(order.delivery_status)}
//                 </span>
//                 <button 
//                     className="px-2 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600"
//                     onClick={() => handleStatusEdit(order._id)}
//                 >
//                     Edit
//                 </button>
//             </div>
//         )
//     }

//     // Chuyển đổi định dạng ngày từ input date (YYYY-MM-DD) sang định dạng phù hợp với server
//     const formatDateForServer = (dateString) => {
//         // Đảm bảo định dạng ngày đúng, nếu cần thiết có thể format lại ở đây
//         return dateString; // Giữ nguyên định dạng YYYY-MM-DD vì backend đã xử lý được
//     }

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <h1 className='text-[#000000] font-semibold text-lg mb-3'>Orders</h1>

//          <div className='w-full p-4 bg-[#6a5fdf] rounded-md'> 
//             <Search setParPage={setParPage} setSearchValue={setSearchValue} searchValue={searchValue} />

//             {/* Bộ lọc đơn hàng */}
//             <div className='flex flex-wrap gap-2 mb-4 mt-4'>
//                 <div className='flex flex-col'>
//                     <label className='text-[#d0d2d6] text-sm mb-1'>Order Status</label>
//                     <select 
//                         value={deliveryStatus} 
//                         onChange={(e) => setDeliveryStatus(e.target.value)}
//                         className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
//                     >
//                         <option value="">All</option>
//                         <option value="pending">Pending</option>
//                         <option value="shipping">Shipping</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="canceled">Canceled</option>
//                     </select>
//                 </div>

//                 <div className='flex flex-col'>
//                     <label className='text-[#d0d2d6] text-sm mb-1'>Payment Status</label>
//                     <select 
//                         value={paymentStatus} 
//                         onChange={(e) => setPaymentStatus(e.target.value)}
//                         className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
//                     >
//                         <option value="">All</option>
//                         <option value="paid">Paid</option>
//                         <option value="pending">Pending</option>
//                         <option value="failed">Failed</option>
//                     </select>
//                 </div>

//                 <div className='flex flex-col'>
//                     <label className='text-[#d0d2d6] text-sm mb-1'>From Date</label>
//                     <input 
//                         type='date' 
//                         value={startDate} 
//                         onChange={(e) => setStartDate(e.target.value)}
//                         className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
//                     />
//                 </div>

//                 <div className='flex flex-col'>
//                     <label className='text-[#d0d2d6] text-sm mb-1'>To Date</label>
//                     <input 
//                         type='date' 
//                         value={endDate} 
//                         onChange={(e) => setEndDate(e.target.value)}
//                         className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
//                     />
//                 </div>

//                 <div className='flex items-end'>
//                     <button 
//                         onClick={handleFilterReset}
//                         className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200'
//                     >
//                         Reset
//                     </button>
//                 </div>
//             </div>

//             {loading ? (
//                 <div className='flex justify-center items-center h-40'>
//                     <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-white'></div>
//                 </div>
//             ) : (
//                 <div className='relative overflow-x-auto mt-5'>
//                     <table className='w-full text-sm text-left text-[#d0d2d6]'>
//                         <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
//                         <tr>
//                             <th scope='col' className='py-3 px-4'>Order ID</th>
//                             <th scope='col' className='py-3 px-4'>Total Price</th>
//                             <th scope='col' className='py-3 px-4'>Payment</th>
//                             <th scope='col' className='py-3 px-4'>Status</th> 
//                             <th scope='col' className='py-3 px-4'>Date</th>
//                             <th scope='col' className='py-3 px-4'>Action</th> 
//                         </tr>
//                         </thead>

//                         <tbody>
//                             {myOrders && myOrders.length > 0 ? (
//                                 myOrders.map((d, i) => (
//                                     <tr key={i}>
//                                         <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>#{d._id}</td>
//                                         <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>${d.totalPrice}</td>
//                                         <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
//                                             <span className={`px-2 py-1 rounded text-xs ${
//                                                 d.payment_status === 'paid' 
//                                                     ? 'bg-green-500' 
//                                                     : d.payment_status === 'pending' 
//                                                     ? 'bg-yellow-500' 
//                                                     : 'bg-red-500'
//                                             }`}>
//                                                 {d.payment_status === 'paid' 
//                                                     ? 'Đã thanh toán' 
//                                                     : d.payment_status === 'pending' 
//                                                     ? 'Chờ thanh toán' 
//                                                     : 'Thất bại'
//                                                 }
//                                             </span>
//                                         </td>
//                                         <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
//                                             <StatusSelector order={d} />
//                                         </td>
//                                         <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{moment(d.createdAt).format('DD/MM/YYYY')}</td> 
//                                         <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
//                                             <div className='flex justify-start items-center gap-4'>
//                                                 <Link to={`/seller/dashboard/order/details/${d._id}`} className='p-[6px] bg-green-500 rounded-md hover:shadow-lg hover:shadow-green-500/50'>
//                                                     <FaEye className='text-white' />
//                                                 </Link>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="6" className='py-4 text-center'>No orders found</td>
//                                 </tr>
//                             )}
//                         </tbody> 
//                     </table>
//                 </div>
//             )}

//             {totalOrder > parPage && (
//                 <div className='w-full flex justify-end mt-4 bottom-4 right-4'>
//                     <Pagination 
//                         pageNumber={currentPage}
//                         setPageNumber={setCurrentPage}
//                         totalItem={totalOrder}
//                         parPage={parPage}
//                         showItem={3}
//                     />
//                 </div>
//             )}
//          </div>
//         </div>
//     );
// };

// export default Orders;
import React, { useEffect, useState } from 'react'; 
import Search from '../components/Search';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination'; 
import { FaEye } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux';
import { manage_seller_orders, update_order_status, messageClear } from '../../store/Reducers/OrderReducer';
import moment from 'moment';
import toast from 'react-hot-toast';

const Orders = () => {
    const dispatch = useDispatch();
    const { myOrders, totalOrder, loading, successMessage, errorMessage } = useSelector(state => state.order);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(5);
    const [deliveryStatus, setDeliveryStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editOrderId, setEditOrderId] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue,
            delivery_status: deliveryStatus,
            payment_status: paymentStatus,
            startDate: startDate ? formatDateForServer(startDate) : '',
            endDate: endDate ? formatDateForServer(endDate) : ''
        };
        dispatch(manage_seller_orders(obj));
    }, [searchValue, currentPage, parPage, deliveryStatus, paymentStatus, startDate, endDate, dispatch]);

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

    const handleFilterReset = () => {
        setDeliveryStatus('');
        setPaymentStatus('');
        setStartDate('');
        setEndDate('');
    };

    const handleStatusEdit = (orderId) => {
        setEditOrderId(orderId);
    };

    const handleStatusChange = (orderId, newStatus) => {
        if (updatingStatus) return;
        setUpdatingStatus(true);
        
        dispatch(update_order_status({
            orderId,
            delivery_status: newStatus
        })).then(() => {
            setEditOrderId(null);
            setUpdatingStatus(false);
        }).catch(() => {
            setUpdatingStatus(false);
        });
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

    const StatusSelector = ({ order }) => {
        if (editOrderId === order._id) {
            return (
                <div className="flex flex-col gap-2">
                    <select 
                        className="px-2 py-1 bg-white border border-pink-200 rounded text-gray-700 text-sm focus:border-pink-500 outline-none transition-all"
                        defaultValue={order.delivery_status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingStatus}
                    >
                        <option value="pending">Pending</option>
                        <option value="shipping">Shipping</option>
                        <option value="delivered">Delivered</option>
                        <option value="canceled">Canceled</option>
                    </select>
                    <button 
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-all"
                        onClick={() => setEditOrderId(null)}
                        disabled={updatingStatus}
                    >
                        Cancel
                    </button>
                </div>
            );
        }
        
        return (
            <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order.delivery_status)}`}>
                    {getStatusText(order.delivery_status)}
                </span>
                <button 
                    className="px-2 py-1 bg-pink-100 text-pink-600 rounded text-xs hover:bg-pink-200 transition-all"
                    onClick={() => handleStatusEdit(order._id)}
                >
                    Edit
                </button>
            </div>
        );
    };

    // Chuyển đổi định dạng ngày từ input date (YYYY-MM-DD) sang định dạng phù hợp với server
    const formatDateForServer = (dateString) => {
        // Đảm bảo định dạng ngày đúng, nếu cần thiết có thể format lại ở đây
        return dateString; // Giữ nguyên định dạng YYYY-MM-DD vì backend đã xử lý được
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-lg shadow-sm'>
                <div className='flex justify-between items-center pb-4 mb-4 border-b border-pink-100'>
                    <h1 className='text-xl font-semibold text-pink-600'>Orders Management</h1>
                    <div className='flex items-center gap-2'>
                        <select
                            value={parPage}
                            onChange={(e) => setParPage(Number(e.target.value))}
                            className='px-3 py-1 bg-white border border-pink-200 rounded text-gray-700 text-sm focus:border-pink-500 outline-none'
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={15}>15 per page</option>
                            <option value={25}>25 per page</option>
                        </select>
                        <div className='relative'>
                            <input 
                                type="text" 
                                placeholder='Search orders...' 
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && dispatch(manage_seller_orders({
                                    page: 1,
                                    searchValue,
                                    parPage,
                                    delivery_status: deliveryStatus,
                                    payment_status: paymentStatus,
                                    startDate: startDate ? formatDateForServer(startDate) : '',
                                    endDate: endDate ? formatDateForServer(endDate) : ''
                                }))}
                                className='w-[200px] px-4 py-1 bg-white border border-pink-200 rounded text-gray-700 text-sm focus:border-pink-500 outline-none'
                            />
                        </div>
                    </div>
                </div>

                {/* Bộ lọc đơn hàng */}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 bg-pink-50 p-4 rounded-lg'>
                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1 font-medium'>Order Status</label>
                        <select 
                            value={deliveryStatus} 
                            onChange={(e) => setDeliveryStatus(e.target.value)}
                            className='px-3 py-2 bg-white border border-pink-200 rounded text-gray-700 text-sm focus:border-pink-500 outline-none'
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1 font-medium'>Payment Status</label>
                        <select 
                            value={paymentStatus} 
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className='px-3 py-2 bg-white border border-pink-200 rounded text-gray-700 text-sm focus:border-pink-500 outline-none'
                        >
                            <option value="">All</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1 font-medium'>From Date</label>
                        <input 
                            type='date' 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className='px-3 py-2 bg-white border border-pink-200 rounded text-gray-700 text-sm focus:border-pink-500 outline-none'
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1 font-medium'>To Date</label>
                        <input 
                            type='date' 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className='px-3 py-2 bg-white border border-pink-200 rounded text-gray-700 text-sm focus:border-pink-500 outline-none'
                        />
                    </div>

                    <div className='flex items-end'>
                        <button 
                            onClick={handleFilterReset}
                            className='w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition duration-200 shadow-sm'
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className='flex justify-center items-center h-40'>
                        <div className='animate-spin rounded-full h-10 w-10 border-4 border-pink-300 border-t-pink-600'></div>
                    </div>
                ) : (
                    <div className='relative overflow-x-auto shadow-sm sm:rounded-lg'>
                        <table className='w-full text-sm text-left text-gray-700'>
                            <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                                <tr>
                                    <th scope='col' className='py-3 px-4'>Order ID</th>
                                    <th scope='col' className='py-3 px-4'>Total Price</th>
                                    <th scope='col' className='py-3 px-4'>Payment</th>
                                    <th scope='col' className='py-3 px-4'>Status</th> 
                                    <th scope='col' className='py-3 px-4'>Date</th>
                                    <th scope='col' className='py-3 px-4'>Action</th> 
                                </tr>
                            </thead>

                            <tbody>
                                {myOrders && myOrders.length > 0 ? (
                                    myOrders.map((d, i) => (
                                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100 transition-all`}>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>#{d._id}</td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap text-pink-600'>${d.totalPrice}</td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    d.payment_status === 'paid' 
                                                        ? 'bg-green-500 text-white' 
                                                        : d.payment_status === 'pending' 
                                                        ? 'bg-yellow-500 text-white' 
                                                        : 'bg-red-500 text-white'
                                                }`}>
                                                    {d.payment_status === 'paid' 
                                                        ? 'Paid' 
                                                        : d.payment_status === 'pending' 
                                                        ? 'Pending' 
                                                        : 'Failed'
                                                    }
                                                </span>
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                <StatusSelector order={d} />
                                            </td>
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{moment(d.createdAt).format('DD/MM/YYYY')}</td> 
                                            <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                <div className='flex justify-start items-center gap-4'>
                                                    <Link 
                                                        to={`/seller/dashboard/order/details/${d._id}`} 
                                                        className='p-2 bg-pink-500 rounded-md hover:bg-pink-600 text-white transition-all shadow-sm'
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className='py-4 text-center text-gray-500'>No orders found</td>
                                    </tr>
                                )}
                            </tbody> 
                        </table>
                    </div>
                )}

                {totalOrder > parPage && (
                    <div className='w-full flex justify-end mt-4'>
                        <Pagination 
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalOrder}
                            parPage={parPage}
                            showItem={3}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;