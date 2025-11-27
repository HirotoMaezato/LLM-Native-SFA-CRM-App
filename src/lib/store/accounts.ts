"use client"

import { Account, AccountFilterCondition, AccountStatus, AccountIndustry } from "@/types/account"

// モックアカウントデータ（商談データに基づく会社）
const mockAccounts: Account[] = [
  {
    id: "1",
    name: "株式会社テックソリューション",
    industry: "IT",
    region: "関東",
    phone: "03-1234-5678",
    email: "info@techsol.co.jp",
    website: "https://techsol.co.jp",
    representative: "山田太郎",
    employeeCount: 250,
    annualRevenue: 1500000000,
    address: "東京都渋谷区渋谷1-1-1",
    status: "活動中",
    createdAt: "2025-01-15",
    updatedAt: "2025-11-15",
    description: "ITソリューション提供企業",
    notes: "長期取引先、決裁が早い"
  },
  {
    id: "2",
    name: "マーケティング株式会社",
    industry: "IT",
    region: "関東",
    phone: "03-9876-5432",
    email: "contact@marketing.co.jp",
    website: "https://marketing.co.jp",
    representative: "佐藤一郎",
    employeeCount: 120,
    annualRevenue: 800000000,
    address: "東京都新宿区新宿2-2-2",
    status: "活動中",
    createdAt: "2025-02-01",
    updatedAt: "2025-11-10",
    description: "デジタルマーケティング支援",
  },
  {
    id: "3",
    name: "株式会社グローバルトレード",
    industry: "物流",
    region: "関東",
    phone: "06-1111-2222",
    email: "info@globaltrade.co.jp",
    website: "https://globaltrade.co.jp",
    representative: "鈴木一郎",
    employeeCount: 500,
    annualRevenue: 5000000000,
    address: "東京都港区港南3-3-3",
    status: "活動中",
    createdAt: "2025-03-01",
    updatedAt: "2025-11-17",
    description: "国際貿易・物流サービス",
    notes: "大型案件の可能性あり"
  },
  {
    id: "4",
    name: "関西電機工業株式会社",
    industry: "製造",
    region: "関西",
    phone: "06-2345-6789",
    email: "info@kansai-denki.co.jp",
    website: "https://kansai-denki.co.jp",
    representative: "田中誠",
    employeeCount: 1200,
    annualRevenue: 10000000000,
    address: "大阪府大阪市中央区本町4-4-4",
    status: "活動中",
    createdAt: "2025-01-20",
    updatedAt: "2025-11-16",
    description: "電機製品製造メーカー",
  },
  {
    id: "5",
    name: "大阪フーズ株式会社",
    industry: "小売",
    region: "関西",
    phone: "06-3456-7890",
    email: "sales@osaka-foods.co.jp",
    website: "https://osaka-foods.co.jp",
    representative: "高橋美咲",
    employeeCount: 80,
    annualRevenue: 500000000,
    address: "大阪府大阪市北区梅田5-5-5",
    status: "活動中",
    createdAt: "2025-04-01",
    updatedAt: "2025-11-14",
    description: "食品販売・EC事業",
  },
  {
    id: "6",
    name: "関西物流サービス",
    industry: "物流",
    region: "関西",
    phone: "06-4567-8901",
    email: "info@kansai-logistics.co.jp",
    website: "https://kansai-logistics.co.jp",
    representative: "渡辺健一",
    employeeCount: 350,
    annualRevenue: 2000000000,
    address: "大阪府堺市堺区堺町6-6-6",
    status: "活動中",
    createdAt: "2025-02-15",
    updatedAt: "2025-11-17",
    description: "物流・倉庫サービス",
    notes: "契約間近"
  },
  {
    id: "7",
    name: "東北アグリテック株式会社",
    industry: "農業",
    region: "東北",
    phone: "022-1234-5678",
    email: "info@tohoku-agri.co.jp",
    website: "https://tohoku-agri.co.jp",
    representative: "伊藤拓也",
    employeeCount: 60,
    annualRevenue: 300000000,
    address: "宮城県仙台市青葉区一番町7-7-7",
    status: "活動中",
    createdAt: "2025-05-01",
    updatedAt: "2025-11-15",
    description: "農業IoT・スマート農業",
  },
  {
    id: "8",
    name: "仙台観光協会",
    industry: "観光",
    region: "東北",
    phone: "022-2345-6789",
    email: "info@sendai-tourism.jp",
    website: "https://sendai-tourism.jp",
    representative: "菅原由美",
    employeeCount: 30,
    annualRevenue: 100000000,
    address: "宮城県仙台市青葉区国分町8-8-8",
    status: "活動中",
    createdAt: "2025-03-15",
    updatedAt: "2025-10-31",
    description: "地域観光振興",
  },
  {
    id: "9",
    name: "九州重工業株式会社",
    industry: "製造",
    region: "九州",
    phone: "092-1234-5678",
    email: "info@kyushu-heavy.co.jp",
    website: "https://kyushu-heavy.co.jp",
    representative: "中村浩二",
    employeeCount: 2500,
    annualRevenue: 30000000000,
    address: "福岡県北九州市小倉北区城内9-9-9",
    status: "活動中",
    createdAt: "2025-01-10",
    updatedAt: "2025-11-17",
    description: "重工業・機械製造",
    notes: "大型DX案件検討中"
  },
  {
    id: "10",
    name: "福岡ロジスティクス",
    industry: "物流",
    region: "九州",
    phone: "092-2345-6789",
    email: "sales@fukuoka-logi.co.jp",
    website: "https://fukuoka-logi.co.jp",
    representative: "小林恵子",
    employeeCount: 200,
    annualRevenue: 1200000000,
    address: "福岡県福岡市博多区博多駅前10-10-10",
    status: "活動中",
    createdAt: "2025-04-15",
    updatedAt: "2025-11-16",
    description: "物流倉庫・配送サービス",
  },
  {
    id: "11",
    name: "北海道ツーリズム株式会社",
    industry: "観光",
    region: "北海道",
    phone: "011-1234-5678",
    email: "info@hokkaido-tourism.co.jp",
    website: "https://hokkaido-tourism.co.jp",
    representative: "佐々木翔",
    employeeCount: 150,
    annualRevenue: 900000000,
    address: "北海道札幌市中央区大通西11-11-11",
    status: "活動中",
    createdAt: "2025-02-20",
    updatedAt: "2025-11-17",
    description: "観光事業・旅行サービス",
    notes: "インバウンド需要増加中"
  },
  {
    id: "12",
    name: "四国銀行",
    industry: "金融",
    region: "四国",
    phone: "088-1234-5678",
    email: "info@shikoku-bank.co.jp",
    website: "https://shikoku-bank.co.jp",
    representative: "石田康弘",
    employeeCount: 3000,
    annualRevenue: 50000000000,
    address: "高知県高知市本町12-12-12",
    status: "活動中",
    createdAt: "2025-01-05",
    updatedAt: "2025-11-17",
    description: "地方銀行",
    notes: "CRM刷新案件が進行中"
  },
  {
    id: "13",
    name: "名古屋オートパーツ株式会社",
    industry: "製造",
    region: "中部",
    phone: "052-1234-5678",
    email: "info@nagoya-ap.co.jp",
    website: "https://nagoya-ap.co.jp",
    representative: "横山隆",
    employeeCount: 800,
    annualRevenue: 6000000000,
    address: "愛知県名古屋市中区栄13-13-13",
    status: "活動中",
    createdAt: "2025-03-10",
    updatedAt: "2025-11-15",
    description: "自動車部品製造",
  },
  {
    id: "14",
    name: "広島港運株式会社",
    industry: "物流",
    region: "中国",
    phone: "082-1234-5678",
    email: "info@hiroshima-port.co.jp",
    website: "https://hiroshima-port.co.jp",
    representative: "山本健太",
    employeeCount: 400,
    annualRevenue: 2500000000,
    address: "広島県広島市南区宇品海岸14-14-14",
    status: "活動中",
    createdAt: "2025-04-01",
    updatedAt: "2025-11-16",
    description: "港湾物流・コンテナ輸送",
  },
  {
    id: "15",
    name: "休止中テスト株式会社",
    industry: "その他",
    region: "関東",
    phone: "03-0000-0000",
    email: "test@test.co.jp",
    representative: "テスト太郎",
    employeeCount: 10,
    status: "休止",
    createdAt: "2024-01-01",
    updatedAt: "2024-06-01",
    description: "テスト用休止アカウント",
  },
]

