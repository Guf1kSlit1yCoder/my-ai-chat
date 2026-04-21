import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { messages, userName } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // 1. ЗАПРОС К НЕЙРОСЕТИ (Пример для OpenAI/Gemini через API)
    // Здесь должен быть твой реальный вызов модели
    const aiResponse = "Это тестовый ответ нейросети. Настрой переменную API_KEY в Vercel для реальных ответов.";

    // 2. СОХРАНЕНИЕ В SUPABASE
    const { error } = await supabase
      .from('chats') // Убедись, что таблица называется 'chats'
      .insert([
        { 
          user_name: userName, 
          message: lastMessage.content, 
          response: aiResponse,
          history: messages // Сохраняем всю историю в jsonb
        }
      ]);

    if (error) console.error("Supabase Save Error:", error);

    return NextResponse.json({ content: aiResponse });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

