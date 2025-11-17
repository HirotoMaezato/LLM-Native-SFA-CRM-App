"use client"

import { ReactNode } from "react"
import { MobileNav } from "./mobile-nav"

interface MobileLayoutProps {
  children: ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-16">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
