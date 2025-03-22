import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"

// Load Inter font
const inter = Inter({ subsets: ["latin"] })

// Metadata for the application
export const metadata: Metadata = {
  title: "CareCapsule - Smart Pill Dispenser",
  description:
    "Smart pill dispenser system that helps elderly people manage medications while keeping caregivers informed.",
}

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

