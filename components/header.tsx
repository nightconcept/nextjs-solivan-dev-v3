"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Leaf, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="py-4 max-w-3xl mx-auto sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6" />
            <span className="font-mono font-bold text-2xl">/home/danny</span>
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-6">
          <Link
            href="/blog"
            className="hover:text-primary hover:bg-muted dark:hover:bg-muted px-3 py-1 rounded-md transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="hover:text-primary hover:bg-muted dark:hover:bg-muted px-3 py-1 rounded-md transition-colors"
          >
            About
          </Link>
        </div>

        <div className="sm:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-4 py-4 border-t border-border bg-background">
          <div className="flex flex-col space-y-4">
            <Link
              href="/blog"
              className="hover:text-primary hover:bg-muted dark:hover:bg-muted px-3 py-1 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="hover:text-primary hover:bg-muted dark:hover:bg-muted px-3 py-1 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

