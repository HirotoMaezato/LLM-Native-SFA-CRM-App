"use client"

import { Contact, ContactFilterCondition } from "@/types/contact"

// モック担当者データ（商談データに基づく担当者）
const mockContacts: Contact[] = [
  // 株式会社テックソリューション
  {
    id: "1",
    accountId: "1",
    accountName: "株式会社テックソリューション",
    firstName: "太郎",
    lastName: "山田",
    title: "営業部長",
    department: "営業部",
    email: "yamada@techsol.co.jp",
    phone: "03-1234-5678",
    mobilePhone: "090-1234-5678",
    isPrimaryContact: true,
    createdAt: "2025-01-15",
    updatedAt: "2025-11-15",
    notes: "決裁権あり、技術的な話も理解できる"
  },
  {
    id: "2",
    accountId: "1",
    accountName: "株式会社テックソリューション",
    firstName: "次郎",
    lastName: "田中",
    title: "情報システム部長",
    department: "情報システム部",
    email: "tanaka@techsol.co.jp",
    phone: "03-1234-5679",
    isPrimaryContact: false,
    createdAt: "2025-03-01",
    updatedAt: "2025-10-20",
  },
  // マーケティング株式会社
  {
    id: "3",
    accountId: "2",
    accountName: "マーケティング株式会社",
    firstName: "花子",
    lastName: "佐藤",
    title: "マーケティング部長",
    department: "マーケティング部",
    email: "sato@marketing.co.jp",
    phone: "03-9876-5432",
    mobilePhone: "080-9876-5432",
    isPrimaryContact: true,
    createdAt: "2025-02-01",
    updatedAt: "2025-11-10",
  },
  // 株式会社グローバルトレード
  {
    id: "4",
    accountId: "3",
    accountName: "株式会社グローバルトレード",
    firstName: "一郎",
    lastName: "鈴木",
    title: "IT戦略部長",
    department: "IT戦略部",
    email: "suzuki@globaltrade.co.jp",
    phone: "06-1111-2222",
    mobilePhone: "090-1111-2222",
    isPrimaryContact: true,
    createdAt: "2025-03-01",
    updatedAt: "2025-11-17",
    notes: "技術的な意思決定者"
  },
  // 関西電機工業株式会社
  {
    id: "5",
    accountId: "4",
    accountName: "関西電機工業株式会社",
    firstName: "誠",
    lastName: "田中",
    title: "生産技術部長",
    department: "生産技術部",
    email: "tanaka@kansai-denki.co.jp",
    phone: "06-2345-6789",
    mobilePhone: "080-2345-6789",
    isPrimaryContact: true,
    createdAt: "2025-01-20",
    updatedAt: "2025-11-16",
  },
  // 大阪フーズ株式会社
  {
    id: "6",
    accountId: "5",
    accountName: "大阪フーズ株式会社",
    firstName: "美咲",
    lastName: "高橋",
    title: "EC事業部長",
    department: "EC事業部",
    email: "takahashi@osaka-foods.co.jp",
    phone: "06-3456-7890",
    isPrimaryContact: true,
    createdAt: "2025-04-01",
    updatedAt: "2025-11-14",
  },
  // 関西物流サービス
  {
    id: "7",
    accountId: "6",
    accountName: "関西物流サービス",
    firstName: "健一",
    lastName: "渡辺",
    title: "経営企画部長",
    department: "経営企画部",
    email: "watanabe@kansai-logistics.co.jp",
    phone: "06-4567-8901",
    mobilePhone: "090-4567-8901",
    isPrimaryContact: true,
    createdAt: "2025-02-15",
    updatedAt: "2025-11-17",
    notes: "契約交渉中"
  },
  // 東北アグリテック株式会社
  {
    id: "8",
    accountId: "7",
    accountName: "東北アグリテック株式会社",
    firstName: "拓也",
    lastName: "伊藤",
    title: "取締役",
    department: "経営",
    email: "ito@tohoku-agri.co.jp",
    phone: "022-1234-5678",
    isPrimaryContact: true,
    createdAt: "2025-05-01",
    updatedAt: "2025-11-15",
  },
  // 仙台観光協会
  {
    id: "9",
    accountId: "8",
    accountName: "仙台観光協会",
    firstName: "由美",
    lastName: "菅原",
    title: "事務局長",
    department: "事務局",
    email: "sugawara@sendai-tourism.jp",
    phone: "022-2345-6789",
    isPrimaryContact: true,
    createdAt: "2025-03-15",
    updatedAt: "2025-10-31",
  },
  // 九州重工業株式会社
  {
    id: "10",
    accountId: "9",
    accountName: "九州重工業株式会社",
    firstName: "浩二",
    lastName: "中村",
    title: "DX推進室長",
    department: "DX推進室",
    email: "nakamura@kyushu-heavy.co.jp",
    phone: "092-1234-5678",
    mobilePhone: "080-1234-5678",
    isPrimaryContact: true,
    createdAt: "2025-01-10",
    updatedAt: "2025-11-17",
    notes: "DXプロジェクト推進者"
  },
  {
    id: "11",
    accountId: "9",
    accountName: "九州重工業株式会社",
    firstName: "明",
    lastName: "佐藤",
    title: "情報システム部課長",
    department: "情報システム部",
    email: "a-sato@kyushu-heavy.co.jp",
    phone: "092-1234-5680",
    isPrimaryContact: false,
    createdAt: "2025-05-01",
    updatedAt: "2025-11-10",
  },
  // 福岡ロジスティクス
  {
    id: "12",
    accountId: "10",
    accountName: "福岡ロジスティクス",
    firstName: "恵子",
    lastName: "小林",
    title: "業務改善部マネージャー",
    department: "業務改善部",
    email: "kobayashi@fukuoka-logi.co.jp",
    phone: "092-2345-6789",
    isPrimaryContact: true,
    createdAt: "2025-04-15",
    updatedAt: "2025-11-16",
  },
  // 北海道ツーリズム株式会社
  {
    id: "13",
    accountId: "11",
    accountName: "北海道ツーリズム株式会社",
    firstName: "翔",
    lastName: "佐々木",
    title: "IT企画部長",
    department: "IT企画部",
    email: "sasaki@hokkaido-tourism.co.jp",
    phone: "011-1234-5678",
    mobilePhone: "090-1234-0000",
    isPrimaryContact: true,
    createdAt: "2025-02-20",
    updatedAt: "2025-11-17",
    notes: "予約システム案件担当"
  },
  // 四国銀行
  {
    id: "14",
    accountId: "12",
    accountName: "四国銀行",
    firstName: "康弘",
    lastName: "石田",
    title: "営業統括部長",
    department: "営業統括部",
    email: "ishida@shikoku-bank.co.jp",
    phone: "088-1234-5678",
    mobilePhone: "080-1234-0001",
    isPrimaryContact: true,
    createdAt: "2025-01-05",
    updatedAt: "2025-11-17",
    notes: "CRM刷新の意思決定者"
  },
  {
    id: "15",
    accountId: "12",
    accountName: "四国銀行",
    firstName: "隆",
    lastName: "山下",
    title: "情報システム部課長",
    department: "情報システム部",
    email: "yamashita@shikoku-bank.co.jp",
    phone: "088-1234-5680",
    isPrimaryContact: false,
    createdAt: "2025-02-01",
    updatedAt: "2025-10-30",
  },
  // 名古屋オートパーツ株式会社
  {
    id: "16",
    accountId: "13",
    accountName: "名古屋オートパーツ株式会社",
    firstName: "隆",
    lastName: "横山",
    title: "生産管理部長",
    department: "生産管理部",
    email: "yokoyama@nagoya-ap.co.jp",
    phone: "052-1234-5678",
    isPrimaryContact: true,
    createdAt: "2025-03-10",
    updatedAt: "2025-11-15",
  },
  // 広島港運株式会社
  {
    id: "17",
    accountId: "14",
    accountName: "広島港運株式会社",
    firstName: "健太",
    lastName: "山本",
    title: "物流企画部長",
    department: "物流企画部",
    email: "yamamoto@hiroshima-port.co.jp",
    phone: "082-1234-5678",
    mobilePhone: "090-8212-3456",
    isPrimaryContact: true,
    createdAt: "2025-04-01",
    updatedAt: "2025-11-16",
  },
]

