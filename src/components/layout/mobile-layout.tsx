"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { MobileNav } from "./mobile-nav"
import { AuthGuard } from "@/components/auth/auth-guard"

interface MobileLayoutProps {
  children: ReactNode
}

// ナビゲーションを表示しないパス
const noNavPaths = ["/login"]

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  const showNav = !noNavPaths.includes(pathname)

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <main className={`flex-1 ${showNav ? "pb-16" : ""}`}>
          {children}
        </main>
        {showNav && <MobileNav />}
      </div>
    </AuthGuard>
  )
}
