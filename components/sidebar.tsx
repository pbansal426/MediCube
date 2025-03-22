"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Pill,
  List,
  Settings,
  Heart,
  LogOut,
  Menu,
  X,
  Brain,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Prescriptions", href: "/dashboard/prescriptions", icon: Pill },
  { label: "Logs", href: "/dashboard/logs", icon: List },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Caretaker", href: "/dashboard/caretaker", icon: Heart },
  { label: "AI Assistant", href: "/dashboard/ai-assistant", icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`h-full border-r border-gray-200 bg-white shadow transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <span
          className={`font-bold text-lg text-primary origin-left transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          CareCapsule
        </span>
        <button
          className="p-1 text-gray-600 hover:bg-gray-100 rounded focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="mt-4 flex flex-col">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  isOpen ? "opacity-100 ml-1" : "opacity-0 w-0"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t flex items-center">
        <button
          className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          onClick={() => alert("Logging out...")}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={`transition-all duration-300 ${
              isOpen ? "opacity-100 ml-1" : "opacity-0 w-0"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
