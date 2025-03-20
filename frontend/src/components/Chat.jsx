import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, XCircle } from "lucide-react";

const Chat = () => {
    const [messages, setMessages] = useState([
        { sender: "seller", text: "Hello! How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { sender: "customer", text: input }]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            setMessages((prev) => [...prev, { sender: "seller", text: "Thanks for your message!" }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {chatOpen ? (
                <div className="w-80 bg-white shadow-lg rounded-xl overflow-hidden flex flex-col border border-gray-200">
                    <div className="p-3 bg-blue-600 text-white flex justify-between items-center">
                        <span>Chat with Seller</span>
                        <XCircle className="cursor-pointer" onClick={() => setChatOpen(false)} />
                    </div>
                    <div className="p-3 h-60 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"} my-1`}>
                                <div className={`px-3 py-2 rounded-lg ${msg.sender === "customer" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="text-gray-500 text-sm">Seller is typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 flex border-t">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border p-2 rounded-md focus:outline-none"
                        />
                        <button 
                            onClick={handleSend} 
                            className="ml-2 bg-blue-500 p-2 rounded-md text-white">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setChatOpen(true)} className="bg-blue-500 p-4 rounded-full shadow-lg text-white flex items-center">
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
};

export default Chat;
