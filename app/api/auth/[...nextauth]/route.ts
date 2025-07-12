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
    signIn: "/auth/sign-up",
    newUser: "/auth/complete-profile",
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
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // For new users, redirect to complete profile page
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/auth/complete-profile`;
      }
      return url;
    },
    async jwt({ token, user, account }) {
      // Capture role on first sign-in
      if (account && user && (user as typeof user & { role?: string }).role) {
        (token as typeof token & { role?: string }).role = (user as typeof user & { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      (session as typeof session & { user: typeof session.user & { role?: string } }).user.role = (token as typeof token & { role?: string }).role;
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 