// import React, { useEffect, useState } from 'react';
// import { LuArrowDownSquare } from "react-icons/lu";
// import { Link } from 'react-router-dom';
// import Pagination from '../Pagination';
// import { useDispatch, useSelector } from 'react-redux';
// import { get_admin_orders } from '../../store/Reducers/OrderReducer';
// import moment from 'moment';
// import toast from 'react-hot-toast';

// const Orders = () => {
//     const dispatch = useDispatch()
//     const { myOrders, totalOrder, loading, errorMessage } = useSelector(state => state.order)

//     const [currentPage, setCurrentPage] = useState(1)
//     const [searchValue, setSearchValue] = useState('')
//     const [parPage, setParPage] = useState(5)
//     const [show, setShow] = useState(false)
//     const [orderStatus, setOrderStatus] = useState('')
//     const [paymentStatus, setPaymentStatus] = useState('')
//     const [startDate, setStartDate] = useState('')
//     const [endDate, setEndDate] = useState('')

//     useEffect(() => {
//         const obj = {
//             parPage: parseInt(parPage),
//             page: parseInt(currentPage),
//             searchValue,
//             orderStatus,
//             paymentStatus,
//             startDate,
//             endDate
//         }
//         dispatch(get_admin_orders(obj))
//     }, [searchValue, currentPage, parPage, orderStatus, paymentStatus, startDate, endDate])

//     useEffect(() => {
//         if (errorMessage) {
//             toast.error(errorMessage)
//         }
//     }, [errorMessage])

//     const handleFilterReset = () => {
//         setOrderStatus('')
//         setPaymentStatus('')
//         setStartDate('')
//         setEndDate('')
//     }

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//                 <div className='flex justify-between items-center mb-4'>
//                     <select onChange={(e) => setParPage(parseInt(e.target.value))} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'>
//                         <option value="5">5</option>
//                         <option value="10">10</option>
//                         <option value="20">20</option> 
//                     </select>
//                     <input onChange={e => setSearchValue(e.target.value)} value={searchValue} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' type="text" placeholder='Search' /> 
//                 </div>

//                 {/* Filters */}
//                 <div className='flex flex-wrap gap-2 mb-4'>
//                     <div className='flex flex-col'>
//                         <label className='text-[#d0d2d6] text-sm mb-1'>Order Status</label>
//                         <select 
//                             value={orderStatus} 
//                             onChange={(e) => setOrderStatus(e.target.value)}
//                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'
//                         >
//                             <option value="">All</option>
//                             <option value="pending">Pending</option>
//                             <option value="processing">Processing</option>
//                             <option value="shipping">Shipping</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="canceled">Canceled</option>
//                         </select>
//                     </div>

//                     <div className='flex flex-col'>
//                         <label className='text-[#d0d2d6] text-sm mb-1'>Payment Status</label>
//                         <select 
//                             value={paymentStatus} 
//                             onChange={(e) => setPaymentStatus(e.target.value)}
//                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'
//                         >
//                             <option value="">All</option>
//                             <option value="paid">Paid</option>
//                             <option value="pending">Pending</option>
//                             <option value="failed">Failed</option>
//                         </select>
//                     </div>

//                     <div className='flex flex-col'>
//                         <label className='text-[#d0d2d6] text-sm mb-1'>From Date</label>
//                         <input 
//                             type='date' 
//                             value={startDate} 
//                             onChange={(e) => setStartDate(e.target.value)}
//                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'
//                         />
//                     </div>

//                     <div className='flex flex-col'>
//                         <label className='text-[#d0d2d6] text-sm mb-1'>To Date</label>
//                         <input 
//                             type='date' 
//                             value={endDate} 
//                             onChange={(e) => setEndDate(e.target.value)}
//                             className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'
//                         />
//                     </div>

//                     <div className='flex items-end'>
//                         <button 
//                             onClick={handleFilterReset}
//                             className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200'
//                         >
//                             Reset
//                         </button>
//                     </div>
//                 </div>

