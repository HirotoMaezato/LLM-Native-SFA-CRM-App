"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { dealsStore } from "@/lib/store/deals"
import { validateFormula, getAvailableFormulaFields, getAvailableFunctions } from "@/lib/formula-parser"
import {
  ChartType,
  DimensionField,
  MetricType,
  MetricField,
  CustomReportConfig,
  DealStatus,
  DealPriority,
  CalculatedField,
  MetricDefinition
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
  HelpCircle
} from "lucide-react"
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
  Legend
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
    { field: "company", label: "会社", description: "取引先会社別" },
    { field: "contactPerson", label: "担当者", description: "顧客担当者別" },
    { field: "createdAt", label: "作成日", description: "案件作成日別" },
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
    calculatedFields: calculatedFields.length > 0 ? calculatedFields : undefined
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>計算フィールド</CardTitle>
                    <CardDescription>カスタム数式で独自の指標を作成</CardDescription>
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
                  <div className="p-3 rounded-lg bg-muted text-sm space-y-2">
                    <p className="font-medium">利用可能なフィールド:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {getAvailableFormulaFields().map(f => (
                        <li key={f.name}>
                          <code className="bg-background px-1 rounded">{f.name}</code> - {f.description}
                        </li>
                      ))}
                    </ul>
                    <p className="font-medium mt-3">利用可能な関数:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {getAvailableFunctions().map(f => (
                        <li key={f.name}>
                          <code className="bg-background px-1 rounded">{f.syntax}</code> - {f.description}
                        </li>
                      ))}
                    </ul>
                    <p className="font-medium mt-3">例:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code className="bg-background px-1 rounded">amount * probability / 100</code> - 期待値</li>
                      <li><code className="bg-background px-1 rounded">amount * 0.1</code> - 手数料10%</li>
                    </ul>
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
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allAreas.map(area => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>商材で絞り込み</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allProducts.map(product => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>チームで絞り込み</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allTeams.map(team => (
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
          </div>
        )}

        {currentStep === "preview" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>レポート情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">レポート名 *</label>
                  <Input
                    placeholder="例: 月別売上推移"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">説明（任意）</label>
                  <Input
                    placeholder="例: 各月の売上金額の推移を表示"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <CardTitle>プレビュー</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>設定内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">グラフタイプ</span>
                    <span className="font-medium">{chartTypes.find(c => c.type === chartType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">分析軸</span>
                    <span className="font-medium">
                      {dimensions.map(d => allDimensions.find(ad => ad.field === d)?.label).join(' / ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">指標</span>
                    <span className="font-medium">{metrics.map(m => m.label).join(', ')}</span>
                  </div>
                  {calculatedFields.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">計算フィールド</span>
                      <span className="font-medium">{calculatedFields.length}件</span>
                    </div>
                  )}
                  {statusFilters.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ステータス</span>
                      <span className="font-medium">{statusFilters.join(", ")}</span>
                    </div>
                  )}
                  {priorityFilters.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">優先度</span>
                      <span className="font-medium">{priorityFilters.join(", ")}</span>
                    </div>
                  )}
                  {areaFilters.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">エリア</span>
                      <span className="font-medium">{areaFilters.join(", ")}</span>
                    </div>
                  )}
                  {productFilters.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">商材</span>
                      <span className="font-medium">{productFilters.join(", ")}</span>
                    </div>
                  )}
                  {teamFilters.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">チーム</span>
                      <span className="font-medium">{teamFilters.join(", ")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>データ詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {previewData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        {metrics.map((m, mIndex) => {
                          const key = m.label || `${m.type}_${m.field}`
                          const value = item[key] as number
                          return (
                            <div key={mIndex} className="text-sm font-medium">
                              {formatValue(value, m.label)}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
