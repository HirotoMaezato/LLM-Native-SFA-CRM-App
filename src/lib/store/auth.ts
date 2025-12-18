export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "manager" | "sales"
}

// デモ用のユーザーデータ
const demoUsers: (User & { password: string })[] = [
  {
    id: "user-1",
    email: "admin@example.com",
    password: "admin123",
    name: "管理者",
    role: "admin",
  },
  {
    id: "user-2",
    email: "manager@example.com",
    password: "manager123",
    name: "マネージャー",
    role: "manager",
  },
  {
    id: "user-3",
    email: "sales@example.com",
    password: "sales123",
    name: "営業担当者",
    role: "sales",
  },
]

class AuthStore {
  private currentUser: User | null = null
  private listeners: Set<() => void> = new Set()

  constructor() {
    // ブラウザ環境でのみsessionStorageから復元
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("currentUser")
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser)
        } catch {
          sessionStorage.removeItem("currentUser")
        }
      }
    }
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    const user = demoUsers.find(
      (u) => u.email === email && u.password === password
    )

    if (!user) {
      return { success: false, error: "メールアドレスまたはパスワードが正しくありません" }
    }

    const { password: _, ...userWithoutPassword } = user
    this.currentUser = userWithoutPassword

    // sessionStorageに保存
    if (typeof window !== "undefined") {
      sessionStorage.setItem("currentUser", JSON.stringify(this.currentUser))
    }

    this.notifyListeners()
    return { success: true }
  }

  logout(): void {
    this.currentUser = null
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("currentUser")
    }
    this.notifyListeners()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // 状態変更を監視するためのsubscribe機能
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }

  // デモ用: 利用可能なユーザー一覧を取得
  getDemoUsers(): { email: string; password: string; name: string; role: string }[] {
    return demoUsers.map(({ id, ...user }) => user)
  }
}

export const authStore = new AuthStore()
