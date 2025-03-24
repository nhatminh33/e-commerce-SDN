// import React, { useEffect, useRef, useState } from 'react';
// import { FaList } from 'react-icons/fa6';
// import { IoMdClose } from "react-icons/io";
// import { useDispatch, useSelector } from 'react-redux';
// import { get_admin_message, get_sellers, send_message_seller_admin ,messageClear, updateSellerMessage, updateSellers} from '../../store/Reducers/chatReducer'
// import { Link, useParams } from 'react-router-dom';
// import { FaRegFaceGrinHearts } from "react-icons/fa6";
// import toast from 'react-hot-toast';

// import {socket} from '../../utils/utils'

// const ChatSeller = () => {
//     const scrollRef = useRef()
//     const [show, setShow] = useState(false) 
//     const { sellerId } = useParams()
//     const [text,setText] = useState('')
//     const [receverMessage,setReceverMessage] = useState('')
//     const {userInfo} = useSelector(state => state.auth)
//     const {sellers,activeSeller,seller_admin_message,currentSeller,successMessage} = useSelector(state => state.chat)
//     const dispatch = useDispatch()

//     // Đăng ký admin khi trang được tải
//     useEffect(() => {
//         // Đảm bảo socket đã kết nối trước khi đăng ký
//         if (socket.connected) {
//             socket.emit('add_admin', userInfo?._id || 'admin_id');
//         } else {
//             // Đăng ký khi socket kết nối
//             socket.on('connect', () => {
//                 socket.emit('add_admin', userInfo?._id || 'admin_id');
//             });
//         }
        
//         socket.on('disconnect', () => {
//             console.log('Admin disconnected from socket server');
//         });
        
//         socket.on('error', (error) => {
//             console.error('Socket connection error:', error);
//         });
        
//         // Lắng nghe danh sách seller đang hoạt động
//         socket.on('activeSellers', (sellers) => {
//             dispatch(updateSellers(sellers));
//         });

//         return () => {
//             // Hủy đăng ký các sự kiện khi component unmount
//             socket.off('connect');
//             socket.off('disconnect');
//             socket.off('error');
//             socket.off('activeSellers');
//         }
//     }, [userInfo]);

//     useEffect(() => {
//         dispatch(get_sellers())
//     }, [])

//     const send = (e) => {
//         e.preventDefault();
        
//         if (!text.trim() || !sellerId) return;
        
//         const messageData = {
//             senderId: '', 
//             receverId: sellerId,
//             message: text,
//             senderName: 'Admin Support'
//         };
        
//         console.log('Admin gửi tin nhắn:', messageData);
//         dispatch(send_message_seller_admin(messageData));
//         setText('');
//     }

//     useEffect(() => {
//         if (sellerId) {
//             dispatch(get_admin_message(sellerId))
//         }
//     },[sellerId])

//     useEffect(() => {
//         socket.on('receved_seller_message', msg => {
//              console.log('Nhận tin nhắn từ seller:', msg);
//              setReceverMessage(msg);
//         });
        
//         return () => {
//             socket.off('receved_seller_message');
//         };
//     }, []);

//     useEffect(() => {
//         if (receverMessage) {
//             console.log('Xử lý tin nhắn nhận được:', receverMessage);
//             console.log('sellerId hiện tại:', sellerId);
            
//             // Kiểm tra nếu tin nhắn từ seller hiện tại đang chọn
//             if (receverMessage.senderId === sellerId && receverMessage.receverId === '') {
//                 console.log('Cập nhật tin nhắn từ seller hiện tại');
//                 dispatch(updateSellerMessage(receverMessage));
//             } 
//             // Hiển thị thông báo nếu tin nhắn từ seller khác
//             else if (receverMessage.receverId === '') {
//                 console.log('Thông báo tin nhắn từ seller khác');
//                 toast.success(receverMessage.senderName + " đã gửi tin nhắn mới");
//             }
//         }
//     }, [receverMessage, sellerId]);

