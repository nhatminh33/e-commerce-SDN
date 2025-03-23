import React, { useEffect, useRef, useState } from 'react';
import { FaList } from 'react-icons/fa6';
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { get_customer_message, get_customers, messageClear, send_message, updateMessage, get_unread_counts, mark_as_read } from '../../store/Reducers/chatReducer';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { BsTag } from "react-icons/bs";

const socket = io('http://localhost:5000');

const SellerToCustomer = () => {

    const scrollRef = useRef()

    const [show, setShow] = useState(false) 
    const sellerId = 65
    const {userInfo } = useSelector(state => state.auth)
    const {customers, messages, currentCustomer, successMessage, unreadCounts } = useSelector(state => state.chat)
    const [text,setText] = useState('')
    const [receverMessage,setReceverMessage] = useState('')
    const [activeCustomers, setActiveCustomers] = useState([]);
    const [productMessages, setProductMessages] = useState([]);

    const { customerId } =  useParams()

    const dispatch = useDispatch()

    useEffect(() => {
        // Register seller when component mounts
        const sellerId = userInfo.id;
        const sellerInfo = {
            name: userInfo.name,
            shopName: userInfo.shopInfo?.shopName,
            image: userInfo.image || 'http://localhost:3000/images/user.png'
        };
        
        socket.emit('add_seller', sellerId, sellerInfo);
        
        // Get customers list and unread message counts
        dispatch(get_customers());
        dispatch(get_unread_counts());
        
        // Handle unmount
        return () => {
            socket.disconnect();
        };
    }, [userInfo.id]);

    // Debug socket connection
    useEffect(() => {
        // Connection event
        socket.on('connect', () => {
            // Re-register seller when connection is successful
            if (userInfo?.id) {
                socket.emit('add_seller', userInfo.id, {
                    name: userInfo.name,
                    shopName: userInfo.shopInfo?.shopName,
                    image: userInfo.image || 'http://localhost:3000/images/user.png'
                });
            }
        });
        
        // Reconnect event
        socket.on('reconnect', (attemptNumber) => {
            // Re-register seller on reconnection
            if (userInfo?.id) {
                socket.emit('add_seller', userInfo.id, {
                    name: userInfo.name,
                    shopName: userInfo.shopInfo?.shopName,
                    image: userInfo.image || 'http://localhost:3000/images/user.png'
                });
            }
        });
        
        return () => {
            socket.off('connect');
            socket.off('reconnect');
        };
    }, [userInfo]);

    // Update unread message counts every minute
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(get_unread_counts());
        }, 60000); // 60 seconds
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (customerId) {
            dispatch(get_customer_message({ customerId: customerId }));
            // Mark messages as read when opening conversation
            dispatch(mark_as_read(customerId));
        }
    }, [customerId])

    const send = (e) => {
        e.preventDefault() 
        if(!text.trim()) {
            return toast.error('Please enter a message');
        }
        if(!customerId) {
            return toast.error('Please select a customer to send a message');
        }
        
        // Save message content before sending
        const messageContent = text;
        
        dispatch(send_message({
            customerId: customerId,
            message: messageContent,
            senderName: userInfo.name
        }))
        
        // Save message for socket use
        window.lastSentMessage = messageContent;
        
        setText('') 
    }
 
    useEffect(() => {
        // Listen for active customers
        socket.on('activeCustomers', (customers) => {
            setActiveCustomers(customers);
        });

        // Listen for product messages from customers
        socket.on('receved_product_message', (message) => {
            setReceverMessage(message);
            // Add new product message to list
            if (message.productId && message.productName) {
                setProductMessages(prev => [...prev, {
                    ...message,
                    time: new Date().toLocaleTimeString()
                }]);

                toast.success(`${message.senderName || 'Customer'} sent a message about product ${message.productName}`);
                
                // Update unread message counts
                dispatch(get_unread_counts());
            }
        });
        
        // Listen for regular messages from customers
        socket.on('receved_customer_message', (message) => {
            setReceverMessage(message);
            
            // Show notification and update unread counts
            toast.success(`${message.senderName || 'Customer'} sent a new message`);
            dispatch(get_unread_counts());
        });

        return () => {
            socket.off('activeCustomers');
            socket.off('receved_product_message');
            socket.off('receved_customer_message');
        };
    }, [])

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_message_seller_to_customer', {
                senderId: userInfo.id, 
                receverId: customerId,
                message: window.lastSentMessage || "Empty message",
                senderName: userInfo.name,
                // Add timestamp for debugging
                timestamp: new Date().toISOString()
            });
            
            // Clear saved message after sending
            window.lastSentMessage = null;
            dispatch(messageClear())
        }
    },[successMessage])

    useEffect(() => {
        if (receverMessage) {
            if (customerId === receverMessage.senderId && userInfo.id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage))
                // Mark messages as read if viewing conversation with sender
                dispatch(mark_as_read(customerId));
            } else {
                toast.success(`${receverMessage.senderName || 'Customer'} sent a new message`)
                // Update unread message counts
                dispatch(get_unread_counts());
                dispatch(messageClear())
            }
        }
    },[receverMessage])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth'})
    },[messages])


    return (
    <div className='px-2 lg:px-7 py-5'>
        <div className='w-full bg-[#6a5fdf] px-4 py-4 rounded-md h-[calc(100vh-140px)]'>
        <div className='flex w-full h-full relative'>
    
    <div className={`w-[280px] h-full absolute z-10 ${show ? '-left-[16px]' : '-left-[336px]'} md:left-0 md:relative transition-all `}>
        <div className='w-full h-[calc(100vh-177px)] bg-[#9e97e9] md:bg-transparent overflow-y-auto'>
        <div className='flex text-xl justify-between items-center p-4 md:p-0 md:px-3 md:pb-3 text-white'>
        <h2>Customers</h2>
        <span onClick={() => setShow(!show)} className='block cursor-pointer md:hidden'><IoMdClose /> </span>
       </div>


        {
            customers.map((c,i) => <Link key={i} to={`/seller/dashboard/chat-customer/${c.fdId}`} className={`h-[60px] flex justify-start gap-2 items-center text-white px-2 py-2 rounded-md cursor-pointer bg-[#8288ed] relative ${customerId === c.fdId ? 'bg-[#7577d1]' : ''} `}>
            <div className='relative'>
             <img className='w-[38px] h-[38px] border-white border-2 max-w-[38px] p-[2px] rounded-full' src={c.image} alt="" />
             {activeCustomers.find(ac => ac.customerId === c.fdId) && (
                <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0'></div>
             )}
            </div>
    
            <div className='flex justify-center items-start flex-col w-full'>
                <div className='flex justify-between items-center w-full'>
                    <h2 className='text-base font-semibold'>{c.name}</h2>
                </div> 
            </div>
            
            {/* Unread messages badge */}
            {unreadCounts && unreadCounts[c.fdId] && unreadCounts[c.fdId] > 0 && (
                <div className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
                    {unreadCounts[c.fdId] > 99 ? '99+' : unreadCounts[c.fdId]}
                </div>
            )}
            
           </Link>  )
        }
       


      

 
 

        </div> 
    </div>

    <div className='w-full md:w-[calc(100%-200px)] md:pl-4'>
        <div className='flex justify-between items-center'>
            {
                sellerId && <div className='flex justify-start items-center gap-3'>
           <div className='relative'>
         <img className='w-[45px] h-[45px] border-green-500 border-2 max-w-[45px] p-[2px] rounded-full' src="http://localhost:3001/images/demo.jpg" alt="" />
         <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0'></div>
        </div>
        <h2 className='text-base text-white font-semibold'>{currentCustomer.name}</h2>

                </div>
            } 

            <div onClick={()=> setShow(!show)} className='w-[35px] flex md:hidden h-[35px] rounded-sm bg-blue-500 shadow-lg hover:shadow-blue-500/50 justify-center cursor-pointer items-center text-white'>
                <span><FaList/> </span>
            </div> 
        </div>

        <div className='py-4'>
            <div className='bg-[#475569] h-[calc(100vh-290px)] rounded-md p-3 overflow-y-auto'>
           
    {
        customerId ? messages.map((m,i) => {
            if (m.senderId === customerId) {
                return (
                    <div key={i} ref={scrollRef} className='w-full flex justify-start items-center'>
                    <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
                        <div>
                            <img className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' src={currentCustomer.image} alt="" />
                        </div>
                        <div className='flex justify-center items-start flex-col w-full bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-1 px-2 rounded-sm'>
                        <span>{m.message} </span>
                        {m.productId && m.productName && (
                            <div className="flex items-center gap-1 text-xs text-slate-300 mt-1">
                                <BsTag />
                                <span>Product: {m.productName}</span>
                            </div>
                        )}
                        </div> 
                    </div> 
                </div>
                )
            } else {
                return ( 
                    <div key={i} ref={scrollRef} className='w-full flex justify-end items-center'>
                    <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
                        
                        <div className='flex justify-center items-start flex-col w-full bg-red-500 shadow-lg shadow-red-500/50 text-white py-1 px-2 rounded-sm'>
                        <span>{m.message} </span>
                        </div> 
                        <div>
                            <img className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' src="http://localhost:3001/images/admin.jpg" alt="" />
                        </div>

                    </div> 
                </div>
                )
            }
        }) : <div className='w-full h-full flex justify-center items-center text-white gap-2 flex-col'>
            <span>Select Customer </span>
        </div>
    }

 


             

            </div> 
        </div>

        <form onSubmit={send} className='flex gap-3'>
            <input value={text} onChange={(e) => setText(e.target.value)} className='w-full flex justify-between px-2 border border-slate-700 items-center py-[5px] focus:border-blue-500 rounded-md outline-none bg-transparent text-[#d0d2d6]' type="text" placeholder='Input Your Message' />
            <button className='shadow-lg bg-[#06b6d4] hover:shadow-cyan-500/50 text-semibold w-[75px] h-[35px] rounded-md text-white flex justify-center items-center'>Send</button>

        </form>




    </div>  

        </div> 

        </div>
        
    </div>
    );
};

export default SellerToCustomer;