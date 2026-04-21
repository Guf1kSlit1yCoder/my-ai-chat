import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";

// Инициализация Groq с твоим ключом из Vercel
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Инициализация Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { messages, userName } = await req.json();

    // 1. Запрос к Groq Cloud
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": `Ты — Altron AI. Твой пользователь: ${userName}. 
                      Отвечай четко, интеллектуально и только на русском языке. 
                      Используй Markdown.`
        },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ],
      "model": "llama-3.3-70b-versatile", // Самая мощная модель в Groq на данный момент
      "temperature": 0.7,
      "max_tokens": 4096,
      "top_p": 1,
      "stream": false, // Ставим false для простой обработки, либо true если хочешь стриминг
    });

    const aiText = chatCompletion.choices[0]?.message?.content || "";

    // 2. Сохранение в Supabase (параллельно, чтобы не тормозить ответ)
    const lastUserMsg = messages[messages.length - 1].content;
    
    // Не используем await здесь, если хочешь мгновенный ответ юзеру, 
    // но для надежности лучше оставить
    await supabase.from('messages').insert([
      { user_name: userName, role: 'user', content: lastUserMsg },
      { user_name: userName, role: 'assistant', content: aiText }
    ]);

    return NextResponse.json({ content: aiText });

  } catch (error: any) {
    console.error("Groq/Supabase Error:", error);
    return NextResponse.json(
      { content: "Ошибка: Groq Console не отвечает или Supabase отклонил запрос." },
      { status: 500 }
    );
  }
}

