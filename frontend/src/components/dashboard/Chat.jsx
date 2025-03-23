import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai'
import { GrEmoji } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom'
import { 
    get_sellers,
    get_seller_messages, 
    get_unread_seller_counts, 
    mark_seller_messages_as_read, 
    messageClear, 
    send_message, 
    updateMessage 
} from '../../store/reducers/chatReducer';
import toast from 'react-hot-toast';
import io from 'socket.io-client'
import {FaList} from 'react-icons/fa'

// Initialize socket.io with connection options
const socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true
});

const Chat = () => {
    const scrollRef = useRef()
    const dispatch = useDispatch()
    const {sellerId} = useParams()
    const {userInfo} = useSelector(state => state.auth)
    const {
        messages,
        currentSeller,
        currentCustomer,
        sellers, 
        sellerUnreadCounts,
        successMessage,
        errorMessage,
        loading
    } = useSelector(state => state.chat)
    
    const [text, setText] = useState('')
    const [receverMessage, setReceverMessage] = useState('')
    const [activeSellers, setActiveSellers] = useState([])
    const [show, setShow] = useState(false)
    
    // Get sellers list and unread messages when component mounts
    useEffect(() => {
        dispatch(get_sellers())
        dispatch(get_unread_seller_counts())
        
        // Set interval to update unread message counts every 30 seconds
        const interval = setInterval(() => {
            dispatch(get_unread_seller_counts())
        }, 30000)
        
        return () => clearInterval(interval)
    }, [dispatch])
    
    // Get messages when selecting a seller
    useEffect(() => {
        if (sellerId) {
            const params = {
                userId: userInfo.id,
                sellerId
            };
            
            dispatch(get_seller_messages(params))
                .then(() => {
                    // Mark messages as read when selecting a seller
                    dispatch(mark_seller_messages_as_read(sellerId));
                })
                .catch((error) => {
                    console.error("Error fetching messages:", error);
                });
        }
    }, [sellerId, userInfo.id, dispatch])

    // Handle sending messages
    const send = () => {
        if (text) {
            // Save message content
            const messageContent = text;
            
            // Prepare data for API and socket
            const messageData = {
                userId: userInfo.id,
                text: messageContent,
                sellerId,
                name: userInfo.name
            };
            
            // Send message through API
            dispatch(send_message(messageData));
            
            // Send message through socket for real-time
            socket.emit('send_message_customer_to_seller', {
                senderId: userInfo.id,
                receverId: sellerId,
                message: messageContent,
                senderName: userInfo.name,
                timestamp: new Date().toISOString()
            });
            
            setText('');
        }
    }

    // Listen for socket events
    useEffect(() => {
        // Event for receiving messages from seller
        socket.on('receved_seller_message', (msg) => {
            // Update state to display message
            setReceverMessage(msg);
            
            // Update unread message counts
            dispatch(get_unread_seller_counts());
        });
        
        // Event for receiving active sellers list
        socket.on('activeSellers', (sellers) => {
            setActiveSellers(sellers);
        });
        
        return () => {
            socket.off('receved_seller_message');
            socket.off('activeSellers');
        };
    }, [dispatch]);

    // Process received messages
    useEffect(() => {
        if (receverMessage) {
            // Check if message is from current seller and to current user
            const isFromCurrentSeller = sellerId === receverMessage.senderId;
            const isToCurrentUser = userInfo.id === receverMessage.receverId;
            
            if (isFromCurrentSeller && isToCurrentUser) {
                // If chatting with sender, update message in the list
                dispatch(updateMessage(receverMessage));
                
                // Mark messages as read since viewing the conversation
                dispatch(mark_seller_messages_as_read(sellerId));
            } else if (isToCurrentUser) {
                // If message is to user but not from current seller
                toast.success(`${receverMessage.senderName || 'Seller'} sent a new message`);
                
                // Update unread message counts
                dispatch(get_unread_seller_counts());
            }
            
            // Reset received message variable
            setReceverMessage('');
        }
    }, [receverMessage, sellerId, userInfo.id, dispatch]);
    
    // Scroll to latest message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth'})
    }, [messages])

    // Display success/error notifications
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    // Connect to socket.io when component mounts
    useEffect(() => {
        // Connect and register customer with socket
        if (userInfo?.id) {
            // Backend expects: socket.on('add_customer', (customerId, customerInfo) => {
            const customerId = userInfo.id;
            const customerInfo = {
                name: userInfo.name,
                image: userInfo.image
            };
            
            socket.emit('add_customer', customerId, customerInfo);
            
            // When component unmounts, logout from socket
            return () => {
                socket.disconnect();
            };
        }
    }, [userInfo]);

    // Debug socket connection
    useEffect(() => {
        // Connection event
        socket.on('connect', () => {
            // Register customer when connection is successful
            if (userInfo?.id) {
                const customerId = userInfo.id;
                const customerInfo = {
                    name: userInfo.name,
                    image: userInfo.image
                };
                socket.emit('add_customer', customerId, customerInfo);
            }
        });

        // Error event
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Disconnect event
        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        // Reconnect event
        socket.on('reconnect', (attemptNumber) => {
            // Re-register customer on reconnection
            if (userInfo?.id) {
                const customerId = userInfo.id;
                const customerInfo = {
                    name: userInfo.name,
                    image: userInfo.image
                };
                socket.emit('add_customer', customerId, customerInfo);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('reconnect');
        };
    }, [userInfo]);

    return (
        <div className='bg-white p-3 rounded-md flex'>
            <div className={`w-[230px] md-lg:absolute bg-white md-lg:h-full -left-[350px] ${show ? '-left-0' : '-left-[350px]'}`}>
                <div className='flex justify-center gap-3 items-center text-slate-600 text-xl h-[50px]'>
                    <span><AiOutlineMessage /></span>
                    <span>Messages</span>
                </div>
                <div className='w-full flex flex-col text-slate-600 py-4 h-[400px] pr-3 overflow-y-auto'>
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                        </div>
                    ) : sellers && sellers.length > 0 ? (
                        sellers.map((seller, i) => (
                            <Link 
                                to={`/dashboard/chat/${seller.sellerId}`} 
                                key={i}  
                                className={`flex gap-2 justify-start items-center pl-2 py-[5px] hover:bg-gray-100 rounded relative ${
                                    sellerId === seller.sellerId ? 'bg-blue-50' : ''
                                }`} 
                            >
                                <div className='w-[30px] h-[30px] rounded-full relative'>
                                    {activeSellers.some(s => s.sellerId === seller.sellerId) && (
                                        <div className='w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0'></div>
                                    )}
                                    <img 
                                        src={seller.image || '/images/seller.png'} 
                                        alt={seller.name} 
                                        className="w-full h-full rounded-full"
                                    />
                                </div>
                                <span>{seller.shopName || seller.name}</span>
                                
                                {/* Unread messages badge */}
                                {sellerUnreadCounts && sellerUnreadCounts[seller.sellerId] > 0 && (
                                    <div className="absolute right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {sellerUnreadCounts[seller.sellerId]}
                                    </div>
                                )}
                            </Link>
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            <p>No conversations yet</p>
                        </div>
                    )}
                </div>
            </div>

            <div className='w-[calc(100%-230px)] md-lg:w-full'>
                {sellerId && currentSeller ? (
                    <div className='w-full h-full'>
                        <div className='flex justify-between gap-3 items-center text-slate-600 text-xl h-[50px]'>
                            <div className='flex gap-2 items-center'>
                                <div className='w-[30px] h-[30px] rounded-full relative'>
                                    {activeSellers.some(s => s.sellerId === sellerId) && (
                                        <div className='w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0'></div>
                                    )}
                                    <img 
                                        src={currentSeller.image || '/images/seller.png'} 
                                        alt={currentSeller.name}
                                        className="w-full h-full rounded-full"
                                    />
                                </div>
                                <div>
                                    <span className="font-medium">{currentSeller.shopName || currentSeller.name}</span>
                                </div>
                            </div>

                            <div 
                                onClick={() => setShow(!show)} 
                                className='w-[35px] h-[35px] hidden md-lg:flex cursor-pointer rounded-sm justify-center items-center bg-blue-500 text-white'
                            >
                                <FaList/>
                            </div>      
                        </div>
                        
                        <div className='h-[400px] w-full bg-slate-100 p-3 rounded-md'>
                            <div className='w-full h-full overflow-y-auto flex flex-col gap-3'>
                                {loading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <p>Start a conversation with the seller</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isSender = msg.senderId === userInfo.id;
                                        
                                        return (
                                            <div 
                                                ref={i === messages.length - 1 ? scrollRef : null}
                                                key={i} 
                                                className={`w-full flex gap-2 ${isSender ? 'justify-end' : 'justify-start'} items-center text-[14px]`}
                                            >
                                                {!isSender && (
                                                    <img 
                                                        className='w-[30px] h-[30px] rounded-full' 
                                                        src={currentSeller?.image || '/images/seller.png'} 
                                                        alt="seller" 
                                                    />
                                                )}
                                                <div className={`p-2 ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-md max-w-[70%] break-words`}>
                                                    <span>{msg.message}</span>
                                                </div>
                                                {isSender && (
                                                    <img 
                                                        className='w-[30px] h-[30px] rounded-full' 
                                                        src={currentCustomer?.image || userInfo.image || '/images/user.png'} 
                                                        alt="user" 
                                                    />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        
                        <div className='flex p-2 justify-between items-center w-full'>
                            <div className='w-[40px] h-[40px] border p-2 justify-center items-center flex rounded-full'>
                                <label className='cursor-pointer' htmlFor=""><AiOutlinePlus /></label>
                                <input className='hidden' type="file" />
                            </div>
                            <div className='border h-[40px] p-0 ml-2 w-[calc(100%-90px)] rounded-full relative'>
                                <input 
                                    value={text} 
                                    onChange={(e) => setText(e.target.value)} 
                                    onKeyPress={(e) => e.key === 'Enter' && send()}
                                    type="text" 
                                    placeholder='Type a message...' 
                                    className='w-full rounded-full h-full outline-none p-3' 
                                />
                                <div className='text-2xl right-2 top-2 absolute cursor-auto'>
                                    <span><GrEmoji /></span>
                                </div>
                            </div>
                            <div className='w-[40px] p-2 justify-center items-center rounded-full'>
                                <div onClick={send} className='text-2xl cursor-pointer text-blue-500'>
                                    <IoSend />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => setShow(true)} className='w-full h-[400px] flex justify-center items-center text-lg font-medium text-slate-600'>
                        <span>Select a seller to start a conversation</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;