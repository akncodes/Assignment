"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Plus, TrendingUp, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AboutModal } from "./AboutModal";
import { useState } from "react";

export function Header() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B1220]/80 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <span className="font-semibold text-white tracking-tight text-lg">
            Market<span className="text-[#3B82F6]">Pulse</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                path === "/"
                  ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Portfolio</span>
            </Link>
            <Link
              href="/add"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                path === "/add"
                  ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add Holding</span>
            </Link>
          </div>
          <div className="w-px h-5 bg-white/10" />
          <AboutModal />
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent transition-all"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0B1220]/95 backdrop-blur-md px-4 py-4 flex flex-col gap-4 animate-fade-in shadow-2xl">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 w-full",
                path === "/"
                  ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Portfolio</span>
            </Link>
            <Link
              href="/add"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 w-full",
                path === "/add"
                  ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add Holding</span>
            </Link>
          </div>
          <div className="h-px bg-white/5 w-full" />
          <div onClick={() => setIsOpen(false)} className="w-full flex">
            <AboutModal />
          </div>
        </div>
      )}
    </header>
  );
}
