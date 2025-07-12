import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
    // signUp is not supported by NextAuth pages config
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only run for Google sign-in
      if (account?.provider === 'google') {
        const { getSupabase } = await import('@/lib/supabase');
        const supabase = getSupabase();
        // Check if user exists in Supabase
        const { data: existingUser } = await supabase
          .from('auth.users')
          .select('id, user_metadata')
          .eq('email', user.email)
          .single();
        if (!existingUser) {
          // Create user in Supabase with no role yet
          await supabase.auth.admin.createUser({
            email: user.email as string,
            email_confirm: true,
            user_metadata: {},
          });
          // Mark as first login
          (user as typeof user & { isFirstLogin: boolean }).isFirstLogin = true;
        } else if (!existingUser.user_metadata?.role) {
          // User exists but has no role
          (user as typeof user & { isFirstLogin: boolean }).isFirstLogin = true;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if ((user as typeof user & { isFirstLogin?: boolean })?.isFirstLogin) {
        (token as typeof token & { isFirstLogin: boolean }).isFirstLogin = true;
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as typeof token & { isFirstLogin?: boolean })?.isFirstLogin) {
        (session as typeof session & { isFirstLogin: boolean }).isFirstLogin = true;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 