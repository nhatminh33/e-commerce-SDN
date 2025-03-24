// import React, { useEffect } from 'react';
// import { MdCurrencyExchange,MdProductionQuantityLimits } from "react-icons/md";
// import { FaUsers } from "react-icons/fa";
// import { FaCartShopping } from "react-icons/fa6"; 
// import Chart from 'react-apexcharts'
// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import seller from '../../assets/seller.png'
// import { get_admin_dashboard_data, get_admin_chart_data } from '../../store/Reducers/dashboardReducer';
// import moment from 'moment';

// const AdminDashboard = () => {

//     const dispatch = useDispatch()
//     const {totalSale = 0, totalOrder = 0, totalProduct = 0, totalSeller = 0, recentOrder = [], recentMessage = [], chartData = {}} = useSelector(state=> state.dashboard)
//     const {userInfo} = useSelector(state=> state.auth)

//     useEffect(() => {
//         dispatch(get_admin_dashboard_data())
//         dispatch(get_admin_chart_data())
//     }, [dispatch])

//     const state = {
//         series : [
//             {
//                 name : "Orders",
//                 data : chartData?.orders || [0,0,0,0,0,0,0,0,0,0,0,0]
//             },
//             {
//                 name : "Revenue",
//                 data : chartData?.revenue || [0,0,0,0,0,0,0,0,0,0,0,0]
//             },
//             {
//                 name : "Sellers",
//                 data : chartData?.sellers || [0,0,0,0,0,0,0,0,0,0,0,0]
//             },
//         ],
//         options : {
//             color : ['#181ee8','#181ee8'],
//             plotOptions: {
//                 radius : 30
//             },
//             chart : {
//                 background : 'transparent',
//                 foreColor : '#d0d2d6'
//             },
//             dataLabels : {
//                 enabled : false
//             },
//             strock : {
//                 show : true,
//                 curve : ['smooth','straight','stepline'],
//                 lineCap : 'butt',
//                 colors : '#f0f0f0',
//                 width  : .5,
//                 dashArray : 0
//             },
//             xaxis : {
//                 categories : chartData?.labels || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
//             },
//             legend : {
//                 position : 'top'
//             },
//             responsive : [
//                 {
//                     breakpoint : 565,
//                     yaxis : {
//                         categories : chartData?.labels || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
//                     },
//                     options : {
//                         plotOptions: {
//                             bar : {
//                                 horizontal : true
//                             }
//                         },
//                         chart : {
//                             height : "550px"
//                         }
//                     }
//                 }
//             ]
//         }
//     }

//     return (
//         <div className='px-2 md:px-7 py-5'>


//             <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-7'>
                
//                 <div className='flex justify-between items-center p-5 bg-[#fae8e8] rounded-md gap-3'>
//                     <div className='flex flex-col justify-start items-start text-[#5c5a5a]'>
//                         <h2 className='text-3xl font-bold'>${totalSale}</h2>
//                         <span className='text-md font-medium'>Total Salse</span>
//                     </div>

//                     <div className='w-[40px] h-[47px] rounded-full bg-[#fa0305] flex justify-center items-center text-xl'>
//                     <MdCurrencyExchange className='text-[#fae8e8] shadow-lg' /> 
//                     </div> 
//                 </div>


//                 <div className='flex justify-between items-center p-5 bg-[#fde2ff] rounded-md gap-3'>
//                     <div className='flex flex-col justify-start items-start text-[#5c5a5a]'>
//                         <h2 className='text-3xl font-bold'>{totalProduct}</h2>
//                         <span className='text-md font-medium'>Products</span>
//                     </div>

//                     <div className='w-[40px] h-[47px] rounded-full bg-[#760077] flex justify-center items-center text-xl'>
//                     <MdProductionQuantityLimits  className='text-[#fae8e8] shadow-lg' /> 
//                     </div> 
//                 </div>


//                 <div className='flex justify-between items-center p-5 bg-[#e9feea] rounded-md gap-3'>
//                     <div className='flex flex-col justify-start items-start text-[#5c5a5a]'>
//                         <h2 className='text-3xl font-bold'>{totalSeller}</h2>
//                         <span className='text-md font-medium'>Sellers</span>
//                     </div>

//                     <div className='w-[40px] h-[47px] rounded-full bg-[#038000] flex justify-center items-center text-xl'>
//                     <FaUsers  className='text-[#fae8e8] shadow-lg' /> 
//                     </div> 
//                 </div>