//     useEffect(() => {
//         if (successMessage) {
//             socket.emit('send_message_admin_to_seller',seller_admin_message[seller_admin_message.length - 1])
//             dispatch(messageClear())
//         }
//     },[successMessage])

//     useEffect(() => {
//         scrollRef.current?.scrollIntoView({ behavior: 'smooth'})
//     },[seller_admin_message])


//     return (
//     <div className='px-2 lg:px-7 py-5'>
//         <div className='w-full bg-[#6a5fdf] px-4 py-4 rounded-md h-[calc(100vh-140px)]'>
//         <div className='flex w-full h-full relative'>
    
//     <div className={`w-[280px] h-full absolute z-10 ${show ? '-left-[16px]' : '-left-[336px]'} md:left-0 md:relative transition-all `}>
//         <div className='w-full h-[calc(100vh-177px)] bg-[#9e97e9] md:bg-transparent overflow-y-auto'>
//         <div className='flex text-xl justify-between items-center p-4 md:p-0 md:px-3 md:pb-3 text-white'>
//         <h2>Sellers</h2>
//         <span onClick={() => setShow(!show)} className='block cursor-pointer md:hidden'><IoMdClose /> </span>
//        </div>

//         {
//             sellers.map((s,i) => <Link key={i} to={`/admin/dashboard/chat-sellers/${s._id}`} className={`h-[60px] flex justify-start gap-2 items-center text-white px-2 py-2 rounded-md cursor-pointer ${sellerId === s._id ? 'bg-[#8288ed]' : ''}  `}>
//             <div className='relative'>
//              <img className='w-[38px] h-[38px] border-white border-2 max-w-[38px] p-[2px] rounded-full' src={s.image} alt="" />
             
//              { 
//                 activeSeller.some(a => a.sellerId === s._id) && <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0'></div>
//              } 
//             </div>
    
//             <div className='flex justify-center items-start flex-col w-full'>
//                 <div className='flex justify-between items-center w-full'>
//                     <h2 className='text-base font-semibold'>{s.name}</h2>
    
//                 </div> 
//             </div> 
//            </Link>
//            )
//         }
       

 
 

//         </div> 
//     </div>

//     <div className='w-full md:w-[calc(100%-200px)] md:pl-4'>
//         <div className='flex justify-between items-center'>
//             {
//                 sellerId && <div className='flex justify-start items-center gap-3'>
//            <div className='relative'>
//          <img className='w-[45px] h-[45px] border-green-500 border-2 max-w-[45px] p-[2px] rounded-full' src={currentSeller?.image}  alt="" />
//          <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0'></div>
//         </div>
//                        <span className='text-white'>{currentSeller?.name}</span>
//                 </div>

//             }

//             <div onClick={()=> setShow(!show)} className='w-[35px] flex md:hidden h-[35px] rounded-sm bg-blue-500 shadow-lg hover:shadow-blue-500/50 justify-center cursor-pointer items-center text-white'>
//                 <span><FaList/> </span>
//             </div> 
//         </div>

//         <div className='py-4'>
//             <div className='bg-[#475569] h-[calc(100vh-290px)] rounded-md p-3 overflow-y-auto'>

//             {
//               sellerId ?  seller_admin_message.map((m, i) => {
//                     if (m.senderId === sellerId) {
//                         return(
//         <div ref={scrollRef} className='w-full flex justify-start items-center'>
//                         <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
//                             <div>
//                                 <img className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' src={currentSeller?.image || "http://localhost:3001/images/demo.jpg"} alt="" />
//                             </div>
//                             <div className='flex justify-center items-start flex-col w-full bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-1 px-2 rounded-sm'>
//                             <span>{m.message} </span>
//                             </div> 
//                         </div> 
//                     </div>
//                         )
//                     } else {
//                         return(
//                             <div ref={scrollRef} className='w-full flex justify-end items-center'>
//                     <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
                        
