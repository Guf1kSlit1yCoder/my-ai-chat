"use client";

import { useState, useEffect } from "react";

export default function AltronApp() {
  // Искусственная сессия для обхода логина
  const session = {
    user: {
      name: "Guf1kSlit1yCoder",
      email: "dev@altron.ai",
      image: null
    }
  };

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Система готова. Доступ разрешен без авторизации. Чем могу помочь?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([
    { id: "1", title: "Новый чат" }
  ]);
  const [currentChatId, setCurrentChatId] = useState("1");

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Здесь будет логика запроса к ИИ, пока просто заглушка
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Режим отладки: вход отключен. Ваши сообщения обрабатываются локально." 
      }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-zinc-900 flex flex-col bg-black/50 backdrop-blur-xl">
        <div className="p-4">
          <button className="w-full py-2 px-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all text-sm font-medium flex items-center justify-center gap-2">
            <span>+</span> Новый чат
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`p-3 text-sm rounded-lg cursor-pointer truncate ${currentChatId === chat.id ? 'bg-zinc-900 border border-zinc-800 text-white' : 'hover:bg-zinc-900/50 text-zinc-400'}`}
            >
              {chat.title}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between px-4 pb-4">
          <span className="text-[10px] uppercase text-zinc-600 tracking-widest">{session.user.name}</span>
          <button className="text-[10px] text-zinc-500 hover:text-white transition-colors">DEV_MODE</button>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col relative">
        <header className="p-4 flex justify-between items-center border-b border-zinc-900/50">
          <span className="text-zinc-500 text-[10px] tracking-widest uppercase">ALTRON AI</span>
          <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:px-20 space-y-8 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] text-sm ${m.role === 'user' ? 'bg-zinc-900 p-4 rounded-2xl text-white' : 'w-full text-zinc-300'}`}>
                {m.role === 'assistant' && <div className="text-[10px] font-bold text-blue-500 mb-1 tracking-widest">ALTRON</div>}
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-zinc-600 animate-pulse font-mono">Анализ данных...</div>}
        </div>

        <div className="p-4 md:px-20 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-4xl mx-auto relative flex items-center bg-zinc-900 rounded-2xl border border-zinc-800 focus-within:border-zinc-700 transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent p-4 outline-none text-sm text-white placeholder-zinc-600"
              placeholder="Спроси Альтрона..."
            />
            <button onClick={handleSend} className="p-3 text-blue-500 hover:text-blue-400 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-zinc-600 tracking-widest uppercase">Altron Neural Interface // 2026</p>
        </div>
      </div>
    </div>
  );
}