const mockFilterConditions: ContactFilterCondition[] = [
  {
    id: "1",
    name: "主担当者のみ",
    filters: {
      isPrimaryContact: true
    },
    sortBy: "lastName",
    sortOrder: "asc"
  },
  {
    id: "2",
    name: "部長クラス",
    filters: {
      title: ["部長"]
    },
    sortBy: "accountName",
    sortOrder: "asc"
  }
]

// 担当者ストアクラス
class ContactsStore {
  private contacts: Contact[] = mockContacts
  private filterConditions: ContactFilterCondition[] = mockFilterConditions

  getContacts(): Contact[] {
    return this.contacts
  }

  getContactById(id: string): Contact | undefined {
    return this.contacts.find(contact => contact.id === id)
  }

  getContactsByAccountId(accountId: string): Contact[] {
    return this.contacts.filter(contact => contact.accountId === accountId)
  }

  addContact(contact: Omit<Contact, "id" | "createdAt" | "updatedAt">): Contact {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    this.contacts.push(newContact)
    return newContact
  }

  updateContact(id: string, updates: Partial<Contact>): Contact | undefined {
    const index = this.contacts.findIndex(contact => contact.id === id)
    if (index === -1) return undefined

    this.contacts[index] = {
      ...this.contacts[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    }
    return this.contacts[index]
  }

  deleteContact(id: string): boolean {
    const index = this.contacts.findIndex(contact => contact.id === id)
    if (index === -1) return false

    this.contacts.splice(index, 1)
    return true
  }

  getFilterConditions(): ContactFilterCondition[] {
    return this.filterConditions
  }

  saveFilterCondition(condition: Omit<ContactFilterCondition, "id">): ContactFilterCondition {
    const newCondition: ContactFilterCondition = {
      ...condition,
      id: Date.now().toString(),
    }
    this.filterConditions.push(newCondition)
    return newCondition
  }

  filterContacts(condition: ContactFilterCondition): Contact[] {
    let filtered = [...this.contacts]

    const { filters, sortBy, sortOrder } = condition

    // フィルタリング
    if (filters.accountId) {
      filtered = filtered.filter(contact => contact.accountId === filters.accountId)
    }
    if (filters.isPrimaryContact !== undefined) {
      filtered = filtered.filter(contact => contact.isPrimaryContact === filters.isPrimaryContact)
    }
    if (filters.department && filters.department.length > 0) {
      filtered = filtered.filter(contact =>
        contact.department && filters.department!.some(dept => contact.department!.includes(dept))
      )
    }
    if (filters.title && filters.title.length > 0) {
      filtered = filtered.filter(contact =>
        contact.title && filters.title!.some(t => contact.title!.includes(t))
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

        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          return sortOrder === 'asc'
            ? (aVal ? 1 : 0) - (bVal ? 1 : 0)
            : (bVal ? 1 : 0) - (aVal ? 1 : 0)
        }

        return 0
      })
    }

    return filtered
  }

  // 部門のユニーク値を取得
  getDepartments(): string[] {
    const departments = new Set<string>()
    this.contacts.forEach(contact => {
      if (contact.department) {
        departments.add(contact.department)
      }
    })
    return Array.from(departments).sort()
  }

  // 役職のユニーク値を取得
  getTitles(): string[] {
    const titles = new Set<string>()
    this.contacts.forEach(contact => {
      if (contact.title) {
        titles.add(contact.title)
      }
    })
    return Array.from(titles).sort()
  }
}

export const contactsStore = new ContactsStore()
