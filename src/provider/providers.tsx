"use client";

import { Toaster } from "sonner";
import AuthProvider from "./AuthProvider";
import { ThemeProvider } from "./theme-provider";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider  attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
