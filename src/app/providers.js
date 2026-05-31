"use client";
// src/app/providers.js — Client-side context providers
// Wraps the entire app so child components can call useSession(), etc.

import { SessionProvider } from "next-auth/react";

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
