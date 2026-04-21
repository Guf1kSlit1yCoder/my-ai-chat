import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  // Включаем подробные логи для отладки в консоли Vercel
  debug: true, 
  callbacks: {
    // Используем : any для аргументов, чтобы избежать ошибок типизации при сборке
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Страницы по умолчанию
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

