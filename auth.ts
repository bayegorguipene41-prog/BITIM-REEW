import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/users";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

const googleConfigured =
  !!googleClientId &&
  !!googleClientSecret &&
  !googleClientId.startsWith("REPLACE") &&
  !googleClientSecret.startsWith("REPLACE");

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await verifyUser(
          credentials.email as string,
          credentials.password as string
        );
        if (!user) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
  },
});

export { googleConfigured };
