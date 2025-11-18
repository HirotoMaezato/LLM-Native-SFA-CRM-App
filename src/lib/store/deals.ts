"use client"

import { Deal, FilterCondition, Tag, CustomReport, CustomReportConfig } from "@/types/deal"

// モックデータ
const mockTags: Tag[] = [
  { id: "1", name: "重要", color: "#ef4444" },
  { id: "2", name: "至急", color: "#f59e0b" },
  { id: "3", name: "大口", color: "#8b5cf6" },
  { id: "4", name: "既存顧客", color: "#3b82f6" },
]

const mockDeals: Deal[] = [
  {
    id: "1",
    title: "新規CRMシステム導入",
    company: "株式会社テックソリューション",
    contactPerson: "山田太郎",
    contactEmail: "yamada@techsol.co.jp",
    contactPhone: "03-1234-5678",
    amount: 5000000,
    status: "商談中",
    priority: "高",
    probability: 70,
    expectedCloseDate: "2025-12-15",
    createdAt: "2025-10-01",
    updatedAt: "2025-11-15",
    tags: [mockTags[0], mockTags[2]],
    description: "既存システムの老朽化に伴うCRM刷新案件",
    area: "東京",
    product: "CRMシステム",
    team: "第一営業部",
    notes: "来週デモ実施予定"
  },
  {
    id: "2",
    title: "Webサイトリニューアル",
    company: "マーケティング株式会社",
    contactPerson: "佐藤花子",
    contactEmail: "sato@marketing.co.jp",
    contactPhone: "03-9876-5432",
    amount: 2000000,
    status: "提案",
    priority: "中",
    probability: 50,
    expectedCloseDate: "2025-12-30",
    createdAt: "2025-10-15",
    updatedAt: "2025-11-10",
    tags: [mockTags[3]],
    description: "コーポレートサイトの全面リニューアル",
    area: "大阪",
    product: "Webサイト制作",
    team: "第二営業部",
  },
  {
    id: "3",
    title: "クラウドインフラ構築",
    company: "株式会社グローバルトレード",
    contactPerson: "鈴木一郎",
    contactEmail: "suzuki@globaltrade.co.jp",
    contactPhone: "06-1111-2222",
    amount: 8000000,
    status: "新規",
    priority: "高",
    probability: 30,
    expectedCloseDate: "2026-01-31",
    createdAt: "2025-11-01",
    updatedAt: "2025-11-17",
    tags: [mockTags[0], mockTags[1], mockTags[2]],
    description: "AWS移行とマイクロサービス化",
    area: "東京",
    product: "クラウドサービス",
    team: "第一営業部",
    notes: "予算確保済み。技術的な課題をヒアリング中"
  },
]

const mockFilterConditions: FilterCondition[] = [
  {
    id: "1",
    name: "高額案件",
    filters: {
      minAmount: 5000000,
      priority: ["高"]
    },
    sortBy: "amount",
    sortOrder: "desc"
  },
  {
    id: "2",
    name: "今月クロージング予定",
    filters: {
      status: ["商談中", "クロージング"]
    },
    sortBy: "expectedCloseDate",
    sortOrder: "asc"
  }
]

// カスタムレポートのモックデータ
const mockCustomReports: CustomReport[] = [
  {
    id: "1",
    name: "エリア別売上",
    description: "各エリアの売上金額を比較",
    config: {
      chartType: "bar",
      dimension: "area",
      metric: "sum",
      metricField: "amount",
      filters: {}
    },
    createdAt: "2025-11-01",
    updatedAt: "2025-11-01"
  },
  {
    id: "2",
    name: "ステータス分布",
    description: "案件のステータス分布を可視化",
    config: {
      chartType: "pie",
      dimension: "status",
      metric: "count",
      metricField: "count",
      filters: {}
    },
    createdAt: "2025-11-10",
    updatedAt: "2025-11-10"
  }
]

// シンプルなストア実装（実際にはZustandやReduxを使用することを推奨）
class DealsStore {
  private deals: Deal[] = mockDeals
  private filterConditions: FilterCondition[] = mockFilterConditions
  private tags: Tag[] = mockTags
  private customReports: CustomReport[] = mockCustomReports

  getDeals(): Deal[] {
    return this.deals
  }

  getDealById(id: string): Deal | undefined {
    return this.deals.find(deal => deal.id === id)
  }

  addDeal(deal: Omit<Deal, "id" | "createdAt" | "updatedAt">): Deal {
    const newDeal: Deal = {
      ...deal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.deals.push(newDeal)
    return newDeal
  }

  updateDeal(id: string, updates: Partial<Deal>): Deal | undefined {
    const index = this.deals.findIndex(deal => deal.id === id)
    if (index === -1) return undefined

    this.deals[index] = {
      ...this.deals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return this.deals[index]
  }

  deleteDeal(id: string): boolean {
    const index = this.deals.findIndex(deal => deal.id === id)
    if (index === -1) return false

    this.deals.splice(index, 1)
    return true
  }

  getFilterConditions(): FilterCondition[] {
    return this.filterConditions
  }

  saveFilterCondition(condition: Omit<FilterCondition, "id">): FilterCondition {
    const newCondition: FilterCondition = {
      ...condition,
      id: Date.now().toString(),
    }
    this.filterConditions.push(newCondition)
    return newCondition
  }

  getTags(): Tag[] {
    return this.tags
  }

  filterDeals(condition: FilterCondition): Deal[] {
    let filtered = [...this.deals]

    const { filters, sortBy, sortOrder } = condition

    // フィルタリング
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(deal => filters.status!.includes(deal.status))
    }
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(deal => filters.priority!.includes(deal.priority))
    }
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(deal => deal.amount >= filters.minAmount!)
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(deal => deal.amount <= filters.maxAmount!)
    }
    if (filters.area && filters.area.length > 0) {
      filtered = filtered.filter(deal => deal.area && filters.area!.includes(deal.area))
    }
    if (filters.product && filters.product.length > 0) {
      filtered = filtered.filter(deal => deal.product && filters.product!.includes(deal.product))
    }
    if (filters.team && filters.team.length > 0) {
      filtered = filtered.filter(deal => deal.team && filters.team!.includes(deal.team))
    }
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(deal =>
        deal.tags.some(tag => filters.tags!.includes(tag.id))
      )
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