//                 <div className='flex justify-between items-center p-5 bg-[#ecebff] rounded-md gap-3'>
//                     <div className='flex flex-col justify-start items-start text-[#5c5a5a]'>
//                         <h2 className='text-3xl font-bold'>{totalOrder}</h2>
//                         <span className='text-md font-medium'>Orders</span>
//                     </div>

//                     <div className='w-[40px] h-[47px] rounded-full bg-[#0200f8] flex justify-center items-center text-xl'>
//                     <FaCartShopping  className='text-[#fae8e8] shadow-lg' /> 
//                     </div> 
//                 </div>
 
//             </div>

        
        
//         <div className='w-full flex flex-wrap mt-7'>
//             <div className='w-full lg:w-7/12 lg:pr-3'>
//                 <div className='w-full bg-[#6a5fdf] p-4 rounded-md'>
//             <Chart options={state.options} series={state.series} type='bar' height={350} />
//                 </div>
//             </div>

        
//         <div className='w-full lg:w-5/12 lg:pl-4 mt-6 lg:mt-0'>
//             <div className='w-full bg-[#6a5fdf] p-4 rounded-md text-[#d0d2d6]'>
//                 <div className='flex justify-between items-center'>
//                     <h2 className='font-semibold text-lg text-[#d0d2d6] pb-3'>Recent Seller Message</h2>
//                     <Link to="/admin/dashboard/chat-sellers" className='font-semibold text-sm text-[#d0d2d6]'>View All</Link>
//                 </div>

//         <div className='flex flex-col gap-2 pt-6 text-[#d0d2d6]'>
//             <ol className='relative border-1 border-slate-600 ml-4'>
               
//                {
//                 Array.isArray(recentMessage) && recentMessage.map((m, i) => (
//                 <li key={i} className='mb-3 ml-6'>
//                 <div className='flex absolute -left-5 shadow-lg justify-center items-center w-10 h-10 p-[6px] bg-[#4c7fe2] rounded-full z-10'>
//                 {
//                     m?.senderId === userInfo?._id ? <img className='w-full rounded-full h-full shadow-lg' src={userInfo?.image} alt="" /> : <img className='w-full rounded-full h-full shadow-lg' src={seller} alt="" />
//                 } 
//                 </div>
//                 <div className='p-3 bg-slate-800 rounded-lg border border-slate-600 shadow-sm'>
//                 <div className='flex justify-between items-center mb-2'>
//             <Link className='text-md font-normal'>{m?.senderName}</Link>
//             <time className='mb-1 text-sm font-normal sm:order-last sm:mb-0'> {moment(m?.createdAt).startOf('hour').fromNow()}</time>
//                 </div>
//                 <div className='p-2 text-xs font-normal bg-slate-700 rounded-lg border border-slate-800'>
//                     {m?.message}
//                 </div>
//                 </div>
//             </li>
//                 ))
//                }
               
                
 

//             </ol>

//         </div>


//             </div>
//         </div>
//         </div>


//         <div className='w-full p-4 bg-[#6a5fdf] rounded-md mt-6'>
//             <div className='flex justify-between items-center'>
//                 <h2 className='font-semibold text-lg text-[#d0d2d6] pb-3 '>Recent Orders</h2>
//                 <Link to="/admin/dashboard/orders" className='font-semibold text-sm text-[#d0d2d6]'>View All</Link>
//                </div>

//     <div className='relative overflow-x-auto'>
//     <table className='w-full text-sm text-left text-[#d0d2d6]'>
//         <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
//         <tr>
//             <th scope='col' className='py-3 px-4'>Order Id</th>
//             <th scope='col' className='py-3 px-4'>Price</th>
//             <th scope='col' className='py-3 px-4'>Payment Status</th>
//             <th scope='col' className='py-3 px-4'>Order Status</th>
//             <th scope='col' className='py-3 px-4'>Active</th>
//         </tr>
//         </thead>

//         <tbody>
//             {
//                 Array.isArray(recentOrder) && recentOrder.map((d, i) => (
//                 <tr key={i}>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>#{d?._id}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>${d?.totalPrice || d?.price || 0}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{d?.payment_status}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{d?.delivery_status}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                     <Link to={`/admin/dashboard/order/details/${d?._id}`}>View</Link> </td>
//                 </tr>
//                 ))
//             }

            
//         </tbody>

