"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { dealsStore } from "@/lib/store/deals"
import { validateFormula, getAvailableFormulaFields, getAvailableFunctions, getAvailableTables, generateFormulaFromDescription, getFormulaSuggestions } from "@/lib/formula-parser"
import {
  ChartType,
  DimensionField,
  MetricType,
  MetricField,
  CustomReportConfig,
  DealStatus,
  DealPriority,
  CalculatedField,
  MetricDefinition,
  AdvancedFilter,
  FilterOperator,
  Deal
} from "@/types/deal"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Check,
  Save,
  Eye,
  Plus,
  Trash2,
  Calculator,
  Layers,
  Target,
  HelpCircle,
  Filter,
  X,
  Table2,
  Search,
  Sparkles,
  Database,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts"

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#06b6d4']

type Step = "chart" | "dimension" | "metric" | "calculated" | "filters" | "preview"

export default function ReportBuilderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("chart")
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")

  // Report configuration state
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [dimensions, setDimensions] = useState<DimensionField[]>(["status"])
  const [metrics, setMetrics] = useState<MetricDefinition[]>([
    { type: "count", field: "count", label: "件数" }
  ])

  // Calculated fields
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([])
  const [newCalcName, setNewCalcName] = useState("")
  const [newCalcFormula, setNewCalcFormula] = useState("")
  const [showFormulaHelp, setShowFormulaHelp] = useState(false)

  // AI Formula generation
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResult, setAiResult] = useState<{ formula: string; explanation: string } | null>(null)
  const [expandedTables, setExpandedTables] = useState<string[]>(["deal"])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter state
  const [statusFilters, setStatusFilters] = useState<DealStatus[]>([])
  const [priorityFilters, setPriorityFilters] = useState<DealPriority[]>([])
  const [areaFilters, setAreaFilters] = useState<string[]>([])
  const [productFilters, setProductFilters] = useState<string[]>([])
  const [teamFilters, setTeamFilters] = useState<string[]>([])
  const [minAmount, setMinAmount] = useState<string>("")
  const [maxAmount, setMaxAmount] = useState<string>("")
  const [dateStart, setDateStart] = useState<string>("")
  const [dateEnd, setDateEnd] = useState<string>("")

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([])

  // Sorting and limit state
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [limit, setLimit] = useState<string>("")

  // Search state for filters
  const [areaSearch, setAreaSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [teamSearch, setTeamSearch] = useState("")

  // Filter field options for advanced filters
  const filterFields: { field: keyof Deal; label: string; type: "string" | "number" | "date" }[] = [
    { field: "title", label: "案件名", type: "string" },
    { field: "company", label: "会社名", type: "string" },
    { field: "contactPerson", label: "担当者", type: "string" },
    { field: "contactEmail", label: "メール", type: "string" },
    { field: "amount", label: "金額", type: "number" },
    { field: "probability", label: "確度", type: "number" },
    { field: "status", label: "ステータス", type: "string" },
    { field: "priority", label: "優先度", type: "string" },
    { field: "area", label: "エリア", type: "string" },
    { field: "product", label: "商材", type: "string" },
    { field: "team", label: "チーム", type: "string" },
    { field: "expectedCloseDate", label: "予定完了日", type: "date" },
    { field: "createdAt", label: "作成日", type: "date" },
    { field: "description", label: "説明", type: "string" },
    { field: "notes", label: "メモ", type: "string" },
  ]

  // Operator options for advanced filters
  const operatorOptions: { operator: FilterOperator; label: string; types: ("string" | "number" | "date")[] }[] = [
    { operator: "equals", label: "等しい", types: ["string", "number", "date"] },
    { operator: "not_equals", label: "等しくない", types: ["string", "number", "date"] },
    { operator: "contains", label: "含む", types: ["string"] },
    { operator: "not_contains", label: "含まない", types: ["string"] },
    { operator: "greater_than", label: "より大きい", types: ["number", "date"] },
    { operator: "less_than", label: "より小さい", types: ["number", "date"] },
    { operator: "greater_equal", label: "以上", types: ["number", "date"] },
    { operator: "less_equal", label: "以下", types: ["number", "date"] },
    { operator: "between", label: "範囲内", types: ["number", "date"] },
    { operator: "is_empty", label: "空である", types: ["string", "number", "date"] },
    { operator: "is_not_empty", label: "空でない", types: ["string", "number", "date"] },
  ]

  // Get available options from store
  const allAreas = dealsStore.getAreas()
  const allProducts = dealsStore.getProducts()
  const allTeams = dealsStore.getTeams()
  const allTags = dealsStore.getTags()

  const steps: { key: Step; label: string; number: number }[] = [
    { key: "chart", label: "グラフ", number: 1 },
    { key: "dimension", label: "軸", number: 2 },
    { key: "metric", label: "指標", number: 3 },
    { key: "calculated", label: "計算", number: 4 },
    { key: "filters", label: "絞込", number: 5 },
    { key: "preview", label: "確認", number: 6 },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === currentStep)

  const chartTypes: { type: ChartType; label: string; icon: typeof BarChart3; description: string }[] = [
    { type: "table", label: "テーブル", icon: Table2, description: "シンプルな表形式表示" },
    { type: "bar", label: "棒グラフ", icon: BarChart3, description: "カテゴリ別の比較に最適" },
    { type: "stackedBar", label: "積み上げ棒", icon: BarChart3, description: "複数指標の構成比較" },
    { type: "pie", label: "円グラフ", icon: PieChart, description: "割合や構成比の表示に" },
    { type: "line", label: "折れ線", icon: LineChart, description: "時系列データの推移に" },
    { type: "area", label: "エリア", icon: AreaChart, description: "累積データの表示に" },
    { type: "stackedArea", label: "積み上げエリア", icon: AreaChart, description: "複数系列の累積比較" },
    { type: "radar", label: "レーダー", icon: Target, description: "多次元データの比較" },
    { type: "scatter", label: "散布図", icon: Layers, description: "相関関係の分析に" },
    { type: "funnel", label: "ファネル", icon: BarChart3, description: "段階的な数値変化" },
  ]

  const allDimensions: { field: DimensionField; label: string; description: string }[] = [
    { field: "status", label: "ステータス", description: "商談の進行状況別" },
    { field: "area", label: "エリア", description: "地域・担当エリア別" },
    { field: "product", label: "商材", description: "製品・サービス別" },
    { field: "team", label: "チーム", description: "営業チーム別" },
    { field: "priority", label: "優先度", description: "案件の優先度別" },
    { field: "month", label: "月別", description: "予定完了月別の推移" },
    { field: "quarter", label: "四半期別", description: "四半期ごとの分析" },
    { field: "year", label: "年別", description: "年度ごとの推移" },
    { field: "company", label: "会社", description: "取引先会社別" },
    { field: "contactPerson", label: "担当者", description: "顧客担当者別" },
    { field: "createdAt", label: "作成日", description: "案件作成日別" },
    { field: "updatedAt", label: "更新日", description: "案件更新日別" },
  ]

  const availableMetrics: { type: MetricType; field: MetricField; label: string; description: string }[] = [
    { type: "count", field: "count", label: "件数", description: "商談の数をカウント" },
    { type: "sum", field: "amount", label: "金額合計", description: "商談金額の合計" },
    { type: "average", field: "amount", label: "平均金額", description: "商談金額の平均" },
    { type: "min", field: "amount", label: "最小金額", description: "商談金額の最小値" },
    { type: "max", field: "amount", label: "最大金額", description: "商談金額の最大値" },
    { type: "average", field: "probability", label: "平均確度", description: "成約確度の平均" },
    { type: "sum", field: "probability", label: "確度合計", description: "成約確度の合計" },
  ]

  const allStatuses: DealStatus[] = ["新規", "アプローチ中", "提案", "商談中", "クロージング", "成約", "失注"]
  const allPriorities: DealPriority[] = ["高", "中", "低"]

  // Toggle functions
  const toggleDimension = (field: DimensionField) => {
    setDimensions(prev => {
      if (prev.includes(field)) {
        return prev.length > 1 ? prev.filter(d => d !== field) : prev
      }
      return [...prev, field]
    })
  }

  const toggleStatus = (status: DealStatus) => {
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const togglePriority = (priority: DealPriority) => {
    setPriorityFilters(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  const toggleArea = (area: string) => {
    setAreaFilters(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  const toggleProduct = (product: string) => {
    setProductFilters(prev =>
      prev.includes(product)
        ? prev.filter(p => p !== product)
        : [...prev, product]
    )
  }

  const toggleTeam = (team: string) => {
    setTeamFilters(prev =>
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
    )
  }

  // Add/remove metrics
  const addMetric = (type: MetricType, field: MetricField, label: string) => {
    const exists = metrics.some(m => m.type === type && m.field === field)
    if (!exists) {
      setMetrics(prev => [...prev, { type, field, label }])
    }
  }

  const removeMetric = (index: number) => {
    if (metrics.length > 1) {
      setMetrics(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Add calculated field
  const addCalculatedField = () => {
    if (!newCalcName.trim() || !newCalcFormula.trim()) return

    const validation = validateFormula(newCalcFormula)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    const newField: CalculatedField = {
      id: Date.now().toString(),
      name: newCalcName.trim(),
      formula: newCalcFormula.trim()
    }

    setCalculatedFields(prev => [...prev, newField])
    setNewCalcName("")
    setNewCalcFormula("")
  }

  const removeCalculatedField = (id: string) => {
    setCalculatedFields(prev => prev.filter(f => f.id !== id))
  }

  // Add calculated field as metric
  const addCalculatedMetric = (field: CalculatedField) => {
    const exists = metrics.some(m => m.field === field.id)
    if (!exists) {
      setMetrics(prev => [...prev, {
        type: "custom",
        field: field.id,
        label: field.name
      }])
    }
  }

  // Advanced filter functions
  const addAdvancedFilter = () => {
    const newFilter: AdvancedFilter = {
      field: "amount",
      operator: "greater_than",
      value: ""
    }
    setAdvancedFilters(prev => [...prev, newFilter])
  }

  const updateAdvancedFilter = (index: number, updates: Partial<AdvancedFilter>) => {
    setAdvancedFilters(prev => prev.map((filter, i) =>
      i === index ? { ...filter, ...updates } : filter
    ))
  }

  const removeAdvancedFilter = (index: number) => {
    setAdvancedFilters(prev => prev.filter((_, i) => i !== index))
  }

  const getFieldType = (field: string): "string" | "number" | "date" => {
    const fieldConfig = filterFields.find(f => f.field === field)
    return fieldConfig?.type || "string"
  }

  const getAvailableOperators = (field: string) => {
    const fieldType = getFieldType(field)
    return operatorOptions.filter(op => op.types.includes(fieldType))
  }

  const getConfig = (): CustomReportConfig => ({
    chartType,
    dimension: dimensions[0],
    metric: metrics[0].type,
    metricField: metrics[0].field as MetricField,
    filters: {
      status: statusFilters.length > 0 ? statusFilters : undefined,
      priority: priorityFilters.length > 0 ? priorityFilters : undefined,
      minAmount: minAmount ? parseInt(minAmount) : undefined,
      maxAmount: maxAmount ? parseInt(maxAmount) : undefined,
      area: areaFilters.length > 0 ? areaFilters : undefined,
      product: productFilters.length > 0 ? productFilters : undefined,
      team: teamFilters.length > 0 ? teamFilters : undefined,
      dateRange: (dateStart || dateEnd) ? {
        start: dateStart || undefined,
        end: dateEnd || undefined
      } : undefined
    },
    dimensions: dimensions.length > 1 ? dimensions : undefined,
    metrics: metrics.length > 1 ? metrics : undefined,
    calculatedFields: calculatedFields.length > 0 ? calculatedFields : undefined,
    advancedFilters: advancedFilters.length > 0 ? advancedFilters : undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortBy ? sortOrder : undefined,
    limit: limit ? parseInt(limit) : undefined
  })

  const previewData = dealsStore.generateEnhancedReportData(getConfig())

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key)
    }
  }

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key)
    }
  }

  const handleSave = () => {
    if (!reportName.trim()) {
      alert("レポート名を入力してください")
      return
    }

    dealsStore.saveCustomReport({
      name: reportName.trim(),
      description: reportDescription.trim() || undefined,
      config: getConfig()
    })

    router.push("/reports")
  }

  const formatValue = (value: number, metricLabel?: string): string => {
    if (metricLabel?.includes('件数') || metricLabel === '件数') {
      return `${value}件`
    } else if (metricLabel?.includes('確度')) {
      return `${value.toFixed(1)}%`
    } else {
      return `¥${(value / 10000).toFixed(0)}万`
    }
  }

  const renderChart = () => {
    if (previewData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          データがありません
        </div>
      )
    }

    const metricKeys = metrics.map(m => m.label || `${m.type}_${m.field}`)

    // Table chart type rendering
    if (chartType === "table") {
      return (
        <div className="h-[300px] w-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b">
              <tr>
                <th className="text-left p-2 font-medium">{dimensions.map(d => allDimensions.find(ad => ad.field === d)?.label).join(' / ')}</th>
                {metricKeys.map((key, index) => (
                  <th key={key} className="text-right p-2 font-medium">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {item.name}
                    </div>
                  </td>
                  {metricKeys.map((key) => {
                    const value = item[key] as number
                    return (
                      <td key={key} className="p-2 text-right font-mono">
                        {formatValue(value, key)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 bg-muted/30">
              <tr>
                <td className="p-2 font-medium">合計</td>
                {metricKeys.map((key) => {
                  const total = previewData.reduce((sum, item) => sum + (item[key] as number), 0)
                  return (
                    <td key={key} className="p-2 text-right font-mono font-medium">
                      {formatValue(total, key)}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )
    }

    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <RechartsPieChart>
              <Pie
                data={previewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={metricKeys[0]}
              >
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatValue(value, metricKeys[0])} />
            </RechartsPieChart>
          ) : chartType === "line" ? (
            <RechartsLineChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number, name: string) => formatValue(value, name)} />
              {metrics.length > 1 && <Legend />}
              {metricKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </RechartsLineChart>
          ) : chartType === "area" || chartType === "stackedArea" ? (
            <RechartsAreaChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number, name: string) => formatValue(value, name)} />
              {metrics.length > 1 && <Legend />}
              {metricKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                  stackId={chartType === "stackedArea" ? "1" : undefined}
                />
              ))}
            </RechartsAreaChart>
          ) : chartType === "radar" ? (
            <RadarChart data={previewData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              {metricKeys.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Tooltip formatter={(value: number, name: string) => formatValue(value, name)} />
              {metrics.length > 1 && <Legend />}
            </RadarChart>
          ) : chartType === "scatter" ? (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="index"
                name="Index"
                tick={{ fontSize: 10 }}
                domain={[0, 'dataMax + 1']}
              />
              <YAxis
                type="number"
                dataKey={metricKeys[0]}
                name={metricKeys[0]}
                tick={{ fontSize: 10 }}
              />
              {metrics.length > 1 && (
                <ZAxis
                  type="number"
                  dataKey={metricKeys[1]}
                  range={[50, 400]}
                  name={metricKeys[1]}
                />
              )}
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="font-medium text-sm">{data.name}</p>
                        {metricKeys.map((key, idx) => (
                          <p key={key} className="text-xs text-muted-foreground">
                            {key}: {formatValue(data[key], key)}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              {metrics.length > 1 && <Legend />}
              <Scatter
                name={metricKeys[0]}
                data={previewData.map((item, index) => ({ ...item, index }))}
                fill={COLORS[0]}
              />
            </ScatterChart>
          ) : chartType === "funnel" ? (
            <FunnelChart>
              <Tooltip formatter={(value: number) => formatValue(value, metricKeys[0])} />
              <Funnel
                dataKey={metricKeys[0]}
                data={previewData.sort((a, b) => (b[metricKeys[0]] as number) - (a[metricKeys[0]] as number))}
                isAnimationActive
              >
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList
                  position="right"
                  fill="#666"
                  stroke="none"
                  dataKey="name"
                  fontSize={10}
                />
              </Funnel>
            </FunnelChart>
          ) : (
            <BarChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number, name: string) => formatValue(value, name)} />
              {metrics.length > 1 && <Legend />}
              {metricKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                  stackId={chartType === "stackedBar" ? "1" : undefined}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4 pb-24">
        {/* ヘッダー */}
        <div className="pt-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">カスタムレポート作成</h1>
            <p className="text-xs text-muted-foreground">
              ステップ {currentStepIndex + 1} / {steps.length}
            </p>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-between px-1">
          {steps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : index === currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="h-3 w-3" />
                ) : (
                  step.number
                )}
              </div>
              <span className={`text-[10px] mt-1 ${
                index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === "chart" && (
          <Card>
            <CardHeader>
              <CardTitle>グラフタイプを選択</CardTitle>
              <CardDescription>表示したいグラフの形式を選んでください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {chartTypes.map(({ type, label, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    chartType === type
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    chartType === type ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {currentStep === "dimension" && (
          <Card>
            <CardHeader>
              <CardTitle>分析軸を選択（複数可）</CardTitle>
              <CardDescription>何を基準にデータを分類しますか？複数選択で多軸分析が可能です</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {allDimensions.map(({ field, label, description }) => (
                <button
                  key={field}
                  onClick={() => toggleDimension(field)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    dimensions.includes(field)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    {dimensions.includes(field) && (
                      <Badge variant="default" className="text-xs">
                        {dimensions.indexOf(field) + 1}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              {dimensions.length > 1 && (
                <p className="text-xs text-muted-foreground mt-2">
                  選択順: {dimensions.map(d => allDimensions.find(ad => ad.field === d)?.label).join(' → ')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === "metric" && (
          <Card>
            <CardHeader>
              <CardTitle>表示指標を選択（複数可）</CardTitle>
              <CardDescription>どの数値を表示しますか？複数選択で比較が可能です</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Selected metrics */}
              {metrics.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">選択済み指標:</p>
                  {metrics.map((m, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
                      <span className="text-sm">{m.label}</span>
                      {metrics.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeMetric(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Available metrics */}
              <div className="space-y-2">
                {availableMetrics.map(({ type, field, label, description }) => {
                  const isSelected = metrics.some(m => m.type === type && m.field === field)
                  return (
                    <button
                      key={`${type}-${field}`}
                      onClick={() => addMetric(type, field, label)}
                      disabled={isSelected}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-muted bg-muted/50 opacity-50"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </button>
                  )
                })}
              </div>

              {/* Calculated field metrics */}
              {calculatedFields.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">計算フィールド:</p>
                  <div className="space-y-2">
                    {calculatedFields.map(field => {
                      const isSelected = metrics.some(m => m.field === field.id)
                      return (
                        <button
                          key={field.id}
                          onClick={() => addCalculatedMetric(field)}
                          disabled={isSelected}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? "border-muted bg-muted/50 opacity-50"
                              : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            <p className="font-medium text-sm">{field.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{field.formula}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === "calculated" && (
          <div className="space-y-4">
            {/* AI Formula Generation */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>AI数式生成</CardTitle>
                </div>
                <CardDescription>
                  やりたいことを日本語で入力すると、AIが数式を生成します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="例: 期待値を計算したい、手数料10%を算出したい、高額案件を判定したい"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => {
                    if (aiPrompt.trim()) {
                      const result = generateFormulaFromDescription(aiPrompt)
                      setAiResult({ formula: result.formula, explanation: result.explanation })
                      setNewCalcFormula(result.formula)
                      if (!newCalcName.trim()) {
                        // Auto-generate a name based on the prompt
                        const name = aiPrompt.length > 20 ? aiPrompt.substring(0, 20) + '...' : aiPrompt
                        setNewCalcName(name)
                      }
                    }
                  }}
                  disabled={!aiPrompt.trim()}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  数式を生成
                </Button>

                {aiResult && (
                  <div className="p-3 rounded-lg bg-background border space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <Lightbulb className="h-4 w-4" />
                      生成された数式
                    </div>
                    <code className="block p-2 bg-muted rounded text-sm font-mono">
                      {aiResult.formula}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      {aiResult.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formula Suggestions */}
            <Card>
              <CardHeader>
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">数式テンプレート</CardTitle>
                  </div>
                  {showSuggestions ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </CardHeader>
              {showSuggestions && (
                <CardContent className="space-y-3">
                  {Object.entries(
                    getFormulaSuggestions().reduce((acc, s) => {
                      if (!acc[s.category]) acc[s.category] = []
                      acc[s.category].push(s)
                      return acc
                    }, {} as Record<string, typeof getFormulaSuggestions extends () => infer R ? R : never>)
                  ).map(([category, suggestions]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestions.map((s) => (
                          <button
                            key={s.name}
                            onClick={() => {
                              setNewCalcName(s.name)
                              setNewCalcFormula(s.formula)
                            }}
                            className="p-2 text-left rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          >
                            <p className="text-xs font-medium">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{s.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Manual Formula Creation */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>計算フィールド作成</CardTitle>
                    <CardDescription>数式を直接入力して独自の指標を作成</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFormulaHelp(!showFormulaHelp)}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showFormulaHelp && (
                  <div className="p-3 rounded-lg bg-muted text-sm space-y-3 max-h-[400px] overflow-y-auto">
                    {/* Table-based field selection */}
                    <div className="space-y-3">
                      <p className="font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        テーブル別フィールド
                      </p>
                      {getAvailableTables().map(table => (
                        <div key={table.id} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              setExpandedTables(prev =>
                                prev.includes(table.id)
                                  ? prev.filter(t => t !== table.id)
                                  : [...prev, table.id]
                              )
                            }}
                            className="w-full p-2 flex items-center justify-between bg-background hover:bg-muted/50"
                          >
                            <div>
                              <span className="font-medium text-xs">{table.name}</span>
                              <span className="text-[10px] text-muted-foreground ml-2">
                                {table.description}
                              </span>
                            </div>
                            {expandedTables.includes(table.id) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          {expandedTables.includes(table.id) && (
                            <div className="p-2 bg-muted/30 space-y-2">
                              {/* Numeric fields */}
                              {table.fields.filter(f => f.type === 'number').length > 0 && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-1">数値</p>
                                  <div className="flex flex-wrap gap-1">
                                    {table.fields.filter(f => f.type === 'number').map(f => (
                                      <button
                                        key={f.name}
                                        onClick={() => setNewCalcFormula(prev => prev + f.name)}
                                        className="px-2 py-1 bg-background rounded text-xs hover:bg-primary/10"
                                        title={f.description}
                                      >
                                        {f.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Text fields */}
                              {table.fields.filter(f => f.type === 'text').length > 0 && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-1">テキスト</p>
                                  <div className="flex flex-wrap gap-1">
                                    {table.fields.filter(f => f.type === 'text').map(f => (
                                      <button
                                        key={f.name}
                                        onClick={() => setNewCalcFormula(prev => prev + f.name)}
                                        className="px-2 py-1 bg-background rounded text-xs hover:bg-primary/10"
                                        title={f.description}
                                      >
                                        {f.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Date fields */}
                              {table.fields.filter(f => f.type === 'date').length > 0 && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-1">日付</p>
                                  <div className="flex flex-wrap gap-1">
                                    {table.fields.filter(f => f.type === 'date').map(f => (
                                      <button
                                        key={f.name}
                                        onClick={() => setNewCalcFormula(prev => prev + f.name)}
                                        className="px-2 py-1 bg-background rounded text-xs hover:bg-primary/10"
                                        title={f.description}
                                      >
                                        {f.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Functions */}
                    <div>
                      <p className="font-medium">数学関数:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getAvailableFunctions().filter(f => f.category === 'math').map(f => (
                          <button
                            key={f.name}
                            onClick={() => setNewCalcFormula(prev => prev + f.name + '(')}
                            className="px-2 py-1 bg-background rounded text-xs hover:bg-primary/10"
                            title={`${f.syntax} - ${f.description}`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">ロジック関数:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getAvailableFunctions().filter(f => f.category === 'logic').map(f => (
                          <button
                            key={f.name}
                            onClick={() => setNewCalcFormula(prev => prev + f.name + '(')}
                            className="px-2 py-1 bg-background rounded text-xs hover:bg-primary/10"
                            title={`${f.syntax} - ${f.description}`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">テキスト関数:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getAvailableFunctions().filter(f => f.category === 'text').map(f => (
                          <button
                            key={f.name}
                            onClick={() => setNewCalcFormula(prev => prev + f.name + '(')}
                            className="px-2 py-1 bg-background rounded text-xs hover:bg-primary/10"
                            title={`${f.syntax} - ${f.description}`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="font-medium">例:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li><code className="bg-background px-1 rounded">amount * probability / 100</code> - 期待値</li>
                        <li><code className="bg-background px-1 rounded">amount * 0.1</code> - 手数料10%</li>
                        <li><code className="bg-background px-1 rounded">LEN(company)</code> - 会社名の文字数</li>
                        <li><code className="bg-background px-1 rounded">IF(amount &gt; 1000000, 1, 0)</code> - 高額案件判定</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">フィールド名</label>
                    <Input
                      placeholder="例: 期待値"
                      value={newCalcName}
                      onChange={(e) => setNewCalcName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">数式</label>
                    <Input
                      placeholder="例: amount * probability / 100"
                      value={newCalcFormula}
                      onChange={(e) => setNewCalcFormula(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <Button
                    onClick={addCalculatedField}
                    disabled={!newCalcName.trim() || !newCalcFormula.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    計算フィールドを追加
                  </Button>
                </div>

                {calculatedFields.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium">作成済みフィールド:</p>
                    {calculatedFields.map(field => (
                      <div key={field.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{field.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{field.formula}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeCalculatedField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {calculatedFields.length === 0 && !showFormulaHelp && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    計算フィールドはオプションです。スキップして次へ進むこともできます。
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "filters" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ステータスで絞り込み</CardTitle>
                <CardDescription>選択なし = すべて表示</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allStatuses.map(status => (
                    <Badge
                      key={status}
                      variant={statusFilters.includes(status) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>優先度で絞り込み</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allPriorities.map(priority => (
                    <Badge
                      key={priority}
                      variant={priorityFilters.includes(priority) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePriority(priority)}
                    >
                      {priority}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>エリアで絞り込み</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="エリアを検索..."
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {allAreas
                    .filter(area => area.toLowerCase().includes(areaSearch.toLowerCase()))
                    .map(area => (
                      <Badge
                        key={area}
                        variant={areaFilters.includes(area) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArea(area)}
                      >
                        {area}
                      </Badge>
                    ))}
                </div>
                {areaFilters.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    選択中: {areaFilters.join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>商材で絞り込み</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="商材を検索..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {allProducts
                    .filter(product => product.toLowerCase().includes(productSearch.toLowerCase()))
                    .map(product => (
                      <Badge
                        key={product}
                        variant={productFilters.includes(product) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleProduct(product)}
                      >
                        {product}
                      </Badge>
                    ))}
                </div>
                {productFilters.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    選択中: {productFilters.join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>チームで絞り込み</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="チームを検索..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {allTeams
                    .filter(team => team.toLowerCase().includes(teamSearch.toLowerCase()))
                    .map(team => (
                      <Badge
                        key={team}
                        variant={teamFilters.includes(team) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTeam(team)}
                      >
                        {team}
                      </Badge>
                    ))}
                </div>
                {teamFilters.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    選択中: {teamFilters.join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>金額で絞り込み</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">最小金額（円）</label>
                  <Input
                    type="number"
                    placeholder="例: 1000000"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">最大金額（円）</label>
                  <Input
                    type="number"
                    placeholder="例: 10000000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>期間で絞り込み</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">開始日</label>
                  <Input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">終了日</label>
                  <Input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <CardTitle>高度な絞り込み</CardTitle>
                  </div>
                  <Button size="sm" onClick={addAdvancedFilter}>
                    <Plus className="h-4 w-4 mr-1" />
                    追加
                  </Button>
                </div>
                <CardDescription>
                  任意のフィールドに対して詳細な条件を設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {advancedFilters.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    高度な絞り込み条件はありません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {advancedFilters.map((filter, index) => {
                      const fieldType = getFieldType(filter.field as string)
                      const availableOps = getAvailableOperators(filter.field as string)
                      const needsValue = !["is_empty", "is_not_empty"].includes(filter.operator)
                      const needsSecondValue = filter.operator === "between"

                      return (
                        <div key={index} className="p-3 rounded-lg border bg-background space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              条件 {index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeAdvancedFilter(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Combobox
                              options={filterFields.map(f => ({ value: f.field, label: f.label }))}
                              value={filter.field as string}
                              onValueChange={(value) => {
                                const newFieldType = getFieldType(value)
                                const validOps = operatorOptions.filter(op => op.types.includes(newFieldType))
                                const currentOpValid = validOps.some(op => op.operator === filter.operator)
                                updateAdvancedFilter(index, {
                                  field: value,
                                  operator: currentOpValid ? filter.operator : validOps[0]?.operator || "equals"
                                })
                              }}
                              placeholder="フィールド"
                              searchPlaceholder="項目名で検索..."
                              emptyText="該当する項目がありません"
                              triggerClassName="h-9 text-xs"
                            />

                            <Select
                              value={filter.operator}
                              onValueChange={(value) =>
                                updateAdvancedFilter(index, { operator: value as FilterOperator })
                              }
                            >
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="条件" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOps.map(op => (
                                  <SelectItem key={op.operator} value={op.operator}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {needsValue && (
                            <div className={needsSecondValue ? "grid grid-cols-2 gap-2" : ""}>
                              <Input
                                type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
                                placeholder={needsSecondValue ? "開始値" : "値"}
                                value={filter.value || ""}
                                onChange={(e) => updateAdvancedFilter(index, {
                                  value: fieldType === "number" ? Number(e.target.value) : e.target.value
                                })}
                                className="h-9 text-sm"
                              />
                              {needsSecondValue && (
                                <Input
                                  type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
                                  placeholder="終了値"
                                  value={filter.valueEnd || ""}
                                  onChange={(e) => updateAdvancedFilter(index, {
                                    valueEnd: fieldType === "number" ? Number(e.target.value) : e.target.value
                                  })}
                                  className="h-9 text-sm"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "preview" && (
          <div className="space-y-4">
            {/* レポートプレビュー - メインセクション */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">レポートプレビュー</CardTitle>
                    <CardDescription>作成するレポートの最終確認</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* プレビュー情報サマリー */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-background rounded-lg border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">データ件数</p>
                    <p className="text-xl font-bold text-primary">{previewData.length}</p>
                    <p className="text-[10px] text-muted-foreground">項目</p>
                  </div>
                  <div className="text-center border-l border-r">
                    <p className="text-xs text-muted-foreground mb-1">指標数</p>
                    <p className="text-xl font-bold text-primary">{metrics.length}</p>
                    <p className="text-[10px] text-muted-foreground">指標</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">グラフタイプ</p>
                    <p className="text-sm font-bold text-primary mt-1">{chartTypes.find(c => c.type === chartType)?.label}</p>
                  </div>
                </div>

                {/* グラフタイプ切り替え */}
                <div className="flex items-center justify-between p-2 bg-background rounded-lg border">
                  <span className="text-sm font-medium">グラフ表示切替:</span>
                  <div className="flex gap-1">
                    {[
                      { type: "table" as ChartType, icon: Table2, label: "表" },
                      { type: "bar" as ChartType, icon: BarChart3, label: "棒" },
                      { type: "line" as ChartType, icon: LineChart, label: "線" },
                      { type: "pie" as ChartType, icon: PieChart, label: "円" },
                      { type: "area" as ChartType, icon: AreaChart, label: "面" },
                    ].map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant={chartType === type ? "default" : "outline"}
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => setChartType(type)}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* グラフ表示エリア */}
                <div className="bg-background rounded-lg border p-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      {reportName || "新しいレポート"}
                      {reportDescription && (
                        <span className="text-xs text-muted-foreground font-normal">
                          - {reportDescription}
                        </span>
                      )}
                    </h4>
                  </div>
                  {renderChart()}
                  {previewData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">現在の設定ではデータがありません</p>
                      <p className="text-xs mt-1">フィルター条件を変更してください</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* レポート情報入力 */}
            <Card>
              <CardHeader>
                <CardTitle>レポート情報</CardTitle>
                <CardDescription>レポート名と説明を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">レポート名 *</label>
                  <Input
                    placeholder="例: 月別売上推移"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">説明（任意）</label>
                  <Input
                    placeholder="例: 各月の売上金額の推移を表示"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 表示オプション */}
            <Card>
              <CardHeader>
                <CardTitle>表示オプション</CardTitle>
                <CardDescription>ソートと表示件数の設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">ソート基準</label>
                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue placeholder="なし" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">なし</SelectItem>
                        {metrics.map(m => (
                          <SelectItem key={m.label || m.field} value={m.label || `${m.type}_${m.field}`}>
                            {m.label || `${m.type}_${m.field}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">順序</label>
                    <Select
                      value={sortOrder}
                      onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                      disabled={!sortBy}
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">降順（大→小）</SelectItem>
                        <SelectItem value="asc">昇順（小→大）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">表示件数上限</label>
                  <Input
                    type="number"
                    placeholder="全件表示"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    min="1"
                    className="h-9 mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    未設定の場合は全件表示されます
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 設定内容サマリー */}
            <Card>
              <CardHeader>
                <CardTitle>設定内容の確認</CardTitle>
                <CardDescription>レポートの設定内容</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">グラフタイプ</p>
                      <p className="font-medium">{chartTypes.find(c => c.type === chartType)?.label}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">分析軸</p>
                      <p className="font-medium">
                        {dimensions.map(d => allDimensions.find(ad => ad.field === d)?.label).join(' / ')}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">指標</p>
                    <div className="flex flex-wrap gap-1">
                      {metrics.map((m, idx) => (
                        <Badge key={idx} variant="secondary">{m.label}</Badge>
                      ))}
                    </div>
                  </div>

                  {calculatedFields.length > 0 && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">計算フィールド</p>
                      <div className="space-y-1">
                        {calculatedFields.map((field) => (
                          <div key={field.id} className="text-xs">
                            <span className="font-medium">{field.name}</span>
                            <span className="text-muted-foreground ml-2 font-mono">{field.formula}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(statusFilters.length > 0 || priorityFilters.length > 0 || areaFilters.length > 0 ||
                    productFilters.length > 0 || teamFilters.length > 0 || advancedFilters.length > 0) && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">絞り込み条件</p>
                      <div className="space-y-1 text-xs">
                        {statusFilters.length > 0 && (
                          <div>
                            <span className="font-medium">ステータス: </span>
                            <span className="text-muted-foreground">{statusFilters.join(", ")}</span>
                          </div>
                        )}
                        {priorityFilters.length > 0 && (
                          <div>
                            <span className="font-medium">優先度: </span>
                            <span className="text-muted-foreground">{priorityFilters.join(", ")}</span>
                          </div>
                        )}
                        {areaFilters.length > 0 && (
                          <div>
                            <span className="font-medium">エリア: </span>
                            <span className="text-muted-foreground">{areaFilters.join(", ")}</span>
                          </div>
                        )}
                        {productFilters.length > 0 && (
                          <div>
                            <span className="font-medium">商材: </span>
                            <span className="text-muted-foreground">{productFilters.join(", ")}</span>
                          </div>
                        )}
                        {teamFilters.length > 0 && (
                          <div>
                            <span className="font-medium">チーム: </span>
                            <span className="text-muted-foreground">{teamFilters.join(", ")}</span>
                          </div>
                        )}
                        {advancedFilters.length > 0 && (
                          <div>
                            <span className="font-medium">高度な絞り込み: </span>
                            <span className="text-muted-foreground">{advancedFilters.length}件の条件</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* データ詳細 */}
            {previewData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>データ詳細</CardTitle>
                  <CardDescription>レポートに含まれるデータの一覧</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {previewData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          {metrics.map((m, mIndex) => {
                            const key = m.label || `${m.type}_${m.field}`
                            const value = item[key] as number
                            return (
                              <div key={mIndex} className="text-sm">
                                {metrics.length > 1 && (
                                  <span className="text-xs text-muted-foreground mr-1">{m.label}:</span>
                                )}
                                <span className="font-medium">{formatValue(value, m.label)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-[60]">
          <div className="container mx-auto flex gap-3">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handlePrev} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            )}
            {currentStep === "preview" ? (
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                次へ
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