  // カスタムレポート関連メソッド
  getCustomReports(): CustomReport[] {
    return this.customReports
  }

  getCustomReportById(id: string): CustomReport | undefined {
    return this.customReports.find(report => report.id === id)
  }

  saveCustomReport(report: Omit<CustomReport, "id" | "createdAt" | "updatedAt">): CustomReport {
    const newReport: CustomReport = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.customReports.push(newReport)
    return newReport
  }

  updateCustomReport(id: string, updates: Partial<Omit<CustomReport, "id" | "createdAt">>): CustomReport | undefined {
    const index = this.customReports.findIndex(report => report.id === id)
    if (index === -1) return undefined

    this.customReports[index] = {
      ...this.customReports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return this.customReports[index]
  }

  deleteCustomReport(id: string): boolean {
    const index = this.customReports.findIndex(report => report.id === id)
    if (index === -1) return false

    this.customReports.splice(index, 1)
    return true
  }

  // レポートデータ生成メソッド
  generateReportData(config: CustomReportConfig): Array<{ name: string; value: number }> {
    let deals = [...this.deals]
    const { filters, dimension, metric, metricField } = config

    // フィルタリング
    if (filters.status && filters.status.length > 0) {
      deals = deals.filter(deal => filters.status!.includes(deal.status))
    }
    if (filters.priority && filters.priority.length > 0) {
      deals = deals.filter(deal => filters.priority!.includes(deal.priority))
    }
    if (filters.minAmount !== undefined) {
      deals = deals.filter(deal => deal.amount >= filters.minAmount!)
    }
    if (filters.maxAmount !== undefined) {
      deals = deals.filter(deal => deal.amount <= filters.maxAmount!)
    }
    if (filters.area && filters.area.length > 0) {
      deals = deals.filter(deal => deal.area && filters.area!.includes(deal.area))
    }
    if (filters.product && filters.product.length > 0) {
      deals = deals.filter(deal => deal.product && filters.product!.includes(deal.product))
    }
    if (filters.team && filters.team.length > 0) {
      deals = deals.filter(deal => deal.team && filters.team!.includes(deal.team))
    }
    if (filters.tags && filters.tags.length > 0) {
      deals = deals.filter(deal =>
        deal.tags.some(tag => filters.tags!.includes(tag.id))
      )
    }
    if (filters.dateRange?.start) {
      deals = deals.filter(deal => deal.expectedCloseDate >= filters.dateRange!.start!)
    }
    if (filters.dateRange?.end) {
      deals = deals.filter(deal => deal.expectedCloseDate <= filters.dateRange!.end!)
    }

    // ディメンションでグループ化
    const grouped: Record<string, Deal[]> = {}

    deals.forEach(deal => {
      let key: string

      switch (dimension) {
        case "status":
          key = deal.status
          break
        case "area":
          key = deal.area || "未設定"
          break
        case "product":
          key = deal.product || "未設定"
          break
        case "team":
          key = deal.team || "未設定"
          break
        case "priority":
          key = deal.priority
          break
        case "month":
          key = deal.expectedCloseDate.substring(0, 7) // YYYY-MM format
          break
        default:
          key = "その他"
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(deal)
    })

    // メトリクス計算
    const result: Array<{ name: string; value: number }> = []

    Object.entries(grouped).forEach(([name, groupDeals]) => {
      let value: number

      switch (metric) {
        case "count":
          value = groupDeals.length
          break
        case "sum":
          if (metricField === "amount") {
            value = groupDeals.reduce((sum, deal) => sum + deal.amount, 0)
          } else if (metricField === "probability") {
            value = groupDeals.reduce((sum, deal) => sum + deal.probability, 0)
          } else {
            value = groupDeals.length
          }
          break
        case "average":
          if (metricField === "amount") {
            value = groupDeals.length > 0
              ? groupDeals.reduce((sum, deal) => sum + deal.amount, 0) / groupDeals.length
              : 0
          } else if (metricField === "probability") {
            value = groupDeals.length > 0
              ? groupDeals.reduce((sum, deal) => sum + deal.probability, 0) / groupDeals.length
              : 0
          } else {
            value = groupDeals.length
          }
          break
        default:
          value = groupDeals.length
      }

      result.push({ name, value })
    })

    // 月別の場合はソート
    if (dimension === "month") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }
}

export const dealsStore = new DealsStore()