//                 {loading ? (
//                     <div className='flex justify-center items-center h-40'>
//                         <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-white'></div>
//                     </div>
//                 ) : (
//                     <div className='relative overflow-x-auto'>
//                         <div className='w-full text-sm text-left [#d0d2d6]'>
//                             <div className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
//                                 <div className='flex justify-between items-center'>
//                                     <div className='py-3 w-[25%] font-bold'>Order ID</div>
//                                     <div className='py-3 w-[13%] font-bold'>Price</div>
//                                     <div className='py-3 w-[18%] font-bold'>Payment Status</div>
//                                     <div className='py-3 w-[18%] font-bold'>Order Status</div>
//                                     <div className='py-3 w-[18%] font-bold'>Date</div>
//                                     <div className='py-3 w-[8%] font-bold'>Action</div>
//                                 </div> 
//                             </div>

//                             {myOrders && myOrders.length > 0 ? (
//                                 myOrders.map((o, i) => (
//                                     <div key={i} className='text-[#d0d2d6]'>
//                                         <div className='flex justify-between items-start border-b border-slate-700'>
//                                             <div className='py-3 w-[25%] font-medium whitespace-nowrap'>#{o._id}</div>
//                                             <div className='py-3 w-[13%] font-medium'>${o.price}</div>
//                                             <div className='py-3 w-[18%] font-medium'>{o.payment_status}</div>
//                                             <div className='py-3 w-[18%] font-medium'>{o.delivery_status}</div>
//                                             <div className='py-3 w-[18%] font-medium'>{moment(o.createdAt).format('DD/MM/YYYY')}</div>
//                                             <div className='py-3 w-[8%] font-medium'>
//                                                 <Link to={`/admin/dashboard/order/details/${o._id}`} className='text-blue-500 hover:underline'>View</Link>
//                                             </div>
//                                         </div>
                                        
//                                         {o.suborder && o.suborder.length > 0 && (
//                                             <div className={show === o._id ? 'block border-b border-slate-700 bg-[#8288ed]' : 'hidden'}>
//                                                 {o.suborder.map((so, j) => (
//                                                     <div key={j} className='flex justify-start items-start border-b border-slate-700'>
//                                                         <div className='py-3 w-[25%] font-medium whitespace-nowrap pl-3'>#{so._id}</div>
//                                                         <div className='py-3 w-[13%] font-medium'>${so.price}</div>
//                                                         <div className='py-3 w-[18%] font-medium'>{so.payment_status}</div>
//                                                         <div className='py-3 w-[18%] font-medium'>{so.delivery_status}</div> 
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className='text-center py-8 text-[#d0d2d6]'>No orders found</div>
//                             )}
//                         </div> 
//                     </div>
//                 )}

//                 {totalOrder > parPage && (
//                     <div className='flex justify-end mt-4 bottom-4 right-4'>
//                         <Pagination
//                             pageNumber={currentPage}
//                             setPageNumber={setCurrentPage}
//                             totalItem={totalOrder}
//                             perPage={parPage}
//                             showItem={3}
//                         />
//                     </div>
//                 )}
//             </div> 
//         </div>
//     );
// };

// export default Orders;
import React, { useEffect, useState } from 'react';
import { LuArrowDownSquare } from "react-icons/lu";
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_orders } from '../../store/Reducers/OrderReducer';
import moment from 'moment';
import toast from 'react-hot-toast';