//     </table>

//     </div>

//         </div>




             
//         </div>
//     );
// };

// export default AdminDashboard;
import React, { useEffect } from 'react';
import { MdCurrencyExchange, MdProductionQuantityLimits } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6"; 
import Chart from 'react-apexcharts'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import seller from '../../assets/seller.png'
import { get_admin_dashboard_data, get_admin_chart_data } from '../../store/Reducers/dashboardReducer';
import moment from 'moment';

const AdminDashboard = () => {
    const dispatch = useDispatch()
    const {totalSale = 0, totalOrder = 0, totalProduct = 0, totalSeller = 0, recentOrder = [], recentMessage = [], chartData = {}} = useSelector(state=> state.dashboard)
    const {userInfo} = useSelector(state=> state.auth)

    useEffect(() => {
        dispatch(get_admin_dashboard_data())
        dispatch(get_admin_chart_data())
    }, [dispatch])

    const state = {
        series: [
            {
                name: "Orders",
                data: chartData?.orders || [0,0,0,0,0,0,0,0,0,0,0,0]
            },
            {
                name: "Revenue",
                data: chartData?.revenue || [0,0,0,0,0,0,0,0,0,0,0,0]
            },
            {
                name: "Sellers",
                data: chartData?.sellers || [0,0,0,0,0,0,0,0,0,0,0,0]
            },
        ],
        options: {
            colors: ['#f472b6', '#ec4899', '#db2777'],
            plotOptions: {
                radius: 30
            },
            chart: {
                background: 'transparent',
                foreColor: '#374151'
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                curve: ['smooth'],
                lineCap: 'butt',
                width: 2,
                dashArray: 0
            },
            xaxis: {
                categories: chartData?.labels || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            },
            legend: {
                position: 'top'
            },
            grid: {
                borderColor: '#f9a8d4',
                strokeDashArray: 4,
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 565,
                    yaxis: {
                        categories: chartData?.labels || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                    },
                    options: {
                        plotOptions: {
                            bar: {
                                horizontal: true
                            }
                        },
                        chart: {
                            height: "550px"
                        }
                    }
                }
            ]
        }
    }

    // Function to display status badges
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending':
                return <span className="bg-yellow-500 px-2 py-1 rounded text-white text-xs">Pending</span>;
            case 'processing':
                return <span className="bg-blue-500 px-2 py-1 rounded text-white text-xs">Processing</span>;
            case 'shipping':
                return <span className="bg-pink-500 px-2 py-1 rounded text-white text-xs">Shipping</span>;
            case 'delivered':
                return <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">Delivered</span>;
            case 'cancelled':
            case 'canceled':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Cancelled</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white text-xs">{status}</span>;
        }
    };

    // Function to display payment status badges
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
        <div className='px-2 md:px-7 py-5'>
            <h2 className='text-2xl font-bold text-pink-600 mb-4'>Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5'>
                <div className='flex justify-between items-center p-5 bg-white rounded-md gap-3 shadow-md border-l-4 border-pink-500'>
                    <div className='flex flex-col justify-start items-start text-gray-700'>
                        <h2 className='text-2xl font-bold text-pink-600'>${totalSale}</h2>
                        <span className='text-sm font-medium'>Total Sales</span>
                    </div>
                    <div className='w-[45px] h-[45px] rounded-full bg-pink-100 flex justify-center items-center text-xl'>
                        <MdCurrencyExchange className='text-pink-600' /> 
                    </div> 
                </div>

                <div className='flex justify-between items-center p-5 bg-white rounded-md gap-3 shadow-md border-l-4 border-purple-500'>
                    <div className='flex flex-col justify-start items-start text-gray-700'>
                        <h2 className='text-2xl font-bold text-purple-600'>{totalProduct}</h2>
                        <span className='text-sm font-medium'>Products</span>
                    </div>
                    <div className='w-[45px] h-[45px] rounded-full bg-purple-100 flex justify-center items-center text-xl'>
                        <MdProductionQuantityLimits className='text-purple-600' /> 
                    </div> 
                </div>

                <div className='flex justify-between items-center p-5 bg-white rounded-md gap-3 shadow-md border-l-4 border-green-500'>
                    <div className='flex flex-col justify-start items-start text-gray-700'>
                        <h2 className='text-2xl font-bold text-green-600'>{totalSeller}</h2>
                        <span className='text-sm font-medium'>Sellers</span>
                    </div>
                    <div className='w-[45px] h-[45px] rounded-full bg-green-100 flex justify-center items-center text-xl'>
                        <FaUsers className='text-green-600' /> 
                    </div> 
                </div>

                <div className='flex justify-between items-center p-5 bg-white rounded-md gap-3 shadow-md border-l-4 border-blue-500'>
                    <div className='flex flex-col justify-start items-start text-gray-700'>
                        <h2 className='text-2xl font-bold text-blue-600'>{totalOrder}</h2>
                        <span className='text-sm font-medium'>Orders</span>
                    </div>
                    <div className='w-[45px] h-[45px] rounded-full bg-blue-100 flex justify-center items-center text-xl'>
                        <FaCartShopping className='text-blue-600' /> 
                    </div> 
                </div>
            </div>
            
            {/* Charts and Messages */}
            <div className='w-full flex flex-wrap mt-7 gap-5'>
                <div className='w-full lg:w-7/12'>
                    <div className='w-full bg-white p-4 rounded-md shadow-md'>
                        <h2 className='text-xl font-bold text-pink-600 mb-3 border-b border-pink-100 pb-2'>Sales Analytics</h2>
                        <Chart options={state.options} series={state.series} type='bar' height={350} />
                    </div>
                </div>

                <div className='w-full lg:w-4/12 mt-5 lg:mt-0'>
                    <div className='w-full bg-white p-4 rounded-md shadow-md'>
                        <div className='flex justify-between items-center mb-4 border-b border-pink-100 pb-2'>
                            <h2 className='text-xl font-bold text-pink-600'>Recent Messages</h2>
                            <Link to="/admin/dashboard/chat-sellers" className='text-pink-500 hover:text-pink-700 text-sm'>View All</Link>
                        </div>

                        <div className='flex flex-col gap-3 pt-2 text-gray-700'>
                            <div className='overflow-y-auto max-h-[350px] pr-2'>
                                {Array.isArray(recentMessage) && recentMessage.length > 0 ? (
                                    recentMessage.map((m, i) => (
                                        <div key={i} className='mb-4 bg-pink-50 rounded-lg p-3 shadow-sm'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 rounded-full overflow-hidden'>
                                                    {m?.senderId === userInfo?._id ? 
                                                        <img className='w-full h-full object-cover' src={userInfo?.image} alt="User" /> : 
                                                        <img className='w-full h-full object-cover' src={seller} alt="Seller" />
                                                    }
                                                </div>
                                                <div>
                                                    <div className='flex justify-between items-center'>
                                                        <span className='font-medium text-pink-600'>{m?.senderName}</span>
                                                        <span className='text-xs text-gray-500'>{moment(m?.createdAt).fromNow()}</span>
                                                    </div>
                                                    <p className='text-sm mt-1'>{m?.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-center text-gray-500 py-5'>No recent messages</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className='w-full bg-white p-4 rounded-md shadow-md mt-6'>
                <div className='flex justify-between items-center mb-4 border-b border-pink-100 pb-2'>
                    <h2 className='text-xl font-bold text-pink-600'>Recent Orders</h2>
                    <Link to="/admin/dashboard/orders" className='text-pink-500 hover:text-pink-700 text-sm'>View All</Link>
                </div>

                <div className='relative overflow-x-auto sm:rounded-lg'>
                    <table className='w-full text-sm text-left text-gray-700'>
                        <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                            <tr>
                                <th scope='col' className='py-3 px-4'>Order ID</th>
                                <th scope='col' className='py-3 px-4'>Price</th>
                                <th scope='col' className='py-3 px-4'>Payment Status</th>
                                <th scope='col' className='py-3 px-4'>Order Status</th>
                                <th scope='col' className='py-3 px-4'>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.isArray(recentOrder) && recentOrder.length > 0 ? (
                                recentOrder.map((d, i) => (
                                    <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>#{d?._id}</td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>${d?.totalPrice || d?.price || 0}</td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{getPaymentBadge(d?.payment_status)}</td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{getStatusBadge(d?.delivery_status)}</td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <Link to={`/admin/dashboard/order/details/${d?._id}`} className='text-pink-600 hover:underline'>View</Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="bg-white border-b border-pink-100">
                                    <td colSpan="5" className="py-4 text-center">No recent orders</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;