"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authStore } from "@/lib/store/auth"
import { useRouter } from "next/navigation"
import { LogIn, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const demoUsers = authStore.getDemoUsers()

  // 既にログイン済みの場合はホームにリダイレクト
  useEffect(() => {
    if (authStore.isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // 少し遅延を入れてローディング感を出す
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = authStore.login(email, password)

    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "ログインに失敗しました")
    }

    setIsLoading(false)
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* ロゴ・タイトル */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">SFA/CRM</h1>
          <p className="text-muted-foreground">営業支援システムにログイン</p>
        </div>

        {/* ログインフォーム */}
        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              メールアドレスとパスワードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">メールアドレス</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.co.jp"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">パスワード</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "ログイン中..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    ログイン
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* デモユーザー情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">デモアカウント</CardTitle>
            <CardDescription className="text-xs">
              以下のアカウントでお試しいただけます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleDemoLogin(user.email, user.password)}
                className="w-full p-3 text-left text-sm border rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {user.email}
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 bg-muted rounded">
                    {user.role === "admin" && "管理者"}
                    {user.role === "manager" && "マネージャー"}
                    {user.role === "sales" && "営業"}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
