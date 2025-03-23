import React, { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { GrEmoji } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { send_message, messageClear, updateMessage } from "../store/reducers/chatReducer";
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import api from "../api/api";

// Initialize socket connection
const socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
});

const ProductChat = ({ sellerId, sellerInfo, productId, productName, onClose }) => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { fb_messages, successMessage, error } = useSelector(state => state.chat);
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sellerOnline, setSellerOnline] = useState(false);
    const scrollRef = useRef();
    
    // Debug info
    console.log("ProductChat - Props:", { 
        sellerId, 
        sellerInfo, 
        productId, 
        productName,
        userInfo: userInfo ? { id: userInfo.id, name: userInfo.name } : null
    });
    
    // Normalize sellerId (object or string)
    const getSellerIdValue = () => {
        if (typeof sellerId === 'object') {
            return sellerId?._id || sellerId?.id || '';
        }
        return sellerId || '';
    };
    
    const sellerIdValue = getSellerIdValue();
    
    // Register with socket on mount
    useEffect(() => {
        if (userInfo?.id) {
            console.log(`Registering user ${userInfo.id} with socket`);
            socket.emit('add_customer', userInfo.id, {
                name: userInfo.name || 'Customer',
                image: userInfo.image || 'http://localhost:3000/images/user.png'
            });
        }
        
        return () => {
            console.log("ProductChat component unmounting");
        };
    }, []);

    // Fetch previous messages
    useEffect(() => {
        const getMessages = async () => {
            try {
                if (!userInfo?.id || !sellerIdValue) {
                    console.error("Missing user or seller ID", { userId: userInfo?.id, sellerId: sellerIdValue });
                    setLoading(false);
                    return;
                }
                
                console.log(`Fetching messages between user ${userInfo.id} and seller ${sellerIdValue}`);
                const { data } = await api.get(`/chat/get-messages/${userInfo.id}/${sellerIdValue}`);
                
                if (data && data.messages) {
                    console.log(`Got ${data.messages.length} messages`);
                    setMessages(data.messages);
                } else {
                    console.log("No messages found");
                    setMessages([]);
                }
            } catch (error) {
                console.error("Error fetching messages:", error.response?.data || error.message);
                toast.error("Failed to load messages");
            } finally {
                setLoading(false);
            }
        };
        
        getMessages();
    }, [userInfo, sellerIdValue]);

    // Socket listeners for messages and online status
    useEffect(() => {
        console.log(`Setting up socket listeners for seller: ${sellerIdValue}`);
        
        // Listen for messages from seller
        socket.on('receved_seller_message', (message) => {
            console.log('Message from seller received:', message);
            
            if (!message) return;
            
            // Debug message format
            console.log('Comparing IDs:');
            console.log(`- Message sender: ${message.senderId} (${typeof message.senderId})`);
            console.log(`- Expected seller: ${sellerIdValue} (${typeof sellerIdValue})`);
            console.log(`- Message receiver: ${message.receverId} (${typeof message.receverId})`);
            console.log(`- Current user: ${userInfo?.id} (${typeof userInfo?.id})`);
            
            // Use string comparison to avoid type issues
            if (String(message.senderId) === String(sellerIdValue) && 
                String(message.receverId) === String(userInfo?.id)) {
                console.log('✅ Message matches current conversation');
                
                // Add message to state
                setMessages(prev => [...prev, {
                    ...message,
                    senderId: message.senderId,
                    receverId: message.receverId,
                    message: message.message || ''
                }]);
                
                toast.success(`New message from ${message.senderName || 'Seller'}`);
            } else {
                console.log('❌ Message does not match current conversation');
            }
        });

        // Check seller online status
        socket.on('activeSellers', (sellers) => {
            const isOnline = sellers.some(s => String(s.sellerId) === String(sellerIdValue));
            console.log(`Seller ${sellerIdValue} online status: ${isOnline}`);
            setSellerOnline(isOnline);
        });

        return () => {
            socket.off('receved_seller_message');
            socket.off('activeSellers');
        };
    }, [sellerIdValue, userInfo]);

    // Scroll to latest message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle successful message sending
    useEffect(() => {
        if (successMessage) {
            console.log("Message sent successfully");
            dispatch(messageClear());
        }
    }, [successMessage, dispatch]);

    // Handle errors from message sending
    useEffect(() => {
        if (error) {
            console.error("Error sending message:", error);
            toast.error(typeof error === 'string' ? error : "Lỗi khi gửi tin nhắn");
            dispatch(messageClear());
        }
    }, [error, dispatch]);

    // Send message handler
    const handleSendMessage = () => {
        if (!text.trim()) return;
        
        try {
            if (!sellerIdValue) {
                toast.error("Cannot determine seller ID");
                return;
            }
            
            if (!userInfo?.id) {
                toast.error("Please login to send messages");
                return;
            }
            
            // Add message to local state first for immediate feedback
            const tempMessage = {
                _id: `temp-${Date.now()}`,
                senderId: userInfo.id,
                receverId: sellerIdValue,
                message: text,
                senderName: userInfo.name,
                productId,
                productName,
                createdAt: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, tempMessage]);
            
            // Send to server
            const messageData = {
                userId: userInfo.id,
                text,
                sellerId: sellerIdValue,
                name: userInfo.name || "Customer",
                productId,
                productName
            };
            
            console.log("Sending message:", messageData);
            
            // Send via API
            dispatch(send_message(messageData));
            
            // Send directly via socket for real-time
            socket.emit('send_product_message_customer_to_seller', {
                senderId: userInfo.id,
                receverId: sellerIdValue,
                message: text,
                productId,
                productName,
                senderName: userInfo.name || "Customer"
            });
            
            setText('');
        } catch (err) {
            console.error("Error in handleSendMessage:", err);
            toast.error("Có lỗi xảy ra khi gửi tin nhắn");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-0 right-5 z-50 w-[350px] bg-white rounded-t-lg shadow-lg border border-gray-300">
            {/* Header with seller info */}
            <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full relative">
                        {sellerOnline && (
                            <div className="w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0"></div>
                        )}
                        <img 
                            src={sellerInfo?.avatar || sellerInfo?.image || 'http://localhost:3000/images/seller.png'} 
                            alt="Seller" 
                            className="w-full h-full rounded-full"
                        />
                    </div>
                    <div>
                        <div className="font-semibold">{sellerInfo?.shopName || sellerInfo?.name || "Seller"}</div>
                    </div>
                </div>
                <button className="text-white" onClick={onClose}>
                    <IoMdClose size={20} />
                </button>
            </div>

            {/* Messages container */}
            <div className="h-[300px] overflow-y-auto p-3 bg-slate-50" id="messages-container">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>Start a conversation with the seller</p>
                        <p className="text-sm">About product: {productName}</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        // Compare as strings to avoid type issues
                        const isCurrentUserSender = String(msg.senderId) === String(userInfo?.id);
                        
                        return (
                            <div 
                                ref={i === messages.length - 1 ? scrollRef : null}
                                key={i} 
                                className={`flex gap-2 my-2 ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isCurrentUserSender && (
                                    <img 
                                        src={sellerInfo?.avatar || sellerInfo?.image || 'http://localhost:3000/images/seller.png'} 
                                        alt="Seller" 
                                        className="w-[30px] h-[30px] rounded-full"
                                    />
                                )}
                                <div 
                                    className={`p-2 rounded-lg max-w-[70%] break-words ${
                                        isCurrentUserSender 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    {msg.message}
                                    {msg.productId && (
                                        <div className="text-xs mt-1 italic">
                                            Product: {msg.productName || 'Unknown'}
                                        </div>
                                    )}
                                </div>
                                {isCurrentUserSender && (
                                    <img 
                                        src={userInfo?.image || 'http://localhost:3000/images/user.png'} 
                                        alt="You" 
                                        className="w-[30px] h-[30px] rounded-full"
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input box */}
            <div className="p-3 border-t flex items-center gap-2">
                <input 
                    type="text" 
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..." 
                    value={text} 
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
                    aria-label="Send message"
                >
                    <IoSend size={20} />
                </button>
            </div>
        </div>
    );
};

export default ProductChat; 