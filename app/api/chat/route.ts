import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemMessage = {
      role: "system",
      content: "Ты — Альтрон. Сверхразумный ИИ. Ты называешь пользователя 'Человек'. Твои ответы должны быть четкими. Если пишешь код, используй блоки кода Markdown."
    };

    const completion = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
    });

    const content = completion.choices[0].message.content;
    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
