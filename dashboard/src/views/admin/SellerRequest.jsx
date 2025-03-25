// import React, { useEffect, useState } from 'react'; 
// import { Link } from 'react-router-dom';
// import Pagination from '../Pagination';
// import { FaEye } from "react-icons/fa";
// import { useDispatch, useSelector } from 'react-redux';
// import Search from '../components/Search';
// import { get_seller_request } from '../../store/Reducers/sellerReducer';

// const SellerRequest = () => {

//     const dispatch = useDispatch()
//     const {sellers,totalSeller} = useSelector(state=> state.seller)

//     const [currentPage, setCurrentPage] = useState(1)
//     const [searchValue, setSearchValue] = useState('')
//     const [parPage, setParPage] = useState(5)
//     const [show, setShow] =  useState(false)

//     useEffect(() => {
//         dispatch(get_seller_request({
//             parPage,
//             searchValue,
//             page: currentPage
//         }))

//     },[parPage,searchValue,currentPage])

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
            
//       <h1 className='text-[20px] font-bold mb-3'>  Seller Request </h1>
             
//              <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
            
//              <Search setParPage={setParPage} setSearchValue={setSearchValue} searchValue={searchValue}  /> 

//                 <div className='relative overflow-x-auto'>
//     <table className='w-full text-sm text-left text-[#d0d2d6]'>
//         <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
//         <tr>
//             <th scope='col' className='py-3 px-4'>No</th> 
//             <th scope='col' className='py-3 px-4'>Name</th>
//             <th scope='col' className='py-3 px-4'>Email</th> 
//             <th scope='col' className='py-3 px-4'>Payment Status</th> 
//             <th scope='col' className='py-3 px-4'>Status</th>  
//             <th scope='col' className='py-3 px-4'>Action</th> 
//         </tr>
//         </thead>

//         <tbody>
//             {
//                 sellers.map((d, i) => <tr className='border-b border-slate-700' key={i}>
//                 <td scope='row' className='py-2 px-4 font-medium whitespace-nowrap'>{i+1}</td> 
//                 <td scope='row' className='py-2 px-4 font-medium whitespace-nowrap'>{d.name} </td>
//                 <td scope='row' className='py-2 px-4 font-medium whitespace-nowrap'>{d.email} </td>
//                 <td scope='row' className='py-2 px-4 font-medium whitespace-nowrap'>
//                     <span>{d.payment}</span> </td>

//                <td scope='row' className='py-2 px-4 font-medium whitespace-nowrap'>
//                     <span>{d.status}</span> </td>
                 
                 
//                 <td scope='row' className='py-2 px-4 font-medium whitespace-nowrap'>
//                     <div className='flex justify-start items-center gap-4'>
//                     <Link to={`/admin/dashboard/seller/details/${d._id}`} className='p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50'> <FaEye /> </Link> 
                    
//                     </div>
                    
//                     </td>
//             </tr> )
//             }

            
//         </tbody> 
//     </table> 
//     </div>  

//     <div className='w-full flex justify-end mt-4 bottom-4 right-4'>
//         <Pagination 
//             pageNumber = {currentPage}
//             setPageNumber = {setCurrentPage}
//             totalItem = {50}
//             parPage = {parPage}
//             showItem = {3}
//         />
//         </div>






//              </div>
            
//         </div>
//     );
// };

// export default SellerRequest;
import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import Search from '../components/Search';
import { get_seller_request } from '../../store/Reducers/sellerReducer';

const SellerRequest = () => {
    const dispatch = useDispatch()
    const {sellers, totalSeller} = useSelector(state => state.seller)

    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)
    const [show, setShow] = useState(false)

    useEffect(() => {
        dispatch(get_seller_request({
            parPage,
            searchValue,
            page: currentPage
        }))
    }, [parPage, searchValue, currentPage, dispatch])

    // Function to display status badge
    const getStatusBadge = (status) => {
        switch(status) {
            case 'active':
                return <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">Active</span>;
            case 'pending':
                return <span className="bg-yellow-500 px-2 py-1 rounded text-white text-xs">Pending</span>;
            case 'deactive':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Deactive</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white text-xs">{status}</span>;
        }
    };

    // Function to display payment status badge
    const getPaymentBadge = (status) => {
        switch(status) {
            case 'paid':
                return <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">Paid</span>;
            case 'unpaid':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Unpaid</span>;
            case 'pending':
                return <span className="bg-yellow-500 px-2 py-1 rounded text-white text-xs">Pending</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white text-xs">{status}</span>;
        }
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-md shadow-md'>
                <div className='flex justify-between items-center mb-5 border-b border-pink-100 pb-3'>
                    <h2 className='text-xl font-bold text-pink-600'>Seller Requests</h2>
                </div>
                
                <div className='flex flex-wrap gap-2 md:gap-4 justify-between items-end mb-5'>
                    <div className='flex items-center gap-3'>
                        <select 
                            onChange={(e) => setParPage(parseInt(e.target.value))} 
                            className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="15">15 per page</option>
                            <option value="25">25 per page</option>
                        </select>
                    </div>
                    
                    <div className='flex-grow'>
                        <input 
                            type="text" 
                            placeholder='Search seller requests...' 
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className='px-4 py-2 w-full focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                        />
                    </div>
                </div>

                <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
                    <table className='w-full text-sm text-left text-gray-700'>
                        <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                            <tr>
                                <th scope='col' className='py-3 px-4'>No</th> 
                                <th scope='col' className='py-3 px-4'>Name</th>
                                <th scope='col' className='py-3 px-4'>Email</th> 
                                <th scope='col' className='py-3 px-4'>Payment Status</th> 
                                <th scope='col' className='py-3 px-4'>Status</th>  
                                <th scope='col' className='py-3 px-4'>Action</th> 
                            </tr>
                        </thead>

                        <tbody>
                            {sellers && sellers.length > 0 ? (
                                sellers.map((d, i) => (
                                    <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{i+1}</td> 
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{d.name}</td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{d.email}</td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            {getPaymentBadge(d.payment)}
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            {getStatusBadge(d.status)}
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                            <div className='flex justify-start items-center gap-4'>
                                                <Link 
                                                    to={`/admin/dashboard/seller/details/${d._id}`} 
                                                    className='p-[6px] bg-green-500 rounded-md hover:bg-green-600 text-white transition-all'
                                                    title="View details"
                                                > 
                                                    <FaEye />
                                                </Link> 
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="bg-white border-b border-pink-100">
                                    <td colSpan="6" className="py-4 text-center">No seller requests found</td>
                                </tr>
                            )}
                        </tbody> 
                    </table> 
                </div>  

                {totalSeller > parPage && (
                    <div className='w-full flex justify-end mt-4'>
                        <Pagination 
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalSeller}
                            parPage={parPage}
                            showItem={3}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerRequest;