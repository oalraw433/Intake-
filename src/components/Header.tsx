import React from 'react'
import { Link, useLocation } from 'wouter'
import { Smartphone, Settings, Home, PlusCircle, BarChart3 } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export default function Header() {
  const [location] = useLocation()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/intake', label: 'New Repair', icon: PlusCircle },
    { href: '/pos', label: 'POS System', icon: BarChart3 },
    { href: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Business Name */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="bg-primary-foreground/10 p-2 rounded-lg">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">IFIXANDREPAIR</h1>
                <p className="text-xs opacity-90">Forest Park Walmart</p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-primary-foreground hover:text-primary-foreground/80",
                      isActive && "bg-primary-foreground/20 text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:ml-2 sm:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Business Info Bar */}
      <div className="bg-primary-foreground/5 border-t border-primary-foreground/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center py-2 text-xs space-x-4 text-primary-foreground/80">
            <span>📍 1300 Des Plaines Ave, Forest Park, IL 60130</span>
            <span>📞 (872) 222-3111</span>
            <span>🕒 9AM-8PM everyday</span>
          </div>
        </div>
      </div>
    </header>
  )
}