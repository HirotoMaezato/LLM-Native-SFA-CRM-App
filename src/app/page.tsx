"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dealsStore } from "@/lib/store/deals"
import { TrendingUp, Target, DollarSign, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const deals = dealsStore.getDeals()

  // 統計情報の計算
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0)
  const activeDeals = deals.filter(d => ["アプローチ中", "提案", "商談中", "クロージング"].includes(d.status)).length
  const highPriorityDeals = deals.filter(d => d.priority === "高").length
  const avgProbability = Math.round(deals.reduce((sum, deal) => sum + deal.probability, 0) / deals.length)

  // 最近更新された商談
  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-4 space-y-6">
        {/* ヘッダー */}
        <div className="pt-4">
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">営業活動の概要を確認</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                総商談金額
              </CardDescription>
              <CardTitle className="text-2xl">
                ¥{(totalAmount / 1000000).toFixed(1)}M
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                活動中
              </CardDescription>
              <CardTitle className="text-2xl">{activeDeals}件</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                高優先度
              </CardDescription>
              <CardTitle className="text-2xl">{highPriorityDeals}件</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                平均確度
              </CardDescription>
              <CardTitle className="text-2xl">{avgProbability}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 最近の商談 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近の更新</CardTitle>
              <Link href="/deals">
                <Button variant="ghost" size="sm">
                  すべて見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDeals.map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.id}`}>
                <div className="flex items-start justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium leading-none">{deal.title}</p>
                      <Badge variant={deal.priority === "高" ? "destructive" : "secondary"} className="text-xs">
                        {deal.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{deal.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">¥{(deal.amount / 10000).toFixed(0)}万</p>
                    <p className="text-xs text-muted-foreground">{deal.status}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/deals/new">
              <Button className="w-full" variant="default">
                新規商談登録
              </Button>
            </Link>
            <Link href="/ai-coach">
              <Button className="w-full" variant="outline">
                AI催促
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
