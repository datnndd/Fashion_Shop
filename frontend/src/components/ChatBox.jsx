import { useState, useRef, useEffect } from 'react';

const WEBHOOK_URL = 'https://n8n.postiznguyendoandat.click/webhook/54cec83b-2fb7-44a6-b253-9d3e51b08bd9';

const generateSessionId = () => {
    const randomSegment = Math.random().toString(16).slice(2);
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `session-${Date.now()}-${randomSegment}`;
};

const loadSessionId = () => {
    if (typeof window === 'undefined') return '';

    const existing = window.localStorage.getItem('chatSessionId');
    if (existing) return existing;

    const newId = generateSessionId();
    window.localStorage.setItem('chatSessionId', newId);
    return newId;
};

const ChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState(loadSessionId);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Chào bạn. Tôi là BasicColorAI, tôi có thể giúp gì cho bạn?',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!sessionId) {
            const newId = loadSessionId();
            setSessionId(newId);
        }
    }, [sessionId]);

    const refreshSessionId = () => {
        const newId = generateSessionId();
        setSessionId(newId);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('chatSessionId', newId);
        }
        return newId;
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const activeSessionId = sessionId || loadSessionId();
        if (!sessionId && activeSessionId) {
            setSessionId(activeSessionId);
        }

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: activeSessionId,
                    message: userMessage.text,
                    timestamp: userMessage.timestamp.toISOString(),
                    conversationHistory: messages.map((m) => ({
                        role: m.type === 'user' ? 'user' : 'assistant',
                        content: m.text,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Không thể kết nối đến server');
            }

            const data = await response.json();
            const botReply =
                data?.response ||
                data?.message ||
                data?.output ||
                (Array.isArray(data) ? data[0]?.response || data[0]?.message || data[0]?.output : null) ||
                'Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn không?';

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: botReply,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewChat = () => {
        refreshSessionId();
        setMessages([
            {
                id: Date.now(),
                type: 'bot',
                text: 'Chào bạn. Tôi là BasicColorAI, tôi có thể giúp gì cho bạn?',
                timestamp: new Date(),
            },
        ]);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#C07B5F] to-[#8B5A3C] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
            >
                {isOpen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                )}

                {/* Notification pulse */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] transition-all duration-300 transform ${isOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <div className="bg-[#1F1B18] border border-[#3D3530] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#2B2520] to-[#3D3530] px-5 py-4 border-b border-[#3D3530]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C07B5F] to-[#8B5A3C] flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">BasicColorAI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[#B5A69A] text-xs">Đang hoạt động</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleNewChat}
                                className="text-[#B5A69A] hover:text-white transition-colors p-2 hover:bg-[#3D3530] rounded-lg"
                                title="Cuộc trò chuyện mới"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px] bg-[#1a1714]">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.type === 'user'
                                        ? 'bg-gradient-to-br from-[#C07B5F] to-[#A66A51] text-white rounded-br-md'
                                        : 'bg-[#2B2520] text-white border border-[#3D3530] rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                    <p
                                        className={`text-[10px] mt-1.5 ${message.type === 'user' ? 'text-white/70' : 'text-[#B5A69A]'
                                            }`}
                                    >
                                        {formatTime(message.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#2B2520] border border-[#3D3530] rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-[#C07B5F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-[#C07B5F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-[#C07B5F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-[#3D3530] bg-[#2B2520]">
                        <div className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                disabled={isLoading}
                                className="flex-1 bg-[#1F1B18] border border-[#3D3530] rounded-xl px-4 py-3 text-white text-sm placeholder-[#B5A69A] focus:outline-none focus:border-[#C07B5F] focus:ring-1 focus:ring-[#C07B5F]/30 transition-all disabled:opacity-50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C07B5F] to-[#8B5A3C] text-white flex items-center justify-center hover:shadow-lg hover:shadow-[#C07B5F]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[#B5A69A] text-[10px] mt-2 text-center">
                            Powered by BasicColorAI • Fashion Shop Assistant
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatBox;
