'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GoogleProvider from './GoogleProvider'
import GoogleLoginBtn from './GoogleLoginBtn'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/admin' },
    { label: 'Department', href: '/department' },
    { label: 'Contact', href: '/contact' },
    { label: 'My Complaints', href: '/my-complaints' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-base">
              🏛️
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-primary leading-none">Gujarat CivicTrack</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Transparent Governance</p>
            </div>
          </Link>

          {/* Desktop Nav — centered */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/8 font-semibold'
                    : 'text-foreground/70 hover:text-primary hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <GoogleProvider>
              <GoogleLoginBtn />
            </GoogleProvider>
            <Link href="/raise-complaint">
              <Button size="sm" className="bg-accent hover:bg-yellow-500 text-accent-foreground font-semibold">
                Raise Complaint
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/8 font-semibold'
                    : 'text-foreground/70 hover:text-primary hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-3 border-t border-border mt-2">
              <GoogleProvider>
                <GoogleLoginBtn />
              </GoogleProvider>
              <Link href="/raise-complaint" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full bg-accent hover:bg-yellow-500 text-accent-foreground font-semibold">
                  Raise Complaint
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
