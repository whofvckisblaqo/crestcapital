// src/lib/auth.js — NextAuth configuration (shared between route handler + helpers)

import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() })
          .select("+password +status");

        if (!user) throw new Error("No account found with that email.");
        if (user.status === "suspended") throw new Error("Your account has been suspended. Please contact support.");
        if (!user.emailVerified && user.role !== "admin") throw new Error("EMAIL_NOT_VERIFIED");

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Incorrect password. Please try again.");

        return {
          id:       user._id.toString(),
          email:    user.email,
          name:     `${user.firstName} ${user.lastName}`,
          role:     user.role,
          username: user.username,
        };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id;
        token.role     = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id       = token.id;
        session.user.role     = token.role;
        session.user.username = token.username;
      }
      return session;
    },
  },

  pages: {
    signIn:   "/auth/login",
    error:    "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