const mockFilterConditions: AccountFilterCondition[] = [
  {
    id: "1",
    name: "大口顧客",
    filters: {
      minRevenue: 1000000000,
      status: ["活動中"]
    },
    sortBy: "annualRevenue",
    sortOrder: "desc"
  },
  {
    id: "2",
    name: "製造業",
    filters: {
      industry: ["製造"]
    },
    sortBy: "name",
    sortOrder: "asc"
  }
]

// アカウントストアクラス
class AccountsStore {
  private accounts: Account[] = mockAccounts
  private filterConditions: AccountFilterCondition[] = mockFilterConditions

  getAccounts(): Account[] {
    return this.accounts
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.find(account => account.id === id)
  }

  addAccount(account: Omit<Account, "id" | "createdAt" | "updatedAt">): Account {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    this.accounts.push(newAccount)
    return newAccount
  }

  updateAccount(id: string, updates: Partial<Account>): Account | undefined {
    const index = this.accounts.findIndex(account => account.id === id)
    if (index === -1) return undefined

    this.accounts[index] = {
      ...this.accounts[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    }
    return this.accounts[index]
  }

  deleteAccount(id: string): boolean {
    const index = this.accounts.findIndex(account => account.id === id)
    if (index === -1) return false

    this.accounts.splice(index, 1)
    return true
  }

  getFilterConditions(): AccountFilterCondition[] {
    return this.filterConditions
  }

  saveFilterCondition(condition: Omit<AccountFilterCondition, "id">): AccountFilterCondition {
    const newCondition: AccountFilterCondition = {
      ...condition,
      id: Date.now().toString(),
    }
    this.filterConditions.push(newCondition)
    return newCondition
  }

  filterAccounts(condition: AccountFilterCondition): Account[] {
    let filtered = [...this.accounts]

    const { filters, sortBy, sortOrder } = condition

    // フィルタリング
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(account => filters.status!.includes(account.status))
    }
    if (filters.industry && filters.industry.length > 0) {
      filtered = filtered.filter(account => account.industry && filters.industry!.includes(account.industry))
    }
    if (filters.region && filters.region.length > 0) {
      filtered = filtered.filter(account => filters.region!.includes(account.region))
    }
    if (filters.minRevenue !== undefined) {
      filtered = filtered.filter(account => account.annualRevenue && account.annualRevenue >= filters.minRevenue!)
    }
    if (filters.maxRevenue !== undefined) {
      filtered = filtered.filter(account => account.annualRevenue && account.annualRevenue <= filters.maxRevenue!)
    }

    // ソート
    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]

        if (aVal === undefined || bVal === undefined) return 0

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc'
            ? aVal - bVal
            : bVal - aVal
        }

        return 0
      })
    }

    return filtered
  }

  // 地域のユニーク値を取得
  getRegions(): string[] {
    const regions = new Set<string>()
    this.accounts.forEach(account => {
      regions.add(account.region)
    })
    return Array.from(regions).sort()
  }

  // 業種のユニーク値を取得
  getIndustries(): AccountIndustry[] {
    const industries = new Set<AccountIndustry>()
    this.accounts.forEach(account => {
      if (account.industry) {
        industries.add(account.industry)
      }
    })
    return Array.from(industries).sort()
  }
}

export const accountsStore = new AccountsStore()
