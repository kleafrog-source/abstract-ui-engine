import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Semantic UI Genesis Engine",
  description:
    "Transform natural-language prompts into fully functional, adaptive web interfaces using deterministic semantic search over a modular UI lexicon (BGE-M3 compatible).",
  keywords: [
    "Semantic UI",
    "UI Genesis",
    "BGE-M3",
    "vector search",
    "design system",
    "Next.js",
  ],
  authors: [{ name: "Semantic UI Genesis Engine" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
