"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authStore, User } from "@/lib/store/auth"

interface AuthGuardProps {
  children: React.ReactNode
}

// 認証不要のパス
const publicPaths = ["/login"]

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authStore.isAuthenticated()
      setIsAuthenticated(authenticated)

      // 公開パスの場合は認証チェックをスキップ
      if (publicPaths.includes(pathname)) {
        setIsChecking(false)
        return
      }

      // 認証されていない場合はログインページにリダイレクト
      if (!authenticated) {
        router.push("/login")
      }

      setIsChecking(false)
    }

    checkAuth()

    // authStoreの状態変更を監視
    const unsubscribe = authStore.subscribe(() => {
      checkAuth()
    })

    return () => {
      unsubscribe()
    }
  }, [pathname, router])

  // 認証チェック中はローディング表示
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 公開パスの場合はそのまま表示
  if (publicPaths.includes(pathname)) {
    return <>{children}</>
  }

  // 認証されていない場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// 現在のユーザー情報を取得するフック
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(authStore.getCurrentUser())

    const unsubscribe = authStore.subscribe(() => {
      setUser(authStore.getCurrentUser())
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return user
}

// ログアウト関数
export function useLogout() {
  const router = useRouter()

  return () => {
    authStore.logout()
    router.push("/login")
  }
}