const Orders = () => {
    const dispatch = useDispatch()
    const { myOrders, totalOrder, loading, errorMessage } = useSelector(state => state.order)

    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)
    const [show, setShow] = useState(false)
    const [orderStatus, setOrderStatus] = useState('')
    const [paymentStatus, setPaymentStatus] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue,
            orderStatus,
            paymentStatus,
            startDate,
            endDate
        }
        dispatch(get_admin_orders(obj))
    }, [searchValue, currentPage, parPage, orderStatus, paymentStatus, startDate, endDate])

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage)
        }
    }, [errorMessage])

    const handleFilterReset = () => {
        setOrderStatus('')
        setPaymentStatus('')
        setStartDate('')
        setEndDate('')
    }

    // Function to display status with colors
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending':
                return <span className="bg-yellow-500 px-2 py-1 rounded text-white text-xs">Pending</span>;
            case 'processing':
                return <span className="bg-blue-500 px-2 py-1 rounded text-white text-xs">Processing</span>;
            case 'shipping':
                return <span className="bg-pink-400 px-2 py-1 rounded text-white text-xs">Shipping</span>;
            case 'delivered':
                return <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">Delivered</span>;
            case 'cancelled':
            case 'canceled':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Cancelled</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white text-xs">{status}</span>;
        }
    };

    // Function to display payment status with colors
    const getPaymentBadge = (status) => {
        switch(status) {
            case 'paid':
                return <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">Paid</span>;
            case 'pending':
                return <span className="bg-yellow-500 px-2 py-1 rounded text-white text-xs">Pending</span>;
            case 'failed':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Failed</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white text-xs">{status}</span>;
        }
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-md shadow-md'>
                <h2 className='text-xl text-pink-600 font-bold mb-4 border-b border-pink-100 pb-2'>Orders Management</h2>
                
                <div className='flex justify-between items-center mb-4'>
                    <select 
                        onChange={(e) => setParPage(parseInt(e.target.value))} 
                        className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                    >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option> 
                    </select>
                    <input 
                        onChange={e => setSearchValue(e.target.value)} 
                        value={searchValue} 
                        className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700 w-64' 
                        type="text" 
                        placeholder='Search orders...' 
                    /> 
                </div>

                {/* Filters */}
                <div className='flex flex-wrap gap-4 mb-6 bg-pink-50 p-4 rounded-lg'>
                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1'>Order Status</label>
                        <select 
                            value={orderStatus} 
                            onChange={(e) => setOrderStatus(e.target.value)}
                            className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1'>Payment Status</label>
                        <select 
                            value={paymentStatus} 
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                        >
                            <option value="">All</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1'>From Date</label>
                        <input 
                            type='date' 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-gray-700 text-sm mb-1'>To Date</label>
                        <input 
                            type='date' 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                        />
                    </div>

                    <div className='flex items-end'>
                        <button 
                            onClick={handleFilterReset}
                            className='px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition duration-200'
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className='flex justify-center items-center h-40'>
                        <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-pink-500'></div>
                    </div>
                ) : (
                    <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
                        <table className='w-full text-sm text-left text-gray-700'>
                            <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                                <tr>
                                    <th scope="col" className='px-6 py-3 w-[25%]'>Order ID</th>
                                    <th scope="col" className='px-6 py-3 w-[13%]'>Price</th>
                                    <th scope="col" className='px-6 py-3 w-[18%]'>Payment Status</th>
                                    <th scope="col" className='px-6 py-3 w-[18%]'>Order Status</th>
                                    <th scope="col" className='px-6 py-3 w-[18%]'>Date</th>
                                    <th scope="col" className='px-6 py-3 w-[8%]'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders && myOrders.length > 0 ? (
                                    myOrders.map((o, i) => (
                                        <React.Fragment key={i}>
                                            <tr className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                                                <td className='px-6 py-4 font-medium whitespace-nowrap'>#{o._id}</td>
                                                <td className='px-6 py-4 font-medium'>${o.price}</td>
                                                <td className='px-6 py-4'>{getPaymentBadge(o.payment_status)}</td>
                                                <td className='px-6 py-4'>{getStatusBadge(o.delivery_status)}</td>
                                                <td className='px-6 py-4'>{moment(o.createdAt).format('DD/MM/YYYY')}</td>
                                                <td className='px-6 py-4'>
                                                    <Link to={`/admin/dashboard/order/details/${o._id}`} className='text-pink-600 hover:underline'>View</Link>
                                                </td>
                                            </tr>
                                            
                                            {o.suborder && o.suborder.length > 0 && (
                                                <tr className={show === o._id ? 'block bg-pink-100' : 'hidden'}>
                                                    <td colSpan="6" className="px-6 py-2">
                                                        <div className="border-l-4 border-pink-500 pl-2">
                                                            {o.suborder.map((so, j) => (
                                                                <div key={j} className='flex justify-start items-start border-b border-pink-200 py-2'>
                                                                    <div className='w-[25%] font-medium whitespace-nowrap'>#{so._id}</div>
                                                                    <div className='w-[13%] font-medium'>${so.price}</div>
                                                                    <div className='w-[18%]'>{getPaymentBadge(so.payment_status)}</div>
                                                                    <div className='w-[18%]'>{getStatusBadge(so.delivery_status)}</div> 
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr className="bg-white border-b border-pink-100">
                                        <td colSpan="6" className="px-6 py-8 text-center">No orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalOrder > parPage && (
                    <div className='flex justify-end mt-4'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalOrder}
                            perPage={parPage}
                            showItem={3}
                        />
                    </div>
                )}
            </div> 
        </div>
    );
};

export default Orders;