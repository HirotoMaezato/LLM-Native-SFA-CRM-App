"use client"

import { Deal, FilterCondition, Tag, CustomReport, CustomReportConfig, AdvancedFilter, MetricDefinition, ReportDataPoint, DimensionField, DealStatus, DealPriority } from "@/types/deal"
import { evaluateFormula, evaluateCalculatedFields } from "@/lib/formula-parser"

// ディメンションの全ての可能な値を定義
const ALL_STATUSES: DealStatus[] = ["新規", "アプローチ中", "提案", "商談中", "クロージング", "成約", "失注"]
const ALL_PRIORITIES: DealPriority[] = ["高", "中", "低"]
const ALL_AREAS: string[] = ["関東", "関西", "東北", "九州", "北海道", "中部", "中国", "四国"]
const ALL_PRODUCTS: string[] = ["CRMシステム", "Webサイト制作", "クラウドサービス", "セキュリティソリューション", "データ分析基盤", "IoTシステム", "モバイルアプリ", "基幹システム"]
const ALL_TEAMS: string[] = ["第一営業部", "第二営業部", "西日本営業部", "九州営業部"]

// 月の範囲を生成するヘルパー関数
function generateMonthRange(startDate?: string, endDate?: string, existingMonths?: string[]): string[] {
  if (!startDate || !endDate) {
    // 日付範囲が指定されていない場合は既存の月のみ返す
    return existingMonths || []
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  const months: string[] = []

  // 開始月から終了月まで全ての月を生成
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

  while (current <= endMonth) {
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

// モックデータ
const mockTags: Tag[] = [
  { id: "1", name: "重要", color: "#ef4444" },
  { id: "2", name: "至急", color: "#f59e0b" },
  { id: "3", name: "大口", color: "#8b5cf6" },
  { id: "4", name: "既存顧客", color: "#3b82f6" },
]

const mockDeals: Deal[] = [
  // 関東エリア
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
    area: "関東",
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
    area: "関東",
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
    area: "関東",
    product: "クラウドサービス",
    team: "第一営業部",
    notes: "予算確保済み。技術的な課題をヒアリング中"
  },
  // 関西エリア
  {
    id: "4",
    title: "セキュリティ監視システム",
    company: "関西電機工業株式会社",
    contactPerson: "田中誠",
    contactEmail: "tanaka@kansai-denki.co.jp",
    contactPhone: "06-2345-6789",
    amount: 6500000,
    status: "商談中",
    priority: "高",
    probability: 65,
    expectedCloseDate: "2026-01-15",
    createdAt: "2025-10-20",
    updatedAt: "2025-11-16",
    tags: [mockTags[0], mockTags[2]],
    description: "工場向けセキュリティ監視システムの導入",
    area: "関西",
    product: "セキュリティソリューション",
    team: "西日本営業部",
    notes: "工場視察完了、見積もり提出予定"
  },
  {
    id: "5",
    title: "ECサイト構築",
    company: "大阪フーズ株式会社",
    contactPerson: "高橋美咲",
    contactEmail: "takahashi@osaka-foods.co.jp",
    contactPhone: "06-3456-7890",
    amount: 3500000,
    status: "提案",
    priority: "中",
    probability: 55,
    expectedCloseDate: "2025-12-20",
    createdAt: "2025-10-25",
    updatedAt: "2025-11-14",
    tags: [mockTags[3]],
    description: "食品ECサイトの新規構築",
    area: "関西",
    product: "Webサイト制作",
    team: "西日本営業部",
  },
  {
    id: "6",
    title: "データ分析プラットフォーム",
    company: "関西物流サービス",
    contactPerson: "渡辺健一",
    contactEmail: "watanabe@kansai-logistics.co.jp",
    contactPhone: "06-4567-8901",
    amount: 7000000,
    status: "クロージング",
    priority: "高",
    probability: 85,
    expectedCloseDate: "2025-11-30",
    createdAt: "2025-09-15",
    updatedAt: "2025-11-17",
    tags: [mockTags[0], mockTags[1], mockTags[2]],
    description: "物流データの可視化と予測分析",
    area: "関西",
    product: "データ分析基盤",
    team: "西日本営業部",
    notes: "契約書レビュー中"
  },
  // 東北エリア
  {
    id: "7",
    title: "農業IoTシステム",
    company: "東北アグリテック株式会社",
    contactPerson: "伊藤拓也",
    contactEmail: "ito@tohoku-agri.co.jp",
    contactPhone: "022-1234-5678",
    amount: 4500000,
    status: "商談中",
    priority: "中",
    probability: 60,
    expectedCloseDate: "2026-02-15",
    createdAt: "2025-10-10",
    updatedAt: "2025-11-15",
    tags: [mockTags[0]],
    description: "スマート農業向けIoTセンサーシステム",
    area: "東北",
    product: "クラウドサービス",
    team: "第一営業部",
    notes: "現地デモ実施予定"
  },
  {
    id: "8",
    title: "観光アプリ開発",
    company: "仙台観光協会",
    contactPerson: "菅原由美",
    contactEmail: "sugawara@sendai-tourism.jp",
    contactPhone: "022-2345-6789",
    amount: 2800000,
    status: "成約",
    priority: "中",
    probability: 100,
    expectedCloseDate: "2025-10-31",
    createdAt: "2025-08-01",
    updatedAt: "2025-10-31",
    tags: [mockTags[3]],
    description: "地域観光ガイドアプリの開発",
    area: "東北",
    product: "モバイルアプリ開発",
    team: "第二営業部",
  },
  // 九州エリア
  {
    id: "9",
    title: "製造業DXプロジェクト",
    company: "九州重工業株式会社",
    contactPerson: "中村浩二",
    contactEmail: "nakamura@kyushu-heavy.co.jp",
    contactPhone: "092-1234-5678",
    amount: 12000000,
    status: "アプローチ中",
    priority: "高",
    probability: 40,
    expectedCloseDate: "2026-03-31",
    createdAt: "2025-11-05",
    updatedAt: "2025-11-17",
    tags: [mockTags[0], mockTags[2]],
    description: "製造ラインのデジタル化推進",
    area: "九州",
    product: "データ分析基盤",
    team: "エンタープライズ営業部",
    notes: "初回ヒアリング完了"
  },
  {
    id: "10",
    title: "在庫管理システム",
    company: "福岡ロジスティクス",
    contactPerson: "小林恵子",
    contactEmail: "kobayashi@fukuoka-logi.co.jp",
    contactPhone: "092-2345-6789",
    amount: 3200000,
    status: "提案",
    priority: "中",
    probability: 50,
    expectedCloseDate: "2026-01-20",
    createdAt: "2025-10-28",
    updatedAt: "2025-11-16",
    tags: [mockTags[3]],
    description: "倉庫在庫のリアルタイム管理",
    area: "九州",
    product: "CRMシステム",
    team: "第三営業部",
  },
  {
    id: "11",
    title: "社内ポータル刷新",
    company: "九州電力グループ",
    contactPerson: "松本大輔",
    contactEmail: "matsumoto@kyuden-g.co.jp",
    contactPhone: "092-3456-7890",
    amount: 4800000,
    status: "商談中",
    priority: "高",
    probability: 70,
    expectedCloseDate: "2026-02-28",
    createdAt: "2025-10-15",
    updatedAt: "2025-11-15",
    tags: [mockTags[0], mockTags[2]],
    description: "グループ社内ポータルサイトの統合・刷新",
    area: "九州",
    product: "Webサイト制作",
    team: "エンタープライズ営業部",
  },
  // 北海道エリア
  {
    id: "12",
    title: "観光予約システム",
    company: "北海道ツーリズム株式会社",
    contactPerson: "佐々木翔",
    contactEmail: "sasaki@hokkaido-tourism.co.jp",
    contactPhone: "011-1234-5678",
    amount: 3800000,
    status: "クロージング",
    priority: "高",
    probability: 90,
    expectedCloseDate: "2025-12-10",
    createdAt: "2025-09-20",
    updatedAt: "2025-11-17",
    tags: [mockTags[0], mockTags[1]],
    description: "インバウンド向け予約プラットフォーム",
    area: "北海道",
    product: "Webサイト制作",
    team: "第一営業部",
    notes: "最終契約交渉中"
  },
  {
    id: "13",
    title: "酪農データ管理",
    company: "十勝農業協同組合",
    contactPerson: "加藤正明",
    contactEmail: "kato@tokachi-ja.or.jp",
    contactPhone: "0155-1234-5678",
    amount: 5500000,
    status: "商談中",
    priority: "中",
    probability: 55,
    expectedCloseDate: "2026-02-28",
    createdAt: "2025-10-30",
    updatedAt: "2025-11-16",
    tags: [mockTags[2]],
    description: "酪農家向けデータ管理クラウドシステム",
    area: "北海道",
    product: "クラウドサービス",
    team: "第一営業部",
  },
  // 中部エリア
  {
    id: "14",
    title: "自動車部品管理システム",
    company: "名古屋オートパーツ株式会社",
    contactPerson: "横山隆",
    contactEmail: "yokoyama@nagoya-ap.co.jp",
    contactPhone: "052-1234-5678",
    amount: 9000000,
    status: "提案",
    priority: "高",
    probability: 60,
    expectedCloseDate: "2026-01-31",
    createdAt: "2025-10-05",
    updatedAt: "2025-11-15",
    tags: [mockTags[0], mockTags[2]],
    description: "部品在庫・発注の自動化システム",
    area: "中部",
    product: "CRMシステム",
    team: "第三営業部",
    notes: "競合他社との比較検討中"
  },
  {
    id: "15",
    title: "スマートファクトリー化",
    company: "静岡精密機器株式会社",
    contactPerson: "青木智子",
    contactEmail: "aoki@shizuoka-seimitsu.co.jp",
    contactPhone: "054-2345-6789",
    amount: 15000000,
    status: "アプローチ中",
    priority: "高",
    probability: 35,
    expectedCloseDate: "2026-06-30",
    createdAt: "2025-11-10",
    updatedAt: "2025-11-17",
    tags: [mockTags[0], mockTags[1], mockTags[2]],
    description: "製造工程の完全自動化・IoT化",
    area: "中部",
    product: "データ分析基盤",
    team: "エンタープライズ営業部",
    notes: "要件定義ヒアリング開始"
  },
  {
    id: "16",
    title: "モバイル勤怠管理",
    company: "中部建設株式会社",
    contactPerson: "井上慎一",
    contactEmail: "inoue@chubu-kensetsu.co.jp",
    contactPhone: "052-3456-7890",
    amount: 2500000,
    status: "成約",
    priority: "中",
    probability: 100,
    expectedCloseDate: "2025-11-15",
    createdAt: "2025-09-01",
    updatedAt: "2025-11-15",
    tags: [mockTags[3]],
    description: "現場作業員向け勤怠管理アプリ",
    area: "中部",
    product: "モバイルアプリ開発",
    team: "第二営業部",
  },
  // 中国エリア
  {
    id: "17",
    title: "港湾物流最適化",
    company: "広島港運株式会社",
    contactPerson: "山本健太",
    contactEmail: "yamamoto@hiroshima-port.co.jp",
    contactPhone: "082-1234-5678",
    amount: 7500000,
    status: "商談中",
    priority: "高",
    probability: 65,
    expectedCloseDate: "2026-02-15",
    createdAt: "2025-10-12",
    updatedAt: "2025-11-16",
    tags: [mockTags[0], mockTags[2]],
    description: "港湾コンテナ管理の最適化システム",
    area: "中国",
    product: "データ分析基盤",
    team: "西日本営業部",
    notes: "現地調査完了"
  },
  {
    id: "18",
    title: "医療機関向けセキュリティ",
    company: "岡山医療センター",
    contactPerson: "藤田裕子",
    contactEmail: "fujita@okayama-mc.jp",
    contactPhone: "086-2345-6789",
    amount: 4200000,
    status: "提案",
    priority: "中",
    probability: 45,
    expectedCloseDate: "2026-01-31",
    createdAt: "2025-10-22",
    updatedAt: "2025-11-15",
    tags: [mockTags[0]],
    description: "医療情報セキュリティ強化",
    area: "中国",
    product: "セキュリティソリューション",
    team: "第三営業部",
  },
  // 四国エリア
  {
    id: "19",
    title: "地方銀行CRM導入",
    company: "四国銀行",
    contactPerson: "石田康弘",
    contactEmail: "ishida@shikoku-bank.co.jp",
    contactPhone: "088-1234-5678",
    amount: 8500000,
    status: "クロージング",
    priority: "高",
    probability: 80,
    expectedCloseDate: "2025-12-20",
    createdAt: "2025-08-15",
    updatedAt: "2025-11-17",
    tags: [mockTags[0], mockTags[1], mockTags[2]],
    description: "顧客管理・営業支援システムの刷新",
    area: "四国",
    product: "CRMシステム",
    team: "エンタープライズ営業部",
    notes: "役員プレゼン完了、契約準備中"
  },
  {
    id: "20",
    title: "農産物トレーサビリティ",
    company: "愛媛柑橘農業組合",
    contactPerson: "木村美穂",
    contactEmail: "kimura@ehime-citrus.or.jp",
    contactPhone: "089-2345-6789",
    amount: 3000000,
    status: "新規",
    priority: "中",
    probability: 25,
    expectedCloseDate: "2026-03-31",
    createdAt: "2025-11-12",
    updatedAt: "2025-11-17",
    tags: [],
    description: "農産物の生産履歴管理システム",
    area: "四国",
    product: "クラウドサービス",
    team: "第二営業部",
    notes: "初回商談予定"
  },
  // 追加案件
  {
    id: "21",
    title: "失注案件：人事システム",
    company: "東京メディア株式会社",
    contactPerson: "坂本健",
    contactEmail: "sakamoto@tokyo-media.co.jp",
    contactPhone: "03-5678-1234",
    amount: 4000000,
    status: "失注",
    priority: "中",
    probability: 0,
    expectedCloseDate: "2025-10-31",
    createdAt: "2025-07-01",
    updatedAt: "2025-10-31",
    tags: [],
    description: "人事管理システムの提案",
    area: "関東",
    product: "CRMシステム",
    team: "第一営業部",
    notes: "競合に敗北"
  },
  {
    id: "22",
    title: "モバイル営業支援アプリ",
    company: "関西不動産グループ",
    contactPerson: "岡田真一",
    contactEmail: "okada@kansai-re.co.jp",
    contactPhone: "06-5678-9012",
    amount: 3600000,
    status: "成約",
    priority: "高",
    probability: 100,
    expectedCloseDate: "2025-11-20",
    createdAt: "2025-08-20",
    updatedAt: "2025-11-20",
    tags: [mockTags[0], mockTags[3]],
    description: "不動産営業担当者向けモバイルアプリ",
    area: "関西",
    product: "モバイルアプリ開発",
    team: "西日本営業部",
  },
  {
    id: "23",
    title: "コールセンターシステム",
    company: "東北テレコム株式会社",
    contactPerson: "遠藤直樹",
    contactEmail: "endo@tohoku-telecom.co.jp",
    contactPhone: "022-3456-7890",
    amount: 5200000,
    status: "アプローチ中",
    priority: "中",
    probability: 45,
    expectedCloseDate: "2026-03-15",
    createdAt: "2025-11-08",
    updatedAt: "2025-11-17",
    tags: [mockTags[0]],
    description: "コールセンター業務効率化システム",
    area: "東北",
    product: "CRMシステム",
    team: "第三営業部",
  },
  {
    id: "24",
    title: "Web会議システム連携",
    company: "北海道ITソリューションズ",
    contactPerson: "西村健太郎",
    contactEmail: "nishimura@hokkaido-it.co.jp",
    contactPhone: "011-2345-6789",
    amount: 1800000,
    status: "成約",
    priority: "低",
    probability: 100,
    expectedCloseDate: "2025-10-15",
    createdAt: "2025-09-01",
    updatedAt: "2025-10-15",
    tags: [mockTags[3]],
    description: "既存システムとWeb会議ツールの連携",
    area: "北海道",
    product: "クラウドサービス",
    team: "第一営業部",
  },
  {
    id: "25",
    title: "サプライチェーン可視化",
    company: "九州製薬株式会社",
    contactPerson: "川口由紀",
    contactEmail: "kawaguchi@kyushu-pharma.co.jp",
    contactPhone: "092-4567-8901",
    amount: 11000000,
    status: "提案",
    priority: "高",
    probability: 55,
    expectedCloseDate: "2026-04-30",
    createdAt: "2025-10-18",
    updatedAt: "2025-11-16",
    tags: [mockTags[0], mockTags[2]],
    description: "医薬品サプライチェーンの可視化・最適化",
    area: "九州",
    product: "データ分析基盤",
    team: "エンタープライズ営業部",
    notes: "技術検証フェーズ"
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

    // 全ての可能な値で初期化（0表示のため）
    switch (dimension) {
      case "status":
        ALL_STATUSES.forEach(status => { grouped[status] = [] })
        break
      case "area":
        ALL_AREAS.forEach(area => { grouped[area] = [] })
        break
      case "product":
        ALL_PRODUCTS.forEach(product => { grouped[product] = [] })
        break
      case "team":
        ALL_TEAMS.forEach(team => { grouped[team] = [] })
        break
      case "priority":
        ALL_PRIORITIES.forEach(priority => { grouped[priority] = [] })
        break
      case "month":
        // 日付範囲がある場合はその範囲の全ての月を初期化
        if (filters.dateRange?.start && filters.dateRange?.end) {
          const allMonths = generateMonthRange(filters.dateRange.start, filters.dateRange.end)
          allMonths.forEach(month => { grouped[month] = [] })
        }
        break
    }

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

  // Enhanced report data generation with multi-axis and multi-metric support
  generateEnhancedReportData(config: CustomReportConfig): ReportDataPoint[] {
    let deals = [...this.deals]

    // Apply basic filters
    deals = this.applyBasicFilters(deals, config.filters)

    // Apply advanced filters
    if (config.advancedFilters && config.advancedFilters.length > 0) {
      deals = this.applyAdvancedFilters(deals, config.advancedFilters)
    }

    // Get dimensions (single or multiple)
    const dimensions = config.dimensions && config.dimensions.length > 0
      ? config.dimensions
      : [config.dimension]

    // Get metrics (single or multiple)
    const metricsConfig = config.metrics && config.metrics.length > 0
      ? config.metrics
      : [{
          type: config.metric,
          field: config.metricField,
          label: this.getMetricLabel(config.metric, config.metricField)
        }]

    // Group by dimensions
    const grouped = this.groupByDimensions(deals, dimensions, config.calculatedFields)

    // Calculate metrics for each group
    const result: ReportDataPoint[] = []

    for (const [key, groupDeals] of Object.entries(grouped)) {
      const dataPoint: ReportDataPoint = { name: key }

      for (let i = 0; i < metricsConfig.length; i++) {
        const metricDef = metricsConfig[i]
        const metricKey = metricDef.label || `metric${i}`
        dataPoint[metricKey] = this.calculateMetric(groupDeals, metricDef, config.calculatedFields)
      }

      result.push(dataPoint)
    }

    // Sort results
    if (config.sortBy) {
      result.sort((a, b) => {
        const aVal = a[config.sortBy!]
        const bVal = b[config.sortBy!]
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return config.sortOrder === 'desc' ? bVal - aVal : aVal - bVal
        }
        return config.sortOrder === 'desc'
          ? String(bVal).localeCompare(String(aVal))
          : String(aVal).localeCompare(String(bVal))
      })
    } else if (dimensions.includes('month')) {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Apply limit
    if (config.limit && config.limit > 0) {
      return result.slice(0, config.limit)
    }

    return result
  }

  // Apply basic filters
  private applyBasicFilters(deals: Deal[], filters: CustomReportConfig['filters']): Deal[] {
    let filtered = [...deals]

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
    if (filters.dateRange?.start) {
      filtered = filtered.filter(deal => deal.expectedCloseDate >= filters.dateRange!.start!)
    }
    if (filters.dateRange?.end) {
      filtered = filtered.filter(deal => deal.expectedCloseDate <= filters.dateRange!.end!)
    }

    return filtered
  }

  // Apply advanced filters with operators
  private applyAdvancedFilters(deals: Deal[], filters: AdvancedFilter[]): Deal[] {
    return deals.filter(deal => {
      return filters.every(filter => {
        const value = this.getFieldValue(deal, filter.field as keyof Deal)
        return this.evaluateFilter(value, filter.operator, filter.value, filter.valueEnd)
      })
    })
  }

  // Evaluate a single filter condition
  private evaluateFilter(value: unknown, operator: string, filterValue: unknown, filterValueEnd?: unknown): boolean {
    switch (operator) {
      case 'equals':
        return value === filterValue
      case 'not_equals':
        return value !== filterValue
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'greater_than':
        return Number(value) > Number(filterValue)
      case 'less_than':
        return Number(value) < Number(filterValue)
      case 'greater_equal':
        return Number(value) >= Number(filterValue)
      case 'less_equal':
        return Number(value) <= Number(filterValue)
      case 'between':
        return Number(value) >= Number(filterValue) && Number(value) <= Number(filterValueEnd)
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value)
      case 'not_in':
        return Array.isArray(filterValue) && !filterValue.includes(value)
      case 'is_empty':
        return value === null || value === undefined || value === ''
      case 'is_not_empty':
        return value !== null && value !== undefined && value !== ''
      default:
        return true
    }
  }

  // Get field value from deal
  private getFieldValue(deal: Deal, field: keyof Deal): unknown {
    return deal[field]
  }

  // Group deals by multiple dimensions
  private groupByDimensions(
    deals: Deal[],
    dimensions: DimensionField[],
    calculatedFields?: CustomReportConfig['calculatedFields']
  ): Record<string, Deal[]> {
    const grouped: Record<string, Deal[]> = {}

    deals.forEach(deal => {
      // Calculate custom fields if needed
      let calculatedValues: Record<string, number> = {}
      if (calculatedFields && calculatedFields.length > 0) {
        calculatedValues = evaluateCalculatedFields(deal, calculatedFields)
      }

      const keys = dimensions.map(dim => this.getDimensionValue(deal, dim))
      const key = keys.join(' / ')

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(deal)
    })

    return grouped
  }

  // Get dimension value from deal
  private getDimensionValue(deal: Deal, dimension: DimensionField): string {
    switch (dimension) {
      case 'status':
        return deal.status
      case 'area':
        return deal.area || '未設定'
      case 'product':
        return deal.product || '未設定'
      case 'team':
        return deal.team || '未設定'
      case 'priority':
        return deal.priority
      case 'month':
        return deal.expectedCloseDate.substring(0, 7)
      case 'quarter': {
        const date = new Date(deal.expectedCloseDate)
        const quarter = Math.floor(date.getMonth() / 3) + 1
        return `${date.getFullYear()} Q${quarter}`
      }
      case 'year':
        return deal.expectedCloseDate.substring(0, 4)
      case 'company':
        return deal.company
      case 'contactPerson':
        return deal.contactPerson
      case 'expectedCloseDate':
        return deal.expectedCloseDate
      case 'createdAt':
        return deal.createdAt.substring(0, 10)
      case 'updatedAt':
        return deal.updatedAt.substring(0, 10)
      case 'tags':
        return deal.tags.length > 0 ? deal.tags.map(t => t.name).join(', ') : 'タグなし'
      default:
        return 'その他'
    }
  }

  // Calculate metric value for a group of deals
  private calculateMetric(
    deals: Deal[],
    metricDef: MetricDefinition,
    calculatedFields?: CustomReportConfig['calculatedFields']
  ): number {
    if (deals.length === 0) return 0

    const { type, field } = metricDef

    // Check if field is a calculated field
    const isCalculated = calculatedFields?.find(cf => cf.id === field)

    if (type === 'count') {
      return deals.length
    }

    // Get values for aggregation
    let values: number[]
    if (isCalculated) {
      values = deals.map(deal => evaluateFormula(isCalculated.formula, deal))
    } else if (type === 'custom' && typeof field === 'string') {
      // Custom formula directly in metric
      values = deals.map(deal => evaluateFormula(field, deal))
    } else {
      values = deals.map(deal => {
        if (field === 'amount') return deal.amount
        if (field === 'probability') return deal.probability
        if (field === 'count') return 1
        return 0
      })
    }

    switch (type) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0)
      case 'average':
        return values.reduce((a, b) => a + b, 0) / values.length
      case 'min':
        return Math.min(...values)
      case 'max':
        return Math.max(...values)
      case 'custom':
        return values.reduce((a, b) => a + b, 0)
      default:
        return deals.length
    }
  }

  // Get metric label
  private getMetricLabel(type: string, field: string): string {
    if (type === 'count') return '件数'
    if (field === 'amount') {
      if (type === 'sum') return '金額合計'
      if (type === 'average') return '平均金額'
      if (type === 'min') return '最小金額'
      if (type === 'max') return '最大金額'
    }
    if (field === 'probability') {
      if (type === 'average') return '平均確度'
      if (type === 'sum') return '確度合計'
    }
    return `${type}_${field}`
  }

  // Get unique values for a dimension (for filter options)
  getUniqueValues(dimension: DimensionField): string[] {
    const values = new Set<string>()
    this.deals.forEach(deal => {
      const value = this.getDimensionValue(deal, dimension)
      values.add(value)
    })
    return Array.from(values).sort()
  }

  // Get all available areas
  getAreas(): string[] {
    return this.getUniqueValues('area')
  }

  // Get all available products
  getProducts(): string[] {
    return this.getUniqueValues('product')
  }

  // Get all available teams
  getTeams(): string[] {
    return this.getUniqueValues('team')
  }
}

export const dealsStore = new DealsStore()
