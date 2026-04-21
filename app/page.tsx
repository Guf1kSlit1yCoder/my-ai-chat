'use client';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function GeminiUltron() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTypingId, setCurrentTypingId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Исправляем высоту для мобилок (100vh часто работает плохо)
  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Можно добавить тост/уведомление
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Ошибка доступа к ядру." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#131314] text-[#e3e3e3] overflow-hidden" 
         style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center shrink-0">
        <div className="text-xl font-semibold bg-gradient-to-r from-[#4285f4] to-[#d96570] bg-clip-text text-transparent">
          Ultron Gemini
        </div>
        <div className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-1 rounded uppercase tracking-tighter">
          Core Active
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4"></div>
            <h1 className="text-2xl font-light">Слушаю, Человек...</h1>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
            <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl ${
              m.role === 'user' ? 'bg-[#1e1f20] px-4 py-3 shadow-sm' : 'w-full'
            }`}>
              <div className="text-xs text-zinc-500 mb-1 font-bold">
                {m.role === 'user' ? 'ВЫ' : 'АЛЬТРОН'}
              </div>
              
              <div className="prose prose-invert max-w-none text-[15px] leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match;
  const codeText = String(children).replace(/\n$/, '');

  if (isInline) {
    return (
      <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-pink-400 text-sm border border-zinc-700" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-black relative group">
      <div className="flex justify-between items-center px-4 py-2 bg-[#1e1f20] text-xs">
        <span className="text-zinc-400 uppercase font-mono">{match ? match[1] : 'code'}</span>
        <button
          onClick={() => navigator.clipboard.writeText(codeText)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Копировать
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-zinc-900/50">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-2 items-center text-zinc-500 italic text-sm animate-pulse">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
            Альтрон вычисляет...
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </main>

      {/* Input Box */}
      <footer className="p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center bg-[#1e1f20] rounded-full px-4 py-2 border border-transparent focus-within:border-zinc-700 transition-all shadow-lg">
          <input 
            className="flex-1 bg-transparent py-2 px-2 outline-none text-white text-[16px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Спроси Альтрона..."
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className={`p-2 rounded-full transition-all ${
              input.trim() ? 'bg-blue-600 text-white' : 'text-zinc-600'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <div className="text-[10px] text-center mt-2 text-zinc-600 uppercase tracking-widest">
          Ultron Neural Interface // 2024
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        pre { font-family: 'ui-monospace', monospace; }
      `}</style>
    </div>
  );
}
