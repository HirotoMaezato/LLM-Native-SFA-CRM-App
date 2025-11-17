export type DealStatus = "新規" | "アプローチ中" | "提案" | "商談中" | "クロージング" | "成約" | "失注"

export type DealPriority = "高" | "中" | "低"

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Deal {
  id: string
  title: string
  company: string
  contactPerson: string
  contactEmail?: string
  contactPhone?: string
  amount: number
  status: DealStatus
  priority: DealPriority
  probability: number // 0-100
  expectedCloseDate: string
  createdAt: string
  updatedAt: string
  tags: Tag[]
  description?: string
  area?: string
  product?: string
  team?: string
  notes?: string
}

export interface FilterCondition {
  id: string
  name: string
  filters: {
    status?: DealStatus[]
    priority?: DealPriority[]
    minAmount?: number
    maxAmount?: number
    area?: string[]
    product?: string[]
    team?: string[]
    tags?: string[]
  }
  sortBy?: keyof Deal
  sortOrder?: "asc" | "desc"
}

export interface Trigger {
  id: string
  name: string
  condition: {
    field: keyof Deal
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains"
    value: any
  }
  action: {
    type: "notification" | "create_record"
    config: any
  }
  enabled: boolean
}
