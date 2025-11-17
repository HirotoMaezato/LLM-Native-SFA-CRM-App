"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dealsStore } from "@/lib/store/deals"
import { BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts"

type ReportType = "area" | "product" | "period" | "team" | "status"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("status")
  const deals = dealsStore.getDeals()

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

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

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
                      >
                        {currentReport.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentReport.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => `¥${(value / 10000).toFixed(0)}万`}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
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
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold">
                    {selectedReport === "status"
                      ? `${item.value}件`
                      : `¥${(item.value / 10000).toFixed(0)}万`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* カスタムレポート作成ボタン */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>カスタムレポート</CardTitle>
            </div>
            <CardDescription>
              より詳細な分析が必要ですか？
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              カスタムレポートを作成（準備中）
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
