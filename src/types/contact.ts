export interface Contact {
  id: string
  accountId: string              // リンク先の取引先
  accountName?: string           // 表示用（参照）
  firstName: string              // 名
  lastName: string               // 姓
  title?: string                 // 役職
  department?: string            // 部門
  email: string
  phone?: string
  mobilePhone?: string
  isPrimaryContact: boolean      // 主担当者かどうか
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface ContactFilterCondition {
  id: string
  name: string
  filters: {
    accountId?: string
    isPrimaryContact?: boolean
    department?: string[]
    title?: string[]
  }
  sortBy?: keyof Contact
  sortOrder?: "asc" | "desc"
}
