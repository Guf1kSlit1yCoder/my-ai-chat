"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export default function AltronFinalApp() {
  // Профиль пользователя
  const [userProfile, setUserProfile] = useState({
    name: "Guf1k",
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewChatAnimating, setIsNewChatAnimating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка данных профиля
  useEffect(() => {
    const savedName = localStorage.getItem("altron_name");
    const savedAvatar = localStorage.getItem("altron_avatar");
    if (savedName) setUserProfile(p => ({ ...p, name: savedName }));
    if (savedAvatar) setUserProfile(p => ({ ...p, avatar: savedAvatar }));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // АНИМАЦИЯ СОЗДАНИЯ НОВОГО ЧАТА
  const createNewChat = () => {
    setIsNewChatAnimating(true);
    setTimeout(() => {
      setMessages([]);
      setIsNewChatAnimating(false);
    }, 300); // Время совпадает с duration-300 в CSS
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { 
      role: "user", 
      content: input, 
      id: Math.random().toString(36).substr(2, 9) 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          systemPrompt: "You are Altron AI. Professional, smart, helpful. Use Markdown."
        }),
      });

      const data = await response.json();
      const aiResponse = data.content || data.message || data.choices?.[0]?.message?.content;

      const aiMsgId = Math.random().toString(36).substr(2, 9);
      setMessages((prev) => [...prev, { role: "assistant", content: "", id: aiMsgId }]);
      
      let currentDisplay = "";
      const chunks = aiResponse.split(" ");
      
      for (const chunk of chunks) {
        currentDisplay += chunk + " ";
        setMessages((prev) => 
          prev.map(m => m.id === aiMsgId ? { ...m, content: currentDisplay } : m)
        );
        await new Promise(r => setTimeout(r, 20)); 
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "**Ошибка:** Не удалось связаться с сервером Altron.", id: "err" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#1e1f20] hidden lg:flex flex-col p-4 border-r border-zinc-800/20">
        <button 
          onClick={createNewChat}
          className="flex items-center gap-3 px-5 py-3 bg-[#1a1a1c] hover:bg-[#313235] rounded-full text-sm font-medium transition-all w-fit border border-zinc-800 shadow-sm"
        >
          <span className="text-2xl font-light">+</span>
          <span>Новый чат</span>
        </button>
        
        <div className="flex-1 mt-10 overflow-y-auto custom-scrollbar">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">История</p>
          <div className="space-y-1">
            <div className="px-4 py-2 text-sm bg-[#28292a] rounded-lg cursor-pointer truncate text-white border border-zinc-700/50">
              Текущий диалог Altron
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
           <div onClick={() => setShowSettings(true)} className="flex items-center gap-3 p-3 hover:bg-[#28292a] rounded-2xl cursor-pointer transition-all">
              <img src={userProfile.avatar} className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-800" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{userProfile.name}</span>
                <span className="text-[10px] text-blue-400">Настройки Altron</span>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col relative transition-opacity duration-300 ${isNewChatAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        <header className="p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xl font-medium tracking-tight text-white">Altron AI</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold tracking-tighter">PRO</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[850px] mx-auto px-6 py-10">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-5xl font-medium mb-12 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent w-fit">
                  Привет, {userProfile.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Напиши код на TypeScript", "Объясни квантовую физику", "Идеи для завтрака", "Помоги с проектом"].map((text) => (
                    <div key={text} onClick={() => setInput(text)} className="p-5 bg-[#1e1f20] hover:bg-[#28292a] rounded-2xl cursor-pointer transition-all border border-zinc-800/30 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200">
                      <p className="text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12 pb-10">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold shadow-md overflow-hidden ${m.role === 'assistant' ? 'bg-[#3b82f6] text-white' : 'bg-zinc-700'}`}>
                      {m.role === 'assistant' ? 'AI' : <img src={userProfile.avatar} className="w-full h-full object-cover" />}
                    </div>
                    <div className={`text-[16px] leading-[1.8] ${m.role === 'user' ? 'bg-[#28292a] px-6 py-3 rounded-[26px] text-white' : 'text-[#e3e3e3] w-full'}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({inline, children, ...props}: any) {
                            return !inline ? (
                              <div className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-[#0a0a0a]">
                                <div className="bg-[#1e1f20] px-5 py-2 text-[10px] text-zinc-500 font-mono flex justify-between border-b border-zinc-800/50">
                                  <span>TERMINAL</span>
                                  <span className="text-blue-500 cursor-pointer uppercase">Copy</span>
                                </div>
                                <pre className="p-5 overflow-x-auto text-blue-100 font-mono text-sm"><code>{children}</code></pre>
                              </div>
                            ) : (
                              <code className="bg-[#28292a] px-1.5 py-0.5 rounded text-blue-400" {...props}>{children}</code>
                            )
                          },
                          ul: ({children}) => <ul className="list-disc ml-6 space-y-2 my-4">{children}</ul>,
                          p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-6 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                    <div className="flex gap-1.5 mt-5">
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
        <div className="p-4 pb-10">
          <div className="max-w-[850px] mx-auto relative">
            <div className="flex items-center bg-[#1e1f20] rounded-[32px] px-6 py-2 transition-all border border-transparent focus-within:border-zinc-700 shadow-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Спроси Altron AI..."
                className="w-full bg-transparent py-4 outline-none text-[16px] text-white"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 rounded-full transition-all ${input.trim() ? "text-blue-500 hover:bg-blue-500/10" : "text-zinc-600"}`}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <p className="text-[10px] text-center mt-4 text-zinc-600 uppercase tracking-[0.2em] font-bold">
              Neural Core v2.0 // Altron AI
            </p>
          </div>
        </div>

        {/* SETTINGS MODAL */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="bg-[#1e1f20] p-8 rounded-[40px] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-8 text-white">Профиль</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-bold ml-2">Имя в системе</label>
                    <input 
                      id="name-input" defaultValue={userProfile.name}
                      className="w-full bg-[#131314] p-4 rounded-2xl mt-1 border border-zinc-800 outline-none focus:border-blue-500 transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-bold ml-2">URL аватара</label>
                    <input 
                      id="avatar-input" defaultValue={userProfile.avatar}
                      className="w-full bg-[#131314] p-4 rounded-2xl mt-1 border border-zinc-800 outline-none focus:border-blue-500 transition-all text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-10">
                  <button onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-zinc-800 rounded-2xl font-bold hover:bg-zinc-700 transition-all">Отмена</button>
                  <button 
                    onClick={() => {
                      const n = (document.getElementById('name-input') as HTMLInputElement).value;
                      const a = (document.getElementById('avatar-input') as HTMLInputElement).value;
                      localStorage.setItem("altron_name", n);
                      localStorage.setItem("altron_avatar", a);
                      setUserProfile({ name: n, avatar: a });
                      setShowSettings(false);
                    }}
                    className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 text-white"
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #28292a; border-radius: 10px; }
        .animate-in { animation-duration: 0.5s; animation-fill-mode: both; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

