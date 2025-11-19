"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { dealsStore } from "@/lib/store/deals"
import {
  ChartType,
  DimensionField,
  MetricType,
  MetricField,
  CustomReportConfig,
  DealStatus,
  DealPriority
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
  Eye
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
  Area
} from "recharts"

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#06b6d4']

type Step = "chart" | "dimension" | "metric" | "filters" | "preview"

export default function ReportBuilderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("chart")
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")

  // Report configuration state
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [dimension, setDimension] = useState<DimensionField>("status")
  const [metric, setMetric] = useState<MetricType>("count")
  const [metricField, setMetricField] = useState<MetricField>("count")

  // Filter state
  const [statusFilters, setStatusFilters] = useState<DealStatus[]>([])
  const [priorityFilters, setPriorityFilters] = useState<DealPriority[]>([])
  const [minAmount, setMinAmount] = useState<string>("")
  const [maxAmount, setMaxAmount] = useState<string>("")

  const steps: { key: Step; label: string; number: number }[] = [
    { key: "chart", label: "グラフ", number: 1 },
    { key: "dimension", label: "軸", number: 2 },
    { key: "metric", label: "指標", number: 3 },
    { key: "filters", label: "絞込", number: 4 },
    { key: "preview", label: "確認", number: 5 },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === currentStep)

  const chartTypes: { type: ChartType; label: string; icon: typeof BarChart3; description: string }[] = [
    { type: "bar", label: "棒グラフ", icon: BarChart3, description: "カテゴリ別の比較に最適" },
    { type: "pie", label: "円グラフ", icon: PieChart, description: "割合や構成比の表示に" },
    { type: "line", label: "折れ線", icon: LineChart, description: "時系列データの推移に" },
    { type: "area", label: "エリア", icon: AreaChart, description: "累積データの表示に" },
  ]

  const dimensions: { field: DimensionField; label: string; description: string }[] = [
    { field: "status", label: "ステータス", description: "商談の進行状況別" },
    { field: "area", label: "エリア", description: "地域・担当エリア別" },
    { field: "product", label: "商材", description: "製品・サービス別" },
    { field: "team", label: "チーム", description: "営業チーム別" },
    { field: "priority", label: "優先度", description: "案件の優先度別" },
    { field: "month", label: "月別", description: "予定完了月別の推移" },
  ]

  const metrics: { type: MetricType; field: MetricField; label: string; description: string }[] = [
    { type: "count", field: "count", label: "件数", description: "商談の数をカウント" },
    { type: "sum", field: "amount", label: "金額合計", description: "商談金額の合計" },
    { type: "average", field: "amount", label: "平均金額", description: "商談金額の平均" },
    { type: "average", field: "probability", label: "平均確度", description: "成約確度の平均" },
  ]

  const allStatuses: DealStatus[] = ["新規", "アプローチ中", "提案", "商談中", "クロージング", "成約", "失注"]
  const allPriorities: DealPriority[] = ["高", "中", "低"]

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

  const getConfig = (): CustomReportConfig => ({
    chartType,
    dimension,
    metric,
    metricField,
    filters: {
      status: statusFilters.length > 0 ? statusFilters : undefined,
      priority: priorityFilters.length > 0 ? priorityFilters : undefined,
      minAmount: minAmount ? parseInt(minAmount) : undefined,
      maxAmount: maxAmount ? parseInt(maxAmount) : undefined,
    }
  })

  const previewData = dealsStore.generateReportData(getConfig())

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

  const formatValue = (value: number): string => {
    if (metric === "count") {
      return `${value}件`
    } else if (metricField === "probability") {
      return `${value.toFixed(1)}%`
    } else {
      return `¥${(value / 10000).toFixed(0)}万`
    }
  }

  const renderChart = () => {
    if (previewData.length === 0) {
      return (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          データがありません
        </div>
      )
    }

    return (
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <RechartsPieChart>
              <Pie
                data={previewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatValue(value)} />
            </RechartsPieChart>
          ) : chartType === "line" ? (
            <RechartsLineChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => formatValue(value)} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </RechartsLineChart>
          ) : chartType === "area" ? (
            <RechartsAreaChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => formatValue(value)} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </RechartsAreaChart>
          ) : (
            <BarChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => formatValue(value)} />
              <Bar dataKey="value" fill="#3b82f6" />
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
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : index === currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span className={`text-xs mt-1 ${
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
            <CardContent className="space-y-3">
              {chartTypes.map(({ type, label, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                    chartType === type
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    chartType === type ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {currentStep === "dimension" && (
          <Card>
            <CardHeader>
              <CardTitle>分析軸を選択</CardTitle>
              <CardDescription>何を基準にデータを分類しますか？</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {dimensions.map(({ field, label, description }) => (
                <button
                  key={field}
                  onClick={() => setDimension(field)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    dimension === field
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {currentStep === "metric" && (
          <Card>
            <CardHeader>
              <CardTitle>表示指標を選択</CardTitle>
              <CardDescription>どの数値を表示しますか？</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.map(({ type, field, label, description }) => (
                <button
                  key={`${type}-${field}`}
                  onClick={() => {
                    setMetric(type)
                    setMetricField(field)
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    metric === type && metricField === field
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
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
                    <span className="font-medium">{dimensions.find(d => d.field === dimension)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">指標</span>
                    <span className="font-medium">{metrics.find(m => m.type === metric && m.field === metricField)?.label}</span>
                  </div>
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>データ詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {previewData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatValue(item.value)}</span>
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
