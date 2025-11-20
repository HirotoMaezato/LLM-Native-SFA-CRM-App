"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { accountsStore } from "@/lib/store/accounts"
import { AccountFilterCondition } from "@/types/account"
import { Search, Plus, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

export default function AccountsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<AccountFilterCondition | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const allAccounts = accountsStore.getAccounts()
  const savedFilters = accountsStore.getFilterConditions()

  // フィルタリング・検索処理
  let filteredAccounts = selectedFilter
    ? accountsStore.filterAccounts(selectedFilter)
    : allAccounts

  if (searchQuery) {
    filteredAccounts = filteredAccounts.filter(account =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account.representative && account.representative.toLowerCase().includes(searchQuery.toLowerCase())) ||
      account.region.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 金額をフォーマット
  const formatRevenue = (revenue?: number) => {
    if (!revenue) return "-"
    if (revenue >= 100000000) {
      return `${(revenue / 100000000).toFixed(1)}億円`
    }
    return `${(revenue / 10000).toFixed(0)}万円`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold">取引先一覧</h1>
            <p className="text-sm text-muted-foreground">
              {filteredAccounts.length}件の取引先
            </p>
          </div>
          <Link href="/accounts/new">
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
            placeholder="会社名、代表者名、地域で検索..."
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
            </Card>
          )}
        </div>

        {/* 取引先リスト */}
        <div className="space-y-3 pb-4">
          {filteredAccounts.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="space-y-3">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{account.name}</h3>
                        <Badge
                          variant={account.status === "活動中" ? "default" : account.status === "休止" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {account.status}
                        </Badge>
                      </div>
                      {account.industry && (
                        <p className="text-sm text-muted-foreground">{account.industry}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatRevenue(account.annualRevenue)}</p>
                      <p className="text-xs text-muted-foreground">年間売上</p>
                    </div>
                  </div>

                  {/* 情報 */}
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{account.region}</Badge>
                    {account.employeeCount && (
                      <span className="text-muted-foreground">
                        従業員: {account.employeeCount.toLocaleString()}名
                      </span>
                    )}
                  </div>

                  {/* タグ */}
                  {account.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {account.tags.map(tag => (
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
                    {account.representative && <span>代表: {account.representative}</span>}
                    {account.phone && <span>TEL: {account.phone}</span>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {filteredAccounts.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">取引先が見つかりませんでした</p>
              <Link href="/accounts/new">
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  新規取引先を作成
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