//                         <div className='flex justify-center items-start flex-col w-full bg-red-500 shadow-lg shadow-red-500/50 text-white py-1 px-2 rounded-sm'>
//                         <span>{m.message} </span>
//                         </div> 
//                         <div>
//                             <img className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' src="http://localhost:3001/images/admin.jpg" alt="" />
//                         </div>

//                     </div> 
//                 </div>
//                         )
//                     }
//                 }) : <div className='w-full h-full flex justify-center items-center flex-col gap-2 text-white'>
//                     <span><FaRegFaceGrinHearts /></span>
//                     <span>Select Seller </span>
//                 </div>
//             }
                
 
//             </div> 
//         </div>

//         <form onSubmit={send} className='flex gap-3'>
//             <input readOnly={sellerId ? false : true} value={text} onChange={(e) => setText(e.target.value)}  className='w-full flex justify-between px-2 border border-slate-700 items-center py-[5px] focus:border-blue-500 rounded-md outline-none bg-transparent text-[#d0d2d6]' type="text" placeholder='Input Your Message' />
//             <button disabled={sellerId ? false : true} className='shadow-lg bg-[#06b6d4] hover:shadow-cyan-500/50 text-semibold w-[75px] h-[35px] rounded-md text-white flex justify-center items-center'>Send</button>

//         </form>




//     </div>  

//         </div> 

//         </div>
        
//     </div>
//     );
// };

// export default ChatSeller;
import React, { useEffect, useRef, useState } from 'react';
import { FaList } from 'react-icons/fa6';
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_message, get_sellers, send_message_seller_admin, messageClear, updateSellerMessage, updateSellers} from '../../store/Reducers/chatReducer'
import { Link, useParams } from 'react-router-dom';
import { FaRegFaceGrinHearts } from "react-icons/fa6";
import toast from 'react-hot-toast';

import {socket} from '../../utils/utils'

