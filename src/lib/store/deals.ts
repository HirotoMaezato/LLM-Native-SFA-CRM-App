"use client"

import { Deal, FilterCondition, Tag } from "@/types/deal"

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

// シンプルなストア実装（実際にはZustandやReduxを使用することを推奨）
class DealsStore {
  private deals: Deal[] = mockDeals
  private filterConditions: FilterCondition[] = mockFilterConditions
  private tags: Tag[] = mockTags

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
}

export const dealsStore = new DealsStore()
