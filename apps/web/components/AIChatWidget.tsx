'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import getApi from '@/services/api';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: 'Hola! Sóc el teu assistent virtual. En què et puc ajudar avui?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleClearChat = () => {
        setMessages([
            {
                id: 'welcome',
                text: 'Hola! Sóc el teu assistent virtual. En què et puc ajudar avui?',
                sender: 'ai',
                timestamp: new Date()
            }
        ]);
    };

    const handleSendMessage = async (e?: FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        const api = getApi();

        try {
            const response = await api.post('/chat', { message: userMessage.text });

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data.response,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Ho sento, hi ha hagut un error en connectar amb el servidor.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            <div
                className={`bg-white shadow-2xl border border-gray-100 w-80 md:w-96 mb-6 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none h-0'
                    }`}
                style={{ maxHeight: '600px', height: '500px' }}
            >
                {/* Header */}
                <div className="bg-white p-6 border-b border-[#EAEFF2] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#00426B] flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-black text-xs text-[#00426B] uppercase tracking-widest leading-none mb-1">Assistent</h3>
                            <p className="text-[10px] font-bold text-[#0775AB] uppercase tracking-wider">Iter Virtual</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClearChat}
                            className="p-2 text-gray-300 hover:text-[#00426B] hover:bg-[#F2F2F3] transition-all"
                            title="Netejar xat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-300 hover:text-[#f26178] hover:bg-red-50 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth cursor-default">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] p-4 text-xs font-bold leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-[#00426B] text-white'
                                    : 'bg-[#F8FAFC] text-[#00426B] border border-gray-100'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-[#F8FAFC] border border-gray-100 p-4 shadow-sm flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-[#00426B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1 h-1 bg-[#00426B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1 h-1 bg-[#00426B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-[#EAEFF2] shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="ESCRIU AQUÍ..."
                            className="w-full pl-5 pr-14 py-4 bg-[#F8FAFC] border border-gray-200 focus:border-[#00426B] focus:bg-white text-xs font-bold text-[#00426B] placeholder:text-gray-300 outline-none transition-all uppercase tracking-wide"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#00426B] hover:bg-[#0775AB] text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110 border-4 ${isOpen
                    ? 'bg-[#00426B] text-white border-[#00426B] rotate-90'
                    : 'bg-white text-[#00426B] border-[#EAEFF2] hover:border-[#0775AB]'
                    }`}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
