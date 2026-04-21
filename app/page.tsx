"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export default function AltronAI_Final() {
  const [userProfile, setUserProfile] = useState({ name: "Guf1k", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" });
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewChatAnimating, setIsNewChatAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Загрузка профиля из памяти браузера
  useEffect(() => {
    const n = localStorage.getItem("altron_name") || "Guf1k";
    const a = localStorage.getItem("altron_avatar") || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    setUserProfile({ name: n, avatar: a });
  }, []);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // АНИМАЦИЯ НОВОГО ЧАТА
  const startNewChat = () => {
    setIsNewChatAnimating(true);
    setTimeout(() => {
      setMessages([]);
      setIsNewChatAnimating(false);
    }, 400); // Плавная очистка экрана
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { 
      role: "user", 
      content: input, 
      id: Math.random().toString(36).substr(2, 9) 
    };

    setMessages((prev) => [...prev, userMsg]);
    const userText = input;
    setInput("");
    setLoading(true);

    try {
      // ИСПОЛЬЗУЕМ ТВОЙ API /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          userName: userProfile.name 
        }),
      });

      const data = await response.json();
      const aiResponse = data.content || data.message || "Ошибка: API не вернул текст.";

      // Анимация "печати" ответа
      const aiMsgId = Math.random().toString(36).substr(2, 9);
      setMessages((prev) => [...prev, { role: "assistant", content: "", id: aiMsgId }]);
      
      let currentDisplay = "";
      const chunks = aiResponse.split(" ");
      for (const chunk of chunks) {
        currentDisplay += chunk + " ";
        setMessages((prev) => prev.map(m => m.id === aiMsgId ? { ...m, content: currentDisplay } : m));
        await new Promise(r => setTimeout(r, 25)); 
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "**Ошибка:** Altron не смог ответить. Проверь логи Vercel.", id: "err" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#1e1f20] hidden md:flex flex-col p-4 border-r border-zinc-800/30">
        <button onClick={startNewChat} className="flex items-center gap-3 px-5 py-3 bg-[#1a1a1c] hover:bg-[#313235] rounded-full text-sm font-medium transition-all w-fit border border-zinc-800 shadow-md">
          <span className="text-2xl font-light">+</span>
          <span>Новый чат</span>
        </button>
        
        <div className="flex-1 mt-10 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">История Altron AI</p>
          <div className="px-3 py-2 text-sm bg-[#28292a] rounded-xl cursor-pointer text-white border border-zinc-700/50">
            Текущий сеанс
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <div onClick={() => setShowSettings(true)} className="flex items-center gap-3 p-3 hover:bg-[#28292a] rounded-2xl cursor-pointer transition-all">
            <img src={userProfile.avatar} className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-800" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{userProfile.name}</span>
              <span className="text-[10px] text-blue-500">Настройки</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col relative transition-all duration-500 ${isNewChatAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
        
        <header className="p-4 flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent ml-4">Altron AI</span>
          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-black">PRO</span>
        </header>

        {/* CHAT AREA */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4">
          <div className="max-w-[850px] mx-auto py-10">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <h1 className="text-5xl font-medium mb-12 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent w-fit">
                  Привет, {userProfile.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Напиши код на React", "Как работает нейросеть?", "Идеи для проекта", "Помоги с математикой"].map((text) => (
                    <div key={text} onClick={() => setInput(text)} className="p-5 bg-[#1e1f20] hover:bg-[#28292a] rounded-3xl cursor-pointer transition-all border border-zinc-800/40 text-zinc-400 hover:text-zinc-200">
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12 pb-10">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold shadow-lg overflow-hidden ${m.role === 'assistant' ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                      {m.role === 'assistant' ? 'AI' : <img src={userProfile.avatar} className="w-full h-full object-cover" />}
                    </div>
                    <div className={`text-[16px] leading-[1.8] ${m.role === 'user' ? 'bg-[#28292a] px-6 py-3 rounded-[28px] text-white' : 'text-[#e3e3e3] w-full'}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({inline, children}: any) {
                            return !inline ? (
                              <div className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
                                <div className="bg-[#1e1f20] px-5 py-2 text-[10px] text-zinc-500 flex justify-between border-b border-zinc-800/50">
                                  <span>CODE BLOCK</span>
                                  <span className="text-blue-500 uppercase cursor-pointer">Copy</span>
                                </div>
                                <pre className="p-5 overflow-x-auto text-blue-200 font-mono text-sm"><code>{children}</code></pre>
                              </div>
                            ) : (
                              <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-blue-400 font-mono">{children}</code>
                            )
                          }
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-6 animate-pulse ml-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                    <div className="flex gap-1.5 mt-5">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="p-4 pb-8">
          <div className="max-w-[850px] mx-auto relative">
            <div className="flex items-center bg-[#1e1f20] rounded-[35px] px-7 py-2 border border-transparent focus-within:border-zinc-700 shadow-2xl transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Спроси Altron AI..."
                className="w-full bg-transparent py-4 outline-none text-white text-[16px]"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-full transition-all ${input.trim() ? "text-blue-500 scale-110" : "text-zinc-600"}`}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <p className="text-[10px] text-center mt-4 text-zinc-600 uppercase tracking-[0.3em] font-bold">
              ALTRON NEURAL SYSTEM v2.0
            </p>
          </div>
        </div>

        {/* SETTINGS */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="bg-[#1e1f20] p-8 rounded-[40px] border border-zinc-800 shadow-2xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-8 text-white">Профиль</h2>
                <input 
                  id="name-input" placeholder="Твой ник" defaultValue={userProfile.name}
                  className="w-full bg-[#131314] p-4 rounded-2xl mb-4 border border-zinc-800 outline-none text-white focus:border-blue-500 transition-all"
                />
                <input 
                  id="avatar-input" placeholder="Ссылка на фото" defaultValue={userProfile.avatar}
                  className="w-full bg-[#131314] p-4 rounded-2xl mb-8 border border-zinc-800 outline-none text-white focus:border-blue-500 transition-all"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-zinc-800 rounded-2xl font-bold hover:bg-zinc-700">Отмена</button>
                  <button 
                    onClick={() => {
                      const n = (document.getElementById('name-input') as HTMLInputElement).value;
                      const a = (document.getElementById('avatar-input') as HTMLInputElement).value;
                      localStorage.setItem("altron_name", n);
                      localStorage.setItem("altron_avatar", a);
                      setUserProfile({ name: n, avatar: a });
                      setShowSettings(false);
                    }}
                    className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/30 text-white"
                  >
                    Применить
                  </button>
                </div>
             </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2b2c2e; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

