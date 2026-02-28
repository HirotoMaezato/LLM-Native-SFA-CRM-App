export type AccountStatus = "活動中" | "休止" | "見込み" | "提携"

export type AccountIndustry = "IT" | "製造" | "金融" | "物流" | "医療" | "建設" | "農業" | "観光" | "小売" | "その他"

export interface Account {
  id: string
  name: string                    // 会社名
  industry?: AccountIndustry      // 業種
  region: string                  // 地域
  phone?: string
  email?: string
  website?: string
  representative?: string         // 代表者名
  employeeCount?: number
  annualRevenue?: number
  address?: string
  status: AccountStatus
  createdAt: string
  updatedAt: string
  description?: string
  notes?: string
}

export interface AccountFilterCondition {
  id: string
  name: string
  filters: {
    status?: AccountStatus[]
    industry?: AccountIndustry[]
    region?: string[]
    minRevenue?: number
    maxRevenue?: number
  }
  sortBy?: keyof Account
  sortOrder?: "asc" | "desc"
}
