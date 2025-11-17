"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { dealsStore } from "@/lib/store/deals"
import { FilterCondition } from "@/types/deal"
import { Search, Plus, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<FilterCondition | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const allDeals = dealsStore.getDeals()
  const savedFilters = dealsStore.getFilterConditions()

  // フィルタリング・検索処理
  let filteredDeals = selectedFilter
    ? dealsStore.filterDeals(selectedFilter)
    : allDeals

  if (searchQuery) {
    filteredDeals = filteredDeals.filter(deal =>
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold">商談一覧</h1>
            <p className="text-sm text-muted-foreground">
              {filteredDeals.length}件の商談
            </p>
          </div>
          <Link href="/deals/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              新規
            </Button>
          </Link>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="商談名、会社名、担当者で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* フィルタ */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            保存済みフィルタ
            {selectedFilter && <Badge variant="secondary" className="ml-2">{selectedFilter.name}</Badge>}
          </Button>

          {showFilters && (
            <Card className="p-3 space-y-2">
              <Button
                variant={selectedFilter === null ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedFilter(null)}
              >
                すべて表示
              </Button>
              {savedFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter?.id === filter.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter.name}
                </Button>
              ))}
              <Link href="/deals/filters">
                <Button variant="outline" size="sm" className="w-full">
                  フィルタを管理
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* 商談リスト */}
        <div className="space-y-3 pb-4">
          {filteredDeals.map((deal) => (
            <Link key={deal.id} href={`/deals/${deal.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="space-y-3">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{deal.title}</h3>
                        <Badge
                          variant={deal.priority === "高" ? "destructive" : deal.priority === "中" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {deal.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{deal.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">¥{(deal.amount / 10000).toFixed(0)}万</p>
                      <p className="text-xs text-muted-foreground">{deal.probability}%</p>
                    </div>
                  </div>

                  {/* ステータスと日付 */}
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{deal.status}</Badge>
                    <span className="text-muted-foreground">
                      予定: {new Date(deal.expectedCloseDate).toLocaleDateString('ja-JP')}
                    </span>
                  </div>

                  {/* タグ */}
                  {deal.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {deal.tags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: tag.color, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* メタ情報 */}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {deal.area && <span>📍 {deal.area}</span>}
                    {deal.product && <span>📦 {deal.product}</span>}
                    {deal.team && <span>👥 {deal.team}</span>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {filteredDeals.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">商談が見つかりませんでした</p>
              <Link href="/deals/new">
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  新規商談を作成
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