const ChatSeller = () => {
    const scrollRef = useRef()
    const [show, setShow] = useState(false) 
    const { sellerId } = useParams()
    const [text, setText] = useState('')
    const [receverMessage, setReceverMessage] = useState('')
    const {userInfo} = useSelector(state => state.auth)
    const {sellers, activeSeller, seller_admin_message, currentSeller, successMessage} = useSelector(state => state.chat)
    const dispatch = useDispatch()

    // Đăng ký admin khi trang được tải
    useEffect(() => {
        // Đảm bảo socket đã kết nối trước khi đăng ký
        if (socket.connected) {
            socket.emit('add_admin', userInfo?._id || 'admin_id');
        } else {
            // Đăng ký khi socket kết nối
            socket.on('connect', () => {
                socket.emit('add_admin', userInfo?._id || 'admin_id');
            });
        }
        
        socket.on('disconnect', () => {
            console.log('Admin disconnected from socket server');
        });
        
        socket.on('error', (error) => {
            console.error('Socket connection error:', error);
        });
        
        // Lắng nghe danh sách seller đang hoạt động
        socket.on('activeSellers', (sellers) => {
            dispatch(updateSellers(sellers));
        });

        return () => {
            // Hủy đăng ký các sự kiện khi component unmount
            socket.off('connect');
            socket.off('disconnect');
            socket.off('error');
            socket.off('activeSellers');
        }
    }, [userInfo]);

    useEffect(() => {
        dispatch(get_sellers())
    }, [])

    const send = (e) => {
        e.preventDefault();
        
        if (!text.trim() || !sellerId) return;
        
        const messageData = {
            senderId: '', 
            receverId: sellerId,
            message: text,
            senderName: 'Admin Support'
        };
        
        console.log('Admin gửi tin nhắn:', messageData);
        dispatch(send_message_seller_admin(messageData));
        setText('');
    }

    useEffect(() => {
        if (sellerId) {
            dispatch(get_admin_message(sellerId))
        }
    }, [sellerId])

    useEffect(() => {
        socket.on('receved_seller_message', msg => {
             console.log('Nhận tin nhắn từ seller:', msg);
             setReceverMessage(msg);
        });
        
        return () => {
            socket.off('receved_seller_message');
        };
    }, []);

    useEffect(() => {
        if (receverMessage) {
            console.log('Xử lý tin nhắn nhận được:', receverMessage);
            console.log('sellerId hiện tại:', sellerId);
            
            // Kiểm tra nếu tin nhắn từ seller hiện tại đang chọn
            if (receverMessage.senderId === sellerId && receverMessage.receverId === '') {
                console.log('Cập nhật tin nhắn từ seller hiện tại');
                dispatch(updateSellerMessage(receverMessage));
            } 
            // Hiển thị thông báo nếu tin nhắn từ seller khác
            else if (receverMessage.receverId === '') {
                console.log('Thông báo tin nhắn từ seller khác');
                toast.success(receverMessage.senderName + " đã gửi tin nhắn mới");
            }
        }
    }, [receverMessage, sellerId]);

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_message_admin_to_seller', seller_admin_message[seller_admin_message.length - 1])
            dispatch(messageClear())
        }
    }, [successMessage])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth'})
    }, [seller_admin_message])


    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full bg-white rounded-md shadow-md h-[calc(100vh-140px)] overflow-hidden'>
                <div className='flex w-full h-full relative'>
                    {/* Seller List Sidebar */}
                    <div className={`w-[280px] h-full absolute z-10 ${show ? '-left-[16px]' : '-left-[336px]'} md:left-0 md:relative transition-all shadow-md`}>
                        <div className='w-full h-[calc(100vh-177px)] bg-white border-r border-pink-100 overflow-y-auto'>
                            <div className='flex text-xl justify-between items-center p-4 md:p-0 md:px-3 md:pb-3 md:pt-3 text-pink-600 border-b border-pink-100'>
                                <h2 className='font-bold'>Sellers</h2>
                                <span onClick={() => setShow(!show)} className='block cursor-pointer md:hidden'>
                                    <IoMdClose />
                                </span>
                            </div>

                            {sellers.map((s, i) => (
                                <Link 
                                    key={i} 
                                    to={`/admin/dashboard/chat-sellers/${s._id}`} 
                                    className={`h-[70px] flex justify-start gap-3 items-center text-gray-700 px-3 py-2 border-b border-pink-50 hover:bg-pink-50 transition-all cursor-pointer ${sellerId === s._id ? 'bg-pink-100' : ''}`}
                                >
                                    <div className='relative'>
                                        <img 
                                            className='w-[45px] h-[45px] border-white border-2 max-w-[45px] p-[2px] rounded-full object-cover shadow-sm' 
                                            src={s.image} 
                                            alt={s.name} 
                                        />
                                        {activeSeller.some(a => a.sellerId === s._id) && (
                                            <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0 border border-white'></div>
                                        )}
                                    </div>
                            
                                    <div className='flex justify-center items-start flex-col w-full overflow-hidden'>
                                        <div className='flex justify-between items-center w-full'>
                                            <h2 className='text-base font-semibold truncate'>{s.name}</h2>
                                            {activeSeller.some(a => a.sellerId === s._id) ? (
                                                <span className='text-xs text-green-500'>Online</span>
                                            ) : (
                                                <span className='text-xs text-gray-400'>Offline</span>
                                            )}
                                        </div>
                                        <p className='text-sm text-gray-500 truncate w-full'>Tap to chat</p>
                                    </div>
                                </Link>
                            ))}
                        </div> 
                    </div>

                    {/* Chat Area */}
                    <div className='w-full md:w-[calc(100%-280px)] flex flex-col'>
                        {/* Chat Header */}
                        <div className='flex justify-between items-center p-4 border-b border-pink-100 bg-white'>
                            {sellerId && (
                                <div className='flex justify-start items-center gap-3'>
                                    <div className='relative'>
                                        <img 
                                            className='w-[45px] h-[45px] border-pink-200 border-2 max-w-[45px] p-[2px] rounded-full object-cover' 
                                            src={currentSeller?.image} 
                                            alt={currentSeller?.name} 
                                        />
                                        {activeSeller.some(a => a.sellerId === sellerId) && (
                                            <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0 border border-white'></div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className='text-gray-800 font-medium'>{currentSeller?.name}</h3>
                                        {activeSeller.some(a => a.sellerId === sellerId) ? (
                                            <span className='text-xs text-green-500'>Online</span>
                                        ) : (
                                            <span className='text-xs text-gray-400'>Offline</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div 
                                onClick={() => setShow(!show)} 
                                className='w-[40px] h-[40px] flex md:hidden rounded-full bg-pink-500 shadow-md hover:bg-pink-600 justify-center cursor-pointer items-center text-white'
                            >
                                <span><FaList/></span>
                            </div> 
                        </div>

                        {/* Messages */}
                        <div className='flex-grow overflow-hidden'>
                            <div className='bg-gray-50 h-[calc(100vh-290px)] p-4 overflow-y-auto'>
                                {sellerId ? (
                                    seller_admin_message.map((m, i) => {
                                        if (m.senderId === sellerId) {
                                            return (
                                                <div ref={scrollRef} key={i} className='w-full flex justify-start items-center mb-3'>
                                                    <div className='flex justify-start items-start gap-2 max-w-[80%]'>
                                                        <div>
                                                            <img 
                                                                className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[2px]' 
                                                                src={currentSeller?.image || "http://localhost:3001/images/demo.jpg"} 
                                                                alt="" 
                                                            />
                                                        </div>
                                                        <div className='flex justify-center items-start flex-col bg-white text-gray-700 py-2 px-3 rounded-md shadow-sm border border-gray-100'>
                                                            <span className='text-sm'>{m.message}</span>
                                                        </div> 
                                                    </div> 
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div ref={scrollRef} key={i} className='w-full flex justify-end items-center mb-3'>
                                                    <div className='flex justify-start items-start gap-2 max-w-[80%]'>
                                                        <div className='flex justify-center items-start flex-col bg-pink-500 text-white py-2 px-3 rounded-md shadow-sm'>
                                                            <span className='text-sm'>{m.message}</span>
                                                        </div> 
                                                        <div>
                                                            <img 
                                                                className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[2px]' 
                                                                src="http://localhost:3001/images/admin.jpg" 
                                                                alt="" 
                                                            />
                                                        </div>
                                                    </div> 
                                                </div>
                                            )
                                        }
                                    })
                                ) : (
                                    <div className='w-full h-full flex justify-center items-center flex-col gap-2 text-gray-400'>
                                        <span className='text-3xl'><FaRegFaceGrinHearts /></span>
                                        <span className='text-lg'>Select a seller to start chatting</span>
                                    </div>
                                )}
                            </div> 
                        </div>

                        {/* Message Input */}
                        <div className='p-4 border-t border-pink-100 bg-white'>
                            <form onSubmit={send} className='flex gap-3'>
                                <input 
                                    readOnly={!sellerId} 
                                    value={text} 
                                    onChange={(e) => setText(e.target.value)} 
                                    className='w-full px-4 py-2 border border-pink-200 focus:border-pink-500 rounded-md outline-none bg-white text-gray-700 placeholder-gray-400' 
                                    type="text" 
                                    placeholder={sellerId ? 'Type your message...' : 'Select a seller to start chatting'} 
                                />
                                <button 
                                    disabled={!sellerId} 
                                    className='bg-pink-500 hover:bg-pink-600 text-white font-medium px-5 py-2 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>  
                </div> 
            </div>
        </div>
    );
};

export default ChatSeller;