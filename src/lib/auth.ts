import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "./rateLimit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limit login attempts by email (max 5 attempts per 60 seconds)
        const rateLimitKey = `login:${credentials.email.toLowerCase()}`;
        const rateCheck = checkRateLimit(rateLimitKey, {
          maxRequests: 5,
          windowSeconds: 60,
        });
        if (!rateCheck.success) {
          throw new Error("Too many login attempts. Please wait 1 minute before trying again.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          division: user.division,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.division = (user as any).division;
      }
      // Handle session update (e.g. after profile edit)
      if (trigger === "update" && updateSession) {
        if (updateSession.name) token.name = updateSession.name;
        if (updateSession.division) token.division = updateSession.division;
        if (updateSession.email) token.email = updateSession.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).division = token.division;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token-v2",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
