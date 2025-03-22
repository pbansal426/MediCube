"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
} from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

// Sidebar component for dashboard navigation
export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Add Prescription",
      href: "/dashboard/add-prescription",
      icon: PlusCircle,
    },
    {
      name: "Logs",
      href: "/dashboard/logs",
      icon: ClipboardList,
    },
    {
      name: "AI Assistant",
      href: "/dashboard/ai-assistant",
      icon: MessageSquare,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === "dark" ? "light" : "dark")
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg dark:bg-gray-800 md:translate-x-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b px-4">
            <motion.h1
              className="text-xl font-bold text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              CareCapsule
            </motion.h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                    {item.name === "Dashboard" && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-600">
                        <Bell className="h-3 w-3" />
                      </span>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Theme toggle and user info */}
          <div className="border-t p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
              <Button variant="outline" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>

            <div className="mb-2 flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium truncate max-w-[180px]">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900 dark:hover:text-red-400 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

