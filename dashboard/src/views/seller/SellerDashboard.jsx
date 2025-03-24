// import React, { useEffect } from 'react';
// import { MdCurrencyExchange,MdProductionQuantityLimits } from "react-icons/md";
// import { FaUsers } from "react-icons/fa";
// import { FaCartShopping } from "react-icons/fa6"; 
// import Chart from 'react-apexcharts'
// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { get_seller_dashboard_data } from '../../store/Reducers/dashboardReducer';
// import moment from 'moment';
// import customer from '../../assets/demo.jpg'

// const SellerDashboard = () => {

//     const dispatch = useDispatch()
//     const {totalSale,totalOrder,totalProduct,totalPendingOrder,recentOrder,recentMessage,chartData} = useSelector(state=> state.dashboard)
//     const {userInfo} = useSelector(state=> state.auth)



//     useEffect(() => {
//         dispatch(get_seller_dashboard_data())
//     }, [])

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
//                 name : "Products Sold",
//                 data : chartData?.sales || [0,0,0,0,0,0,0,0,0,0,0,0]
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
//                 categories : chartData?.labels || ['Jan','Feb','Mar','Apl','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
//             },
//             legend : {
//                 position : 'top'
//             },
//             responsive : [
//                 {
//                     breakpoint : 565,
//                     yaxis : {
//                         categories : ['Jan','Feb','Mar','Apl','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
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
//                         <span className='text-md font-medium'>Total Revenue</span>
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
//                         <h2 className='text-3xl font-bold'>{totalOrder}</h2>
//                         <span className='text-md font-medium'>Orders</span>
//                     </div>

//                     <div className='w-[40px] h-[47px] rounded-full bg-[#038000] flex justify-center items-center text-xl'>
//                     <FaCartShopping  className='text-[#fae8e8] shadow-lg' /> 
//                     </div> 
//                 </div>


//                 <div className='flex justify-between items-center p-5 bg-[#ecebff] rounded-md gap-3'>
//                     <div className='flex flex-col justify-start items-start text-[#5c5a5a]'>
//                         <h2 className='text-3xl font-bold'>{totalPendingOrder}</h2>
//                         <span className='text-md font-medium'>Processing Orders</span>
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
//                     <h2 className='font-semibold text-lg text-[#d0d2d6] pb-3'>Recent Customer Messages</h2>
//                     <Link to="/seller/dashboard/chat-customer" className='font-semibold text-sm text-[#d0d2d6]'>View All</Link>
//                 </div>

//         <div className='flex flex-col gap-2 pt-6 text-[#d0d2d6]'>
//             <ol className='relative border-1 border-slate-600 ml-4'>
               
//     {
//         recentMessage.map((m, i) => <li className='mb-3 ml-6' key={i}>
//         <div className='flex absolute -left-5 shadow-lg justify-center items-center w-10 h-10 p-[6px] bg-[#4c7fe2] rounded-full z-10'>
//         {
//             m.senderId === userInfo._id ? <img className='w-full rounded-full h-full shadow-lg' src={userInfo.image} alt="" /> : <img className='w-full rounded-full h-full shadow-lg' src={customer} alt="" />
//         } 
//         </div>
//         <div className='p-3 bg-slate-800 rounded-lg border border-slate-600 shadow-sm'>
//         <div className='flex justify-between items-center mb-2'>
//     <Link className='text-md font-normal'>{m.senderName}</Link>
//     <time className='mb-1 text-sm font-normal sm:order-last sm:mb-0'> {moment(m.createdAt).startOf('hour').fromNow()}</time>
//         </div>
//         <div className='p-2 text-xs font-normal bg-slate-700 rounded-lg border border-slate-800'>
//             {m.message}
//         </div>
//         </div>
//     </li>)
//         }

 

//             </ol>

//         </div>


//             </div>
//         </div>
//         </div>


//         <div className='w-full p-4 bg-[#6a5fdf] rounded-md mt-6'>
//             <div className='flex justify-between items-center'>
//                 <h2 className='font-semibold text-lg text-[#d0d2d6] pb-3 '>Recent Orders</h2>
//                 <Link to="/seller/dashboard/orders" className='font-semibold text-sm text-[#d0d2d6]'>View All</Link>
//                </div>

//     <div className='relative overflow-x-auto'>
//     <table className='w-full text-sm text-left text-[#d0d2d6]'>
//         <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
//         <tr>
//             <th scope='col' className='py-3 px-4'>Order Id</th>
//             <th scope='col' className='py-3 px-4'>Price</th>
//             <th scope='col' className='py-3 px-4'>Payment Status</th>
//             <th scope='col' className='py-3 px-4'>Order Status</th>
//             <th scope='col' className='py-3 px-4'>Action</th>
//         </tr>
//         </thead>

//         <tbody>
//             {
//                 recentOrder.map((d, i) => <tr key={i}>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>#{d._id}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>${d.price}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{d.payment_status}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{d.delivery_status}</td>
//                 <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
//                     <Link to={`/seller/dashboard/order/details/${d._id}`}>View</Link> </td>
//             </tr> )
//             }

            
//         </tbody>

