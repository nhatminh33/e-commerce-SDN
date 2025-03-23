import React, { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { GrEmoji } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { send_message, messageClear, updateMessage } from "../store/reducers/chatReducer";
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import api from "../api/api";

const socket = io('http://localhost:5000');

const ProductChat = ({ sellerId, sellerInfo, productId, productName, onClose }) => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { fb_messages, successMessage } = useSelector(state => state.chat);
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sellerOnline, setSellerOnline] = useState(false);
    const scrollRef = useRef();

    // Lấy tin nhắn cũ giữa user và seller
    useEffect(() => {
        const getMessages = async () => {
            try {
                if (userInfo && sellerId) {
                    const { data } = await api.get(`/chat/get-messages/${userInfo.id}/${sellerId}`);
                    if (data && data.messages) {
                        setMessages(data.messages);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy tin nhắn:", error);
            } finally {
                setLoading(false);
            }
        };
        
        getMessages();
    }, [userInfo, sellerId]);

    // Kết nối socket
    useEffect(() => {
        if (userInfo && userInfo.id) {
            socket.emit('add_customer', userInfo.id, {
                name: userInfo.name,
                image: userInfo.image || 'http://localhost:3000/images/user.png'
            });
        }

        return () => {
            // Ngắt kết nối khi component unmount
            socket.off('receved_seller_message');
            socket.off('activeSellers');
        };
    }, [userInfo]);

    // Lắng nghe tin nhắn và trạng thái online từ socket
    useEffect(() => {
        socket.on('receved_seller_message', (message) => {
            console.log('Nhận tin nhắn từ seller qua socket:', message);
            
            // Kiểm tra đầy đủ dữ liệu message
            if (!message) {
                console.error('Nhận được tin nhắn rỗng');
                return;
            }
            
            console.log('Đang kiểm tra tin nhắn. SellerId:', sellerId, 'UserId:', userInfo?.id);
            
            if (message.senderId === sellerId && message.receverId === userInfo?.id) {
                console.log('Tin nhắn hợp lệ, thêm vào danh sách');
                setMessages(prev => [...prev, message]);
                
                // Hiển thị thông báo
                toast.success(`Tin nhắn mới từ ${message.senderName || 'Người bán'}`);
            } else {
                console.log('Tin nhắn không khớp với cuộc trò chuyện hiện tại');
            }
        });

        socket.on('activeSellers', (sellers) => {
            const isSellerOnline = sellers.some(s => s.sellerId === sellerId);
            setSellerOnline(isSellerOnline);
        });

        return () => {
            socket.off('receved_seller_message');
            socket.off('activeSellers');
        };
    }, [sellerId, userInfo]);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Xử lý khi thêm tin nhắn thành công
    useEffect(() => {
        if (successMessage) {
            const lastMessage = fb_messages[fb_messages.length - 1];
            if (lastMessage) {
                setMessages(prev => [...prev, lastMessage]);
                
                // Gửi tin nhắn qua socket
                socket.emit('send_product_message_customer_to_seller', {
                    senderId: userInfo.id,
                    receverId: sellerId,
                    message: lastMessage.message,
                    productId: productId,
                    productName: productName,
                    senderName: userInfo.name
                });
            }
            dispatch(messageClear());
        }
    }, [successMessage, fb_messages]);

    const handleSendMessage = () => {
        if (!text.trim()) return;
        
        // Đảm bảo sellerId là chuỗi, không phải đối tượng
        const sellerIdValue = typeof sellerId === 'object' ? 
            (sellerId._id || '') : 
            sellerId;
            
        if (!sellerIdValue) {
            toast.error("Không thể xác định người bán");
            return;
        }
        
        const messageData = {
            userId: userInfo.id,
            text,
            sellerId: sellerIdValue,
            name: userInfo.name || "Customer", // Đảm bảo có senderName
            productId,
            productName
        };
        
        console.log("Sending message data:", messageData);
        
        dispatch(send_message(messageData));
        
        setText('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-0 right-5 z-50 w-[350px] bg-white rounded-t-lg shadow-lg border border-gray-300">
            <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full relative">
                        {sellerOnline && (
                            <div className="w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0"></div>
                        )}
                        <img 
                            src={sellerInfo?.avatar || 'http://localhost:3000/images/user.png'} 
                            alt="Seller" 
                            className="w-full h-full rounded-full"
                        />
                    </div>
                    <div>
                        <div className="font-semibold">{sellerInfo?.shopName || "Người bán"}</div>
                        <div className="text-xs">{sellerOnline ? 'Đang hoạt động' : 'Không hoạt động'}</div>
                    </div>
                </div>
                <button className="text-white" onClick={onClose}>
                    <IoMdClose size={20} />
                </button>
            </div>

            <div className="h-[300px] overflow-y-auto p-3 bg-slate-50">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>Bắt đầu cuộc trò chuyện với người bán</p>
                        <p className="text-sm">Về sản phẩm: {productName}</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div 
                            ref={i === messages.length - 1 ? scrollRef : null}
                            key={i} 
                            className={`flex gap-2 my-2 ${msg.senderId === userInfo.id ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.senderId !== userInfo.id && (
                                <img 
                                    src={sellerInfo?.avatar || 'http://localhost:3000/images/user.png'} 
                                    alt="User" 
                                    className="w-[30px] h-[30px] rounded-full"
                                />
                            )}
                            <div 
                                className={`p-2 rounded-lg max-w-[70%] break-words ${
                                    msg.senderId === userInfo.id 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {msg.message}
                            </div>
                            {msg.senderId === userInfo.id && (
                                <img 
                                    src={userInfo.image || 'http://localhost:3000/images/user.png'} 
                                    alt="User" 
                                    className="w-[30px] h-[30px] rounded-full"
                                />
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 border-t flex items-center gap-2">
                <input 
                    type="text" 
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tin nhắn..." 
                    value={text} 
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
                >
                    <IoSend size={20} />
                </button>
            </div>
        </div>
    );
};

export default ProductChat; 