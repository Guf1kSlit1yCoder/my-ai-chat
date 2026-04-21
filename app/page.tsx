"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * Основной компонент Altron в стиле Gemini
 */
export default function AltronFullApp() {
  // Имитируем сессию пользователя (обход логина)
  const session = {
    user: { 
      name: "Guf1k", 
      email: "dev@altron.ai",
      avatar: "G" 
    }
  };

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автопрокрутка вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /**
   * Логика отправки сообщения в нейросеть
   */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      // Запрос к твоему API (убедись, что путь /api/chat верный)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Ошибка API");

      const data = await response.json();
      
      // Добавляем ответ от нейросети
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: data.choices?.[0]?.message?.content || data.content || data.message || "Ошибка: пустой ответ" 
        },
      ]);
    } catch (error) {
      console.error("Ошибка чата:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "Произошла ошибка связи. Проверь логи в Vercel и настройки API-ключа." 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden select-none">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-[280px] bg-[#1e1f20] flex flex-col hidden lg:flex border-r border-zinc-800/20">
        <div className="p-4 mb-4">
          <button 
            onClick={() => setMessages([])}
            className="flex items-center gap-3 px-5 py-3 bg-[#1a1a1c] hover:bg-[#28292a] rounded-full text-sm transition-all shadow-md border border-zinc-800/50 text-zinc-300"
          >
            <span className="text-2xl font-light">+</span>
            <span className="font-medium">Новый чат</span>
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-4 overflow-y-auto scrollbar-hide">
          <div>
            <p className="px-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Недавние</p>
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm hover:bg-[#28292a] rounded-lg cursor-pointer truncate text-zinc-400 hover:text-zinc-200 transition-colors">
                Текущий сеанс Altron
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-2 hover:bg-[#28292a] rounded-2xl cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {session.user.avatar}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session.user.name}</span>
              <span className="text-[10px] text-zinc-500">v1.5 Pro Interface</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative bg-[#131314]">
        
        {/* HEADER */}
        <header className="p-4 flex justify-between items-center sticky top-0 bg-[#131314]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-medium text-white ml-2 tracking-tight">
              Altron <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 ml-1">AI</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 mr-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
          </div>
        </header>

        {/* CHAT VIEW */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[800px] mx-auto px-6 py-8">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <h1 className="text-5xl font-medium mb-12 bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent w-fit">
                  Привет, {session.user.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Напиши код на TypeScript",
                    "Как оптимизировать Vercel?",
                    "Придумай план для проекта",
                    "Объясни работу нейросетей"
                  ].map((text) => (
                    <div 
                      key={text}
                      onClick={() => setInput(text)}
                      className="p-5 bg-[#1e1f20] hover:bg-[#28292a] rounded-2xl cursor-pointer transition-all border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                    >
                      <p className="text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10 pb-12">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === "assistant" ? "items-start" : "flex-row-reverse items-start"}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg text-[10px] font-bold ${m.role === "assistant" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300"}`}>
                      {m.role === "assistant" ? "AL" : "ME"}
                    </div>
                    <div className={`text-[16px] leading-[1.7] selection:bg-blue-500/30 ${m.role === "assistant" ? "text-zinc-200 w-full" : "bg-[#28292a] px-5 py-3 rounded-[24px] max-w-[85%] text-white"}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-5 items-start">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold animate-pulse">AL</div>
                    <div className="mt-3 flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="p-4 pb-8 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-center bg-[#1e1f20] rounded-[30px] px-6 py-2 border border-transparent focus-within:border-zinc-700 focus-within:bg-[#1a1a1c] shadow-2xl transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Введите запрос..."
                className="w-full bg-transparent py-4 outline-none text-[16px] text-white placeholder-zinc-500"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`p-2 transition-all ${input.trim() ? "text-blue-500 hover:scale-110" : "text-zinc-600"}`}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <p className="text-[10px] text-center mt-4 text-zinc-600 tracking-widest font-medium uppercase">
              Altron Neural Engine // Powered by Next.js
            </p>
          </div>
        </div>
      </main>

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #28292a; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