//     </table>

//     </div>

//         </div>




             
//         </div>
//     );
// };

// export default SellerDashboard;
import React, { useEffect } from 'react';
import { MdCurrencyExchange, MdProductionQuantityLimits } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6"; 
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_seller_dashboard_data } from '../../store/Reducers/dashboardReducer';
import moment from 'moment';
import customer from '../../assets/demo.jpg';

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const { totalSale, totalOrder, totalProduct, totalPendingOrder, recentOrder, recentMessage, chartData } = useSelector(state => state.dashboard);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(get_seller_dashboard_data());
    }, []);

    const state = {
        series: [
            {
                name: "Orders",
                data: chartData?.orders || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: "Revenue",
                data: chartData?.revenue || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: "Products Sold",
                data: chartData?.sales || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
        ],
        options: {
            colors: ['#F472B6', '#EC4899', '#DB2777'],
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    columnWidth: '70%',
                }
            },
            chart: {
                background: 'transparent',
                foreColor: '#4B5563'
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: chartData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yaxis: {
                title: {
                    text: 'Performance',
                    style: {
                        color: '#4B5563'
                    }
                }
            },
            fill: {
                opacity: 1
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left'
            },
            grid: {
                borderColor: '#F3F4F6'
            },
            tooltip: {
                theme: 'light',
                y: {
                    formatter: function (val) {
                        return val
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 640,
                    options: {
                        plotOptions: {
                            bar: {
                                horizontal: false
                            }
                        },
                        chart: {
                            height: '300px'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ]
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Seller Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Revenue Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="px-5 py-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">${totalSale}</h2>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                                    <MdCurrencyExchange className="text-pink-500 text-2xl" />
                                </div>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gradient-to-r from-pink-300 to-pink-500"></div>
                    </div>
                    
                    {/* Products Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="px-5 py-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Products</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{totalProduct}</h2>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                                    <MdProductionQuantityLimits className="text-pink-500 text-2xl" />
                                </div>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gradient-to-r from-pink-300 to-pink-500"></div>
                    </div>
                    
                    {/* Orders Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="px-5 py-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{totalOrder}</h2>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                                    <FaCartShopping className="text-pink-500 text-2xl" />
                                </div>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gradient-to-r from-pink-300 to-pink-500"></div>
                    </div>
                    
                    {/* Processing Orders Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="px-5 py-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Processing Orders</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{totalPendingOrder}</h2>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                                    <FaCartShopping className="text-pink-500 text-2xl" />
                                </div>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gradient-to-r from-pink-300 to-pink-500"></div>
                    </div>
                </div>
                
                {/* Charts and Messages Section */}
                <div className="flex flex-col lg:flex-row gap-6 mt-8">
                    {/* Chart */}
                    <div className="w-full lg:w-7/12 bg-white rounded-xl shadow-md p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Analytics</h2>
                        <div className="h-[350px]">
                            <Chart options={state.options} series={state.series} type='bar' height={320} />
                        </div>
                    </div>
                    
                    {/* Recent Messages */}
                    <div className="w-full lg:w-5/12 bg-white rounded-xl shadow-md p-5">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">Recent Messages</h2>
                            <Link to="/seller/dashboard/chat-customer" className="text-sm font-medium text-pink-500 hover:text-pink-700 transition">
                                View All
                            </Link>
                        </div>
                        
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                            {recentMessage.length > 0 ? (
                                recentMessage.map((m, i) => (
                                    <div key={i} className="bg-gray-50 rounded-lg p-4 relative">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={m.senderId === userInfo._id ? userInfo.image : customer} 
                                                    alt={m.senderName} 
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-medium text-gray-800 truncate">{m.senderName}</p>
                                                    <span className="text-xs text-gray-500">
                                                        {moment(m.createdAt).startOf('hour').fromNow()}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                                                    {m.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">No recent messages</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Recent Orders */}
                <div className="mt-8 bg-white rounded-xl shadow-md p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                        <Link to="/seller/dashboard/orders" className="text-sm font-medium text-pink-500 hover:text-pink-700 transition">
                            View All
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 rounded-l-lg">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Price</th>
                                    <th scope="col" className="px-6 py-3">Payment Status</th>
                                    <th scope="col" className="px-6 py-3">Order Status</th>
                                    <th scope="col" className="px-6 py-3 rounded-r-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrder.length > 0 ? (
                                    recentOrder.map((order, i) => (
                                        <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">#{order._id}</td>
                                            <td className="px-6 py-4">${order.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.payment_status === 'paid' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.delivery_status === 'delivered' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : order.delivery_status === 'processing'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.delivery_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link 
                                                    to={`/seller/dashboard/order/details/${order._id}`}
                                                    className="font-medium text-pink-600 hover:text-pink-800 transition"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                            No recent orders
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;