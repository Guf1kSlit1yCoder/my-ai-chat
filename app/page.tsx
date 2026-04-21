'use client'
import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { supabase } from '@/lib/supabase'

export default function AltronOS() {
  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Загрузка списка чатов
  useEffect(() => {
    if (session?.user) {
      loadChats()
    }
  }, [session])

  // Загрузка сообщений при смене чата
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId)
    }
  }, [currentChatId])

  async function loadChats() {
    const { data } = await supabase.from('chats').select('*').order('created_at', { ascending: false })
    if (data) {
      setChats(data)
      if (data.length > 0 && !currentChatId) setCurrentChatId(data[0].id)
    }
  }

  async function createNewChat() {
    const { data, error } = await supabase
      .from('chats')
      .insert([{ user_id: (session?.user as any).id, title: 'Новый диалог' }])
      .select()
    
    if (data) {
      setChats([data[0], ...chats])
      setCurrentChatId(data[0].id)
      setMessages([])
    }
  }

  async function loadMessages(chatId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const handleSend = async () => {
    if (!input.trim() || !session || !currentChatId) return

    const userMsg = { role: 'user', content: input, chat_id: currentChatId }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await supabase.from('messages').insert([{ ...userMsg, user_id: (session?.user as any).id }])

    // Заглушка ответа AI
    const aiContent = "Система Altron AI активна. Протокол связи подтвержден."
    const aiMsg = { role: 'assistant', content: aiContent, chat_id: currentChatId }
    
    await supabase.from('messages').insert([{ ...aiMsg, user_id: (session?.user as any).id }])
    setMessages(prev => [...prev, aiMsg])
    setLoading(false)
  }

  if (!session) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">ALTRON AI</h1>
        <p className="text-zinc-500 mb-8 text-sm">Neural Interface // 2026</p>
        <button onClick={() => signIn('google')} className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition">Идентификация</button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-300 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-black border-r border-zinc-900 flex flex-col p-3 hidden md:flex">
        <button 
          onClick={createNewChat}
          className="flex items-center gap-3 px-4 py-3 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-900 transition mb-4"
        >
          <span className="text-xl">+</span> Новый чат
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-1">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`p-3 text-sm rounded-lg cursor-pointer truncate ${currentChatId === chat.id ? 'bg-zinc-900 border border-zinc-800 text-white' : 'hover:bg-zinc-900'}`}
            >
              {chat.title}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between px-2">
          <span className="text-[10px] uppercase text-zinc-600 tracking-widest">{session.user?.name}</span>
          <button onClick={() => signOut()} className="text-[10px] hover:text-white">OUT</button>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col relative">
        <header className="p-4 flex justify-between items-center border-b border-zinc-900/50">
          <span className="text-xs font-bold tracking-widest text-zinc-500">ALTRON AI</span>
          <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:px-20 space-y-8 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] text-sm ${m.role === 'user' ? 'bg-zinc-900 p-4 rounded-2xl text-white' : 'w-full text-zinc-300 leading-relaxed'}`}>
                {m.role === 'assistant' && <div className="text-[10px] font-bold text-blue-500 mb-1">ALTRON</div>}
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-zinc-600 animate-pulse font-mono">Анализ данных...</div>}
        </div>

        <div className="p-4 md:px-20 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-4xl mx-auto relative flex items-center bg-zinc-900 rounded-2xl border border-zinc-800 focus-within:border-zinc-700 transition">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent p-4 outline-none text-sm"
              placeholder="Спроси Альтрона..."
            />
            <button onClick={handleSend} className="p-3 text-blue-500 hover:text-blue-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-zinc-600 tracking-widest">ALTRON NEURAL INTERFACE // 2026</p>
        </div>
      </div>
    </div>
  )
}

 
