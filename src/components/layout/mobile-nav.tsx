"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, BarChart3, Settings, Bot, Building2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "ホーム",
    href: "/",
    icon: Home,
  },
  {
    name: "商談",
    href: "/deals",
    icon: FileText,
  },
  {
    name: "取引先",
    href: "/accounts",
    icon: Building2,
  },
  {
    name: "担当者",
    href: "/contacts",
    icon: Users,
  },
  {
    name: "AI催促",
    href: "/ai-coach",
    icon: Bot,
  },
  {
    name: "レポート",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "設定",
    href: "/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  // パスの最初のセグメントを取得してアクティブ状態を判定
  const getIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center overflow-x-auto px-1 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = getIsActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2 text-xs font-medium transition-colors min-w-[52px] flex-shrink-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <span className="text-[9px] whitespace-nowrap">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
