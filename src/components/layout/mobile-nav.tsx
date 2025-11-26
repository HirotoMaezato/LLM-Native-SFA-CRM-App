"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, BarChart3, Settings, Bot, Building2, Users, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SubMenuItem {
  name: string
  href: string
  icon: React.ElementType
}

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  subItems?: SubMenuItem[]
}

const navItems: NavItem[] = [
  {
    name: "ホーム",
    href: "/",
    icon: Home,
  },
  {
    name: "営業",
    icon: Briefcase,
    subItems: [
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
    ],
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
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // パスの最初のセグメントを取得してアクティブ状態を判定
  const getIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  // サブメニューのいずれかがアクティブかチェック
  const hasActiveSubItem = (subItems?: SubMenuItem[]) => {
    if (!subItems) return false
    return subItems.some((subItem) => getIsActive(subItem.href))
  }

  const toggleSubmenu = (itemName: string) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* サブメニュー */}
      {openSubmenu && navItems.find((item) => item.name === openSubmenu)?.subItems && (
        <div className="border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
            {navItems
              .find((item) => item.name === openSubmenu)
              ?.subItems?.map((subItem) => {
                const SubIcon = subItem.icon
                const isActive = getIsActive(subItem.href)

                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={() => setOpenSubmenu(null)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <SubIcon className="h-3.5 w-3.5" />
                    <span>{subItem.name}</span>
                  </Link>
                )
              })}
          </div>
        </div>
      )}

      {/* メインナビゲーション */}
      <div className="flex h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href ? getIsActive(item.href) : hasActiveSubItem(item.subItems)
          const hasSubmenu = !!item.subItems

          if (hasSubmenu) {
            return (
              <button
                key={item.name}
                onClick={() => toggleSubmenu(item.name)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                  isActive || openSubmenu === item.name
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    (isActive || openSubmenu === item.name) && "text-primary"
                  )}
                />
                <span className="text-[9px] whitespace-nowrap">{item.name}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2 text-xs font-medium transition-colors",
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
