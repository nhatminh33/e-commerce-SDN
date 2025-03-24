// import React, { forwardRef, useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { FixedSizeList as List } from 'react-window';
// import { confirm_payment_request, get_payment_request,messageClear } from '../../store/Reducers/PaymentReducer';
// import moment from 'moment';
// import toast from 'react-hot-toast';

// function handleOnWheel({ deltaY }) {
//     console.log('handleOnWheel',deltaY)
// }

// const outerElementType = forwardRef((props, ref) => (
//     <div ref={ref} onWheel={handleOnWheel} {...props} /> 
//  ))
 
// const PaymentRequest = () => {

//     const dispatch = useDispatch()
//     const {successMessage, errorMessage, pendingWithdrows,loader } = useSelector(state => state.payment)
//     const [paymentId, setPaymentId] = useState('')

//     useEffect(() => { 
//         dispatch(get_payment_request())
//     },[])

//     const confirm_request = (id) => {
//         setPaymentId(id)
//         dispatch(confirm_payment_request(id))
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
//     },[successMessage,errorMessage])
     

//     const Row = ({ index, style }) => {
//         return (
//         <div style={style} className='flex text-sm text-white font-medium'>
//         <div className='w-[25%] p-2 whitespace-nowrap'>{index + 1}</div>
//         <div className='w-[25%] p-2 whitespace-nowrap'>${pendingWithdrows[index]?.amount}</div>
//         <div className='w-[25%] p-2 whitespace-nowrap'>
//             <span className='py-[1px] px-[5px] bg-slate-300 text-blue-500 rounded-md text-sm'>{pendingWithdrows[index]?.status}</span>
//          </div>
//         <div className='w-[25%] p-2 whitespace-nowrap'> {moment(pendingWithdrows[index]?.createdAt).format('LL')} </div>
//         <div className='w-[25%] p-2 whitespace-nowrap'>
            
//             <button disabled={loader} onClick={() => confirm_request(pendingWithdrows[index]?._id)} className='bg-indigo-500 shadow-lg hover:shadow-indigo-500/50 px-3 py-[2px cursor-pointer text-white rounded-sm text-sm]'>{(loader && paymentId === pendingWithdrows[index]?._id) ? 'loading..' : 'Confirm'}</button>
//         </div>

//             </div>
//         )
//     }





//     return (
// <div className='px-2 lg:px-7 pt-5'>
//     <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//         <h2 className='text-xl font-medium pb-5 text-[#d0d2d6]'>Withdrawal Request</h2>
//         <div className='w-full'>
//             <div className='w-full overflow-x-auto'>
//                 <div className='flex bg-[#a7a3de] uppercase text-xs font-bold min-w-[340px] rounded-md'>
//                     <div className='w-[25%] p-2'> No </div>
//                     <div className='w-[25%] p-2'> Amount </div>
//                     <div className='w-[25%] p-2'> Status </div>
//                     <div className='w-[25%] p-2'> Date </div>
//                     <div className='w-[25%] p-2'> Action </div> 
//                 </div>
//                 {
//                     <List
//                     style={{ minWidth : '340px'}}
//                     className='List'
//                     height={350}
//                     itemCount={pendingWithdrows.length}
//                     itemSize={35}
//                     outerElementType={outerElementType}                    
//                     >
//                         {Row}

//                     </List>
//                 }

//             </div>

//         </div>

//     </div>
    
// </div>
//     );
// };

// export default PaymentRequest;
import React, { forwardRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { confirm_payment_request, get_payment_request, messageClear } from '../../store/Reducers/PaymentReducer';
import moment from 'moment';
import toast from 'react-hot-toast';

function handleOnWheel({ deltaY }) {
    console.log('handleOnWheel', deltaY);
}

const outerElementType = forwardRef((props, ref) => (
    <div ref={ref} onWheel={handleOnWheel} {...props} /> 
));
 
const PaymentRequest = () => {
    const dispatch = useDispatch();
    const { successMessage, errorMessage, pendingWithdrows, loader } = useSelector(state => state.payment);
    const [paymentId, setPaymentId] = useState('');

    useEffect(() => { 
        dispatch(get_payment_request());
    }, []);

    const confirm_request = (id) => {
        setPaymentId(id);
        dispatch(confirm_payment_request(id));
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
    }, [successMessage, errorMessage]);
     
    // Function to get status badge with appropriate color
    const getStatusBadge = (status) => {
        switch(status) {
            case 'paid':
                return <span className="bg-green-500 px-2 py-1 rounded text-white text-xs">Paid</span>;
            case 'pending':
                return <span className="bg-yellow-500 px-2 py-1 rounded text-white text-xs">Pending</span>;
            case 'rejected':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Rejected</span>;
            default:
                return <span className="bg-gray-500 px-2 py-1 rounded text-white text-xs">{status}</span>;
        }
    };

    const Row = ({ index, style }) => {
        return (
            <div 
                style={style} 
                className={`flex text-sm font-medium text-gray-700 ${index % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100`}
            >
                <div className='w-[20%] p-3 whitespace-nowrap'>{index + 1}</div>
                <div className='w-[20%] p-3 whitespace-nowrap font-medium text-pink-600'>${pendingWithdrows[index]?.amount}</div>
                <div className='w-[20%] p-3 whitespace-nowrap'>
                    {getStatusBadge(pendingWithdrows[index]?.status)}
                </div>
                <div className='w-[20%] p-3 whitespace-nowrap'>{moment(pendingWithdrows[index]?.createdAt).format('LL')}</div>
                <div className='w-[20%] p-3 whitespace-nowrap'>
                    <button 
                        disabled={loader} 
                        onClick={() => confirm_request(pendingWithdrows[index]?._id)} 
                        className={`px-3 py-1 rounded-md text-white text-sm transition-all ${loader && paymentId === pendingWithdrows[index]?._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 shadow-sm'}`}
                    >
                        {(loader && paymentId === pendingWithdrows[index]?._id) ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-white rounded-md shadow-md'>
                <div className='flex justify-between items-center mb-5 border-b border-pink-100 pb-3'>
                    <h2 className='text-xl font-bold text-pink-600'>Withdrawal Requests</h2>
                </div>
                
                <div className='w-full'>
                    <div className='w-full overflow-x-auto rounded-lg shadow-sm'>
                        <div className='flex bg-pink-100 text-xs font-bold uppercase text-gray-700 min-w-[340px] rounded-t-md'>
                            <div className='w-[20%] p-3'>No</div>
                            <div className='w-[20%] p-3'>Amount</div>
                            <div className='w-[20%] p-3'>Status</div>
                            <div className='w-[20%] p-3'>Date</div>
                            <div className='w-[20%] p-3'>Action</div> 
                        </div>
                        
                        {pendingWithdrows && pendingWithdrows.length > 0 ? (
                            <List
                                style={{ minWidth: '340px' }}
                                className='List rounded-b-md border border-pink-100'
                                height={350}
                                itemCount={pendingWithdrows.length}
                                itemSize={45}
                                outerElementType={outerElementType}                    
                            >
                                {Row}
                            </List>
                        ) : (
                            <div className='p-4 text-center text-gray-500 bg-white border border-pink-100 rounded-b-md'>
                                No withdrawal requests found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentRequest;