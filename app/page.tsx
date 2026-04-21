"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Типизация для Gemini-стиля
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export default function GeminiClone() {
  const [userProfile, setUserProfile] = useState({
    name: "Guf1k",
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  });
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Инициализация профиля
  useEffect(() => {
    const n = localStorage.getItem("altron_name") || "Guf1k";
    const a = localStorage.getItem("altron_avatar") || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    setUserProfile({ name: n, avatar: a });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          // Системная инструкция для ИИ, чтобы он вел себя как Gemini
          systemPrompt: "You are Gemini, a creative and helpful AI assistant from Google. Respond in Russian, be concise but thorough, use markdown for structure, and maintain a friendly, professional tone."
        }),
      });

      const data = await response.json();
      const aiResponse = data.content || data.message;

      // ЭФФЕКТ ПОСТЕПЕННОГО ПОЯВЛЕНИЯ (как в Gemini)
      const aiMsgId = Math.random().toString(36).substr(2, 9);
      setMessages((prev) => [...prev, { role: "assistant", content: "", id: aiMsgId }]);
      
      let currentDisplay = "";
      const chunks = aiResponse.split(" ");
      
      for (const chunk of chunks) {
        currentDisplay += chunk + " ";
        setMessages((prev) => 
          prev.map(m => m.id === aiMsgId ? { ...m, content: currentDisplay } : m)
        );
        // Небольшая задержка для имитации "раздумий" и плавности
        await new Promise(r => setTimeout(r, 25));
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Произошла ошибка. Проверьте соединение.", id: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans selection:bg-[#4285f4]/30 overflow-hidden">
      
      {/* SIDEBAR (Gemini Style) */}
      <aside className="w-[280px] bg-[#1e1f20] hidden lg:flex flex-col p-4">
        <button 
          onClick={() => setMessages([])}
          className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1c] hover:bg-[#28292a] rounded-full text-sm font-medium transition-all w-fit border border-zinc-800"
        >
          <span className="text-2xl font-light">+</span>
          <span>Новый чат</span>
        </button>
        
        <div className="flex-1 mt-10 overflow-y-auto">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">Недавние</p>
          <div className="space-y-1">
             <div className="px-3 py-2 text-sm hover:bg-[#28292a] rounded-lg cursor-pointer truncate text-zinc-400 transition-colors">
               Диалог с Altron Gemini
             </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
           <div onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-3 p-3 hover:bg-[#28292a] rounded-2xl cursor-pointer">
              <img src={userProfile.avatar} className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
              <div className="text-sm font-medium truncate">{userProfile.name}</div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="p-4 flex justify-between items-center z-10 bg-[#131314]/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xl font-medium">Altron</span>
            <span className="text-[10px] bg-[#28292a] text-zinc-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Gemini 1.5</span>
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[820px] mx-auto px-6 py-12">
            {messages.length === 0 ? (
              <div className="h-[55vh] flex flex-col justify-center">
                <h1 className="text-5xl font-medium mb-12 bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent w-fit">
                  Привет, {userProfile.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Напиши код для игры на Python",
                    "Составь план путешествия в Японию",
                    "Объясни теорию относительности",
                    "Помоги написать письмо коллеге"
                  ].map((text) => (
                    <div 
                      key={text} 
                      onClick={() => setInput(text)}
                      className="p-5 bg-[#1e1f20] hover:bg-[#28292a] rounded-2xl cursor-pointer transition-all border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in duration-500`}>
                    <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-lg overflow-hidden ${m.role === 'assistant' ? 'bg-[#1a73e8] text-white' : 'bg-zinc-700'}`}>
                      {m.role === 'assistant' ? 'AL' : <img src={userProfile.avatar} className="w-full h-full object-cover" />}
                    </div>
                    <div className={`text-[16px] leading-[1.8] tracking-normal selection:bg-blue-500/30 ${m.role === 'user' ? 'bg-[#28292a] px-6 py-3 rounded-[26px] text-white' : 'text-[#e3e3e3] w-full'}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({inline, className, children, ...props}: any) {
                            return !inline ? (
                              <div className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-[#0a0a0a]">
                                <div className="bg-[#1e1f20] px-5 py-2 text-[10px] text-zinc-500 font-mono flex justify-between border-b border-zinc-800/50">
                                  <span>КОД</span>
                                  <button className="hover:text-white transition-colors">КОПИРОВАТЬ</button>
                                </div>
                                <pre className="p-5 overflow-x-auto text-blue-200 font-mono text-sm leading-6"><code>{children}</code></pre>
                              </div>
                            ) : (
                              <code className="bg-[#28292a] px-1.5 py-0.5 rounded text-pink-400 font-mono" {...props}>{children}</code>
                            )
                          },
                          ul: ({children}) => <ul className="list-disc ml-6 space-y-2 my-4">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal ml-6 space-y-2 my-4">{children}</ol>,
                          p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-6">
                    <div className="w-9 h-9 rounded-full bg-blue-600 animate-pulse flex items-center justify-center text-[10px] font-bold">AL</div>
                    <div className="flex gap-1.5 mt-4">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT (Gemini Style) */}
        <div className="p-4 pb-10 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
          <div className="max-w-[820px] mx-auto">
            <div className="flex items-center bg-[#1e1f20] rounded-[32px] px-6 py-2 transition-all border border-transparent focus-within:border-zinc-700 focus-within:bg-[#1a1a1c] shadow-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Напишите здесь..."
                className="w-full bg-transparent py-4 outline-none text-[16px] placeholder-zinc-500"
              />
              <div className="flex items-center gap-3">
                <button className="p-2 text-zinc-400 hover:text-white transition-all">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-2 rounded-full ${input.trim() ? "text-blue-500 hover:bg-blue-500/10" : "text-zinc-600"}`}
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-center mt-4 text-zinc-500 font-light">
              Altron может ошибаться, проверяйте важную информацию.
            </p>
          </div>
        </div>

        {/* SETTINGS POPUP */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-[#1e1f20] p-8 rounded-[32px] border border-zinc-800 shadow-2xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-6">Профиль</h2>
                <input 
                  id="p-name" placeholder="Твой ник" defaultValue={userProfile.name}
                  className="w-full bg-[#131314] p-4 rounded-2xl mb-4 border border-zinc-800 outline-none focus:border-blue-500"
                />
                <input 
                  id="p-avatar" placeholder="URL аватарки" defaultValue={userProfile.avatar}
                  className="w-full bg-[#131314] p-4 rounded-2xl mb-6 border border-zinc-800 outline-none focus:border-blue-500"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-zinc-800 rounded-2xl font-bold">Закрыть</button>
                  <button 
                    onClick={() => {
                      const n = (document.getElementById('p-name') as HTMLInputElement).value;
                      const a = (document.getElementById('p-avatar') as HTMLInputElement).value;
                      localStorage.setItem("altron_name", n);
                      localStorage.setItem("altron_avatar", a);
                      setUserProfile({ name: n, avatar: a });
                      setShowSettings(false);
                    }}
                    className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500"
                  >
                    Сохранить
                  </button>
                </div>
             </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #28292a; border-radius: 10px; }
        pre code { font-family: 'Fira Code', 'Courier New', monospace; }
      `}</style>
    </div>
  );
}

