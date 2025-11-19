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

// Custom Report Types for Tableau-like BI functionality
export type ChartType = "bar" | "pie" | "line" | "area" | "scatter" | "radar" | "funnel" | "stackedBar" | "stackedArea"

// Extended dimension field to include all Deal fields
export type DimensionField = "status" | "area" | "product" | "team" | "priority" | "month" | "company" | "contactPerson" | "expectedCloseDate" | "createdAt"

export type MetricType = "count" | "sum" | "average" | "min" | "max" | "custom"

export type MetricField = "amount" | "probability" | "count"

// Custom calculated field definition
export interface CalculatedField {
  id: string
  name: string
  formula: string // e.g., "amount * probability / 100"
  description?: string
}

// Single metric definition
export interface MetricDefinition {
  type: MetricType
  field: MetricField | string // string for calculated field reference
  label?: string
  color?: string
}

// Chart definition for multiple charts in a report
export interface ChartDefinition {
  id: string
  chartType: ChartType
  title?: string
  metrics: string[] // IDs of metrics to display in this chart
}

// Enhanced report filter with operators
export type FilterOperator = "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "greater_equal" | "less_equal" | "between" | "in" | "not_in" | "is_empty" | "is_not_empty"

export interface AdvancedFilter {
  field: keyof Deal | string
  operator: FilterOperator
  value: any
  valueEnd?: any // for "between" operator
}

// Legacy simple config for backward compatibility
export interface CustomReportConfig {
  chartType: ChartType
  dimension: DimensionField
  metric: MetricType
  metricField: MetricField
  filters: {
    status?: DealStatus[]
    priority?: DealPriority[]
    minAmount?: number
    maxAmount?: number
    area?: string[]
    product?: string[]
    team?: string[]
    tags?: string[]
    dateRange?: {
      start?: string
      end?: string
    }
  }
  colors?: string[]
  // Enhanced features (optional for backward compatibility)
  dimensions?: DimensionField[] // Multiple dimensions for multi-axis
  metrics?: MetricDefinition[] // Multiple metrics
  calculatedFields?: CalculatedField[] // Custom formulas
  advancedFilters?: AdvancedFilter[] // Enhanced filtering
  charts?: ChartDefinition[] // Multiple charts
  sortBy?: string
  sortOrder?: "asc" | "desc"
  limit?: number
}

// Enhanced report data format for multi-series
export interface ReportDataPoint {
  name: string
  [key: string]: string | number // Dynamic keys for multiple metrics
}

export interface CustomReport {
  id: string
  name: string
  description?: string
  config: CustomReportConfig
  createdAt: string
  updatedAt: string
}
