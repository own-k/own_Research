import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';

interface Props {
  contextText: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<Props> = ({ contextText, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputMsg.trim()) return;
    const userMsg = inputMsg;
    setInputMsg('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        const response = await geminiService.sendChatMessage(history, userMsg, contextText);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: "Connection error." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const renderText = (text: string) => {
      // Split by ** to find bold parts
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  return (
    <div 
        className={`fixed top-20 right-8 w-80 md:w-96 bg-surface border border-line rounded-3xl shadow-2xl z-40 flex flex-col transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) origin-top-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`} 
        style={{ height: 'calc(100vh - 120px)', maxHeight: '600px' }}
    >
        {/* Header */}
        <div className="p-4 border-b border-line flex justify-between items-center bg-surface rounded-t-3xl">
            <span className="font-sans font-semibold text-sm text-main tracking-wide pl-2">Research Assistant</span>
            <div className="flex items-center gap-3">
                 <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-accent animate-pulse' : 'bg-green-500'}`}></span>
                 <button onClick={onClose} className="text-muted hover:text-main p-1 rounded-full hover:bg-black/5 transition-colors"><span className="material-icons-outlined text-sm">close</span></button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary/30 scroll-smooth">
            {messages.length === 0 && (
                <div className="text-center text-muted text-sm font-sans mt-10 opacity-70 px-6 leading-relaxed animate-fade-in">
                    Hello. I've analyzed your research. Ask me about specific findings, methodology, or summaries.
                </div>
            )}
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm font-['Times_New_Roman',_serif] ${
                        m.role === 'user' 
                        ? 'bg-accent text-white rounded-br-sm' 
                        : 'bg-surface border border-line text-main rounded-bl-sm'
                    }`}>
                        {renderText(m.text)}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start animate-fade-in">
                    <div className="bg-surface border border-line px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-line bg-surface rounded-b-3xl">
            <div className="relative flex items-center gap-2">
                <input 
                    className="flex-1 bg-primary border border-line rounded-full pl-5 pr-4 py-3 text-sm font-sans focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 text-main placeholder-muted transition-all shadow-sm"
                    placeholder="Ask a question..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputMsg.trim() || isLoading}
                    className="p-3 bg-accent text-white rounded-full transition-all disabled:opacity-50 disabled:bg-gray-300 hover:bg-main hover:shadow-lg active:scale-95"
                >
                    <span className="material-icons-outlined text-lg">arrow_upward</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default ChatInterface;