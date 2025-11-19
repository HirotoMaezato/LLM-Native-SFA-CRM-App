"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dealsStore } from "@/lib/store/deals"
import { CustomReport, ReportDataPoint, Deal, CustomReportConfig } from "@/types/deal"
import { BarChart3, PieChart, TrendingUp, Calendar, Plus, Trash2, LineChart, AreaChart, Target, Layers, Table2, X, ArrowUpRight } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  ScatterChart,
  Scatter,
  ZAxis,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts"

type ReportType = "area" | "product" | "period" | "team" | "status"

export default function ReportsPage() {
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState<ReportType>("status")
  const [selectedCustomReport, setSelectedCustomReport] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const deals = dealsStore.getDeals()
  const customReports = dealsStore.getCustomReports()

  // Drill-down state
  const [drillDownData, setDrillDownData] = useState<{
    groupName: string
    deals: Deal[]
    config: CustomReportConfig
  } | null>(null)

  // Handle drill-down
  const handleDrillDown = (groupName: string, config: CustomReportConfig) => {
    const groupDeals = dealsStore.getDealsForGroup(config, groupName)
    setDrillDownData({
      groupName,
      deals: groupDeals,
      config
    })
  }

  // Close drill-down
  const closeDrillDown = () => {
    setDrillDownData(null)
  }

  // Handle drill-down for standard reports
  const handleStandardReportDrillDown = (groupName: string, reportType: ReportType) => {
    // For period reports, we need to convert Japanese month format to YYYY-MM format
    let dimensionValue = groupName
    if (reportType === 'period') {
      // Convert from "2025年11月" to "2025-11" format
      const match = groupName.match(/(\d{4})年(\d{1,2})月/)
      if (match) {
        const [, year, month] = match
        dimensionValue = `${year}-${month.padStart(2, '0')}`
      }
    }

    // Create a config that matches the standard report type
    const config: CustomReportConfig = {
      chartType: reportType === 'status' ? 'pie' : 'bar',
      dimension: reportType === 'period' ? 'month' : reportType,
      metric: reportType === 'status' ? 'count' : 'sum',
      metricField: reportType === 'status' ? 'count' : 'amount',
      filters: {}
    }

    const groupDeals = dealsStore.getDealsForGroup(config, dimensionValue)
    setDrillDownData({
      groupName,
      deals: groupDeals,
      config
    })
  }

  const handleDeleteCustomReport = (id: string) => {
    if (confirm("このカスタムレポートを削除しますか？")) {
      dealsStore.deleteCustomReport(id)
      if (selectedCustomReport === id) {
        setSelectedCustomReport(null)
      }
      setRefreshKey(prev => prev + 1)
    }
  }

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case "pie": return PieChart
      case "line": return LineChart
      case "area":
      case "stackedArea": return AreaChart
      case "radar": return Target
      case "scatter": return Layers
      case "table": return Table2
      default: return BarChart3
    }
  }

  const renderCustomChart = (report: CustomReport) => {
    // Use enhanced data generation for multi-metric support
    const data = dealsStore.generateEnhancedReportData(report.config) as ReportDataPoint[]
    const { chartType } = report.config

    // Get metrics configuration
    const metrics = report.config.metrics && report.config.metrics.length > 0
      ? report.config.metrics
      : [{
          type: report.config.metric,
          field: report.config.metricField,
          label: report.config.metric === 'count' ? '件数' :
                 report.config.metricField === 'probability' ? '平均確度' : '金額合計'
        }]

    const metricKeys = metrics.map(m => m.label || `${m.type}_${m.field}`)

    const formatValue = (value: number, metricLabel?: string): string => {
      if (metricLabel?.includes('件数') || metricLabel === '件数') {
        return `${value}件`
      } else if (metricLabel?.includes('確度')) {
        return `${value.toFixed(1)}%`
      } else {
        return `¥${(value / 10000).toFixed(0)}万`
      }
    }

    if (data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          データがありません
        </div>
      )
    }

    // Table chart type rendering
    if (chartType === "table") {
      return (
        <div className="h-[300px] w-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b">
              <tr>
                <th className="text-left p-2 font-medium">項目</th>
                {metricKeys.map((key) => (
                  <th key={key} className="text-right p-2 font-medium">{key}</th>
                ))}
                <th className="text-center p-2 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleDrillDown(item.name, report.config)}
                >
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
                  <td className="p-2 text-center">
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 bg-muted/30">
              <tr>
                <td className="p-2 font-medium">合計</td>
                {metricKeys.map((key) => {
                  const total = data.reduce((sum, item) => sum + (item[key] as number), 0)
                  return (
                    <td key={key} className="p-2 text-right font-mono font-medium">
                      {formatValue(total, key)}
                    </td>
                  )
                })}
                <td></td>
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
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={metricKeys[0]}
                onClick={(entry) => {
                  if (entry && entry.name) {
                    handleDrillDown(entry.name, report.config)
                  }
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatValue(value, metricKeys[0])} />
            </RechartsPieChart>
          ) : chartType === "line" ? (
            <RechartsLineChart
              data={data}
              onClick={(e: unknown) => {
                const event = e as { activePayload?: Array<{ payload: { name: string } }> }
                if (event && event.activePayload && event.activePayload[0]) {
                  handleDrillDown(event.activePayload[0].payload.name, report.config)
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number, name: string) => formatValue(value, name)} />
              {metrics.length > 1 && <Legend />}
              {metricKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  cursor="pointer"
                />
              ))}
            </RechartsLineChart>
          ) : chartType === "area" || chartType === "stackedArea" ? (
            <RechartsAreaChart
              data={data}
              onClick={(e: unknown) => {
                const event = e as { activePayload?: Array<{ payload: { name: string } }> }
                if (event && event.activePayload && event.activePayload[0]) {
                  handleDrillDown(event.activePayload[0].payload.name, report.config)
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
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
                  cursor="pointer"
                />
              ))}
            </RechartsAreaChart>
          ) : chartType === "radar" ? (
            <RadarChart
              data={data}
              onClick={(e: unknown) => {
                const event = e as { activePayload?: Array<{ payload: { name: string } }> }
                if (event && event.activePayload && event.activePayload[0]) {
                  handleDrillDown(event.activePayload[0].payload.name, report.config)
                }
              }}
            >
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
                  cursor="pointer"
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
                  dataKey={metricKeys[1] || metricKeys[0]}
                  range={[50, 400]}
                  name={metricKeys[1] || metricKeys[0]}
                />
              )}
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pointData = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="font-medium text-sm">{pointData.name}</p>
                        {metricKeys.map((key) => (
                          <p key={key} className="text-xs text-muted-foreground">
                            {key}: {formatValue(pointData[key], key)}
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
                data={data.map((item, index) => ({ ...item, index }))}
                fill={COLORS[0]}
                cursor="pointer"
                onClick={(entry: unknown) => {
                  const point = entry as { name?: string }
                  if (point && point.name) {
                    handleDrillDown(point.name, report.config)
                  }
                }}
              />
            </ScatterChart>
          ) : chartType === "funnel" ? (
            <FunnelChart>
              <Tooltip formatter={(value: number) => formatValue(value, metricKeys[0])} />
              <Funnel
                dataKey={metricKeys[0]}
                data={[...data].sort((a, b) => (b[metricKeys[0]] as number) - (a[metricKeys[0]] as number))}
                isAnimationActive
                onClick={(entry: unknown) => {
                  const funnelEntry = entry as { name?: string }
                  if (funnelEntry && funnelEntry.name) {
                    handleDrillDown(funnelEntry.name, report.config)
                  }
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
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
            <BarChart
              data={data}
              onClick={(e: unknown) => {
                const event = e as { activePayload?: Array<{ payload: { name: string } }> }
                if (event && event.activePayload && event.activePayload[0]) {
                  handleDrillDown(event.activePayload[0].payload.name, report.config)
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number, name: string) => formatValue(value, name)} />
              {metrics.length > 1 && <Legend />}
              {metricKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                  stackId={chartType === "stackedBar" ? "1" : undefined}
                  cursor="pointer"
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  // エリア別レポート
  const areaData = Object.entries(
    deals.reduce((acc, deal) => {
      const area = deal.area || "未設定"
      acc[area] = (acc[area] || 0) + deal.amount
      return acc
    }, {} as Record<string, number>)
  ).map(([area, amount]) => ({ name: area, value: amount }))

  // 商材別レポート
  const productData = Object.entries(
    deals.reduce((acc, deal) => {
      const product = deal.product || "未設定"
      acc[product] = (acc[product] || 0) + deal.amount
      return acc
    }, {} as Record<string, number>)
  ).map(([product, amount]) => ({ name: product, value: amount }))

  // チーム別レポート
  const teamData = Object.entries(
    deals.reduce((acc, deal) => {
      const team = deal.team || "未設定"
      acc[team] = (acc[team] || 0) + deal.amount
      return acc
    }, {} as Record<string, number>)
  ).map(([team, amount]) => ({ name: team, value: amount }))

  // ステータス別レポート
  const statusData = Object.entries(
    deals.reduce((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ name: status, value: count }))

  // 期間別レポート（月別）
  const periodData = Object.entries(
    deals.reduce((acc, deal) => {
      const month = new Date(deal.expectedCloseDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })
      acc[month] = (acc[month] || 0) + deal.amount
      return acc
    }, {} as Record<string, number>)
  ).map(([month, amount]) => ({ name: month, value: amount }))

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#f43f5e']

  const reportConfigs = {
    area: { title: "エリア別商談金額", data: areaData, icon: BarChart3 },
    product: { title: "商材別商談金額", data: productData, icon: BarChart3 },
    period: { title: "期間別商談金額", data: periodData, icon: Calendar },
    team: { title: "チーム別商談金額", data: teamData, icon: BarChart3 },
    status: { title: "ステータス別商談数", data: statusData, icon: PieChart },
  }

  const currentReport = reportConfigs[selectedReport]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="pt-4">
          <h1 className="text-2xl font-bold">レポート</h1>
          <p className="text-sm text-muted-foreground">
            営業データの分析とビジュアライゼーション
          </p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>総商談数</CardDescription>
              <CardTitle className="text-2xl">{deals.length}件</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>総商談金額</CardDescription>
              <CardTitle className="text-2xl">
                ¥{(deals.reduce((sum, d) => sum + d.amount, 0) / 1000000).toFixed(1)}M
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>平均商談金額</CardDescription>
              <CardTitle className="text-2xl">
                ¥{(deals.reduce((sum, d) => sum + d.amount, 0) / deals.length / 10000).toFixed(0)}万
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>成約率</CardDescription>
              <CardTitle className="text-2xl">
                {((deals.filter(d => d.status === "成約").length / deals.length) * 100).toFixed(0)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* レポート選択 */}
        <Card>
          <CardHeader>
            <CardTitle>標準レポート</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedReport === "status" ? "default" : "outline"}
                onClick={() => setSelectedReport("status")}
                className="justify-start"
              >
                <PieChart className="h-4 w-4 mr-2" />
                ステータス別
              </Button>
              <Button
                variant={selectedReport === "area" ? "default" : "outline"}
                onClick={() => setSelectedReport("area")}
                className="justify-start"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                エリア別
              </Button>
              <Button
                variant={selectedReport === "product" ? "default" : "outline"}
                onClick={() => setSelectedReport("product")}
                className="justify-start"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                商材別
              </Button>
              <Button
                variant={selectedReport === "period" ? "default" : "outline"}
                onClick={() => setSelectedReport("period")}
                className="justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                期間別
              </Button>
              <Button
                variant={selectedReport === "team" ? "default" : "outline"}
                onClick={() => setSelectedReport("team")}
                className="justify-start"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                チーム別
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* グラフ表示 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {currentReport.icon && <currentReport.icon className="h-5 w-5" />}
              <CardTitle>{currentReport.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {currentReport.data.length > 0 ? (
              <div className="h-[300px] w-full">
                {selectedReport === "status" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={currentReport.data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(entry) => {
                          if (entry && entry.name) {
                            handleStandardReportDrillDown(entry.name, selectedReport)
                          }
                        }}
                      >
                        {currentReport.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={currentReport.data}
                      onClick={(e: unknown) => {
                        const event = e as { activePayload?: Array<{ payload: { name: string } }> }
                        if (event && event.activePayload && event.activePayload[0]) {
                          handleStandardReportDrillDown(event.activePayload[0].payload.name, selectedReport)
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => `¥${(value / 10000).toFixed(0)}万`}
                      />
                      <Bar dataKey="value" fill="#3b82f6" cursor="pointer" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                データがありません
              </p>
            )}
          </CardContent>
        </Card>

        {/* データテーブル */}
        <Card>
          <CardHeader>
            <CardTitle>データ詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentReport.data.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleStandardReportDrillDown(item.name, selectedReport)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {selectedReport === "status"
                        ? `${item.value}件`
                        : `¥${(item.value / 10000).toFixed(0)}万`}
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* カスタムレポート */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>カスタムレポート</CardTitle>
              </div>
              <Button size="sm" onClick={() => router.push("/reports/builder")}>
                <Plus className="h-4 w-4 mr-1" />
                作成
              </Button>
            </div>
            <CardDescription>
              自分だけのレポートを作成・管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customReports.length > 0 ? (
              <div className="space-y-2">
                {customReports.map(report => {
                  const ChartIcon = getChartIcon(report.config.chartType)
                  return (
                    <div
                      key={report.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedCustomReport === report.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedCustomReport(
                            selectedCustomReport === report.id ? null : report.id
                          )}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          <ChartIcon className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{report.name}</p>
                            {report.description && (
                              <p className="text-xs text-muted-foreground">{report.description}</p>
                            )}
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCustomReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                カスタムレポートはまだありません
              </p>
            )}
          </CardContent>
        </Card>

        {/* 選択されたカスタムレポートの表示 */}
        {selectedCustomReport && (
          <>
            {(() => {
              const report = customReports.find(r => r.id === selectedCustomReport)
              if (!report) return null

              const ChartIcon = getChartIcon(report.config.chartType)
              const data = dealsStore.generateEnhancedReportData(report.config) as ReportDataPoint[]

              // Get metrics configuration
              const metrics = report.config.metrics && report.config.metrics.length > 0
                ? report.config.metrics
                : [{
                    type: report.config.metric,
                    field: report.config.metricField,
                    label: report.config.metric === 'count' ? '件数' :
                           report.config.metricField === 'probability' ? '平均確度' : '金額合計'
                  }]

              const formatValue = (value: number, metricLabel?: string): string => {
                if (metricLabel?.includes('件数') || metricLabel === '件数') {
                  return `${value}件`
                } else if (metricLabel?.includes('確度')) {
                  return `${value.toFixed(1)}%`
                } else {
                  return `¥${(value / 10000).toFixed(0)}万`
                }
              }

              return (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ChartIcon className="h-5 w-5" />
                        <CardTitle>{report.name}</CardTitle>
                      </div>
                      {report.description && (
                        <CardDescription>{report.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {renderCustomChart(report)}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>データ詳細</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {data.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleDrillDown(item.name, report.config)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                {metrics.map((m, mIndex) => {
                                  const key = m.label || `${m.type}_${m.field}`
                                  const value = item[key] as number
                                  return (
                                    <div key={mIndex} className="font-semibold">
                                      {metrics.length > 1 && <span className="text-xs text-muted-foreground mr-1">{m.label}:</span>}
                                      {formatValue(value, m.label)}
                                    </div>
                                  )
                                })}
                              </div>
                              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )
            })()}
          </>
        )}

        {/* Drill-down Modal */}
        {drillDownData && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="w-full max-w-2xl max-h-[80vh] bg-background border rounded-t-lg sm:rounded-lg shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-semibold text-lg">ドリルダウン: {drillDownData.groupName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {drillDownData.deals.length}件の案件
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={closeDrillDown}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {drillDownData.deals.length > 0 ? (
                  <div className="space-y-3">
                    {drillDownData.deals.map((deal) => (
                      <Card key={deal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{deal.title}</h4>
                              <p className="text-xs text-muted-foreground">{deal.company}</p>
                            </div>
                            <Badge variant={
                              deal.status === "成約" ? "default" :
                              deal.status === "失注" ? "destructive" :
                              "secondary"
                            }>
                              {deal.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">金額: </span>
                              <span className="font-medium">¥{(deal.amount / 10000).toFixed(0)}万</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">確度: </span>
                              <span className="font-medium">{deal.probability}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">担当: </span>
                              <span>{deal.contactPerson}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">予定日: </span>
                              <span>{deal.expectedCloseDate}</span>
                            </div>
                          </div>
                          {deal.area && deal.product && (
                            <div className="flex gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">{deal.area}</Badge>
                              <Badge variant="outline" className="text-xs">{deal.product}</Badge>
                              {deal.team && <Badge variant="outline" className="text-xs">{deal.team}</Badge>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    該当する案件がありません
                  </p>
                )}
              </div>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full" onClick={closeDrillDown}>
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
