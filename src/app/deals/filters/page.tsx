"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { dealsStore } from "@/lib/store/deals"
import { DealStatus, DealPriority, FilterCondition } from "@/types/deal"
import { ArrowLeft, Plus, Save } from "lucide-react"
import Link from "next/link"

export default function FiltersPage() {
  const savedFilters = dealsStore.getFilterConditions()
  const [showNewFilter, setShowNewFilter] = useState(false)
  const [newFilter, setNewFilter] = useState({
    name: "",
    status: [] as DealStatus[],
    priority: [] as DealPriority[],
    minAmount: "",
    maxAmount: "",
    sortBy: "updatedAt" as keyof FilterCondition,
    sortOrder: "desc" as "asc" | "desc",
  })

  const statuses: DealStatus[] = ["新規", "アプローチ中", "提案", "商談中", "クロージング", "成約", "失注"]
  const priorities: DealPriority[] = ["高", "中", "低"]

  const handleSaveFilter = () => {
    if (!newFilter.name) {
      alert("フィルタ名を入力してください")
      return
    }

    const condition: Omit<FilterCondition, "id"> = {
      name: newFilter.name,
      filters: {
        status: newFilter.status.length > 0 ? newFilter.status : undefined,
        priority: newFilter.priority.length > 0 ? newFilter.priority : undefined,
        minAmount: newFilter.minAmount ? Number(newFilter.minAmount) : undefined,
        maxAmount: newFilter.maxAmount ? Number(newFilter.maxAmount) : undefined,
      },
      sortBy: newFilter.sortBy as any,
      sortOrder: newFilter.sortOrder,
    }

    dealsStore.saveFilterCondition(condition)
    setShowNewFilter(false)
    setNewFilter({
      name: "",
      status: [],
      priority: [],
      minAmount: "",
      maxAmount: "",
      sortBy: "updatedAt" as any,
      sortOrder: "desc",
    })
  }

  const toggleStatus = (status: DealStatus) => {
    setNewFilter(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  const togglePriority = (priority: DealPriority) => {
    setNewFilter(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/deals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold">フィルタ管理</h1>

        {/* 保存済みフィルタ */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>保存済みフィルタ</CardTitle>
              <Button size="sm" onClick={() => setShowNewFilter(!showNewFilter)}>
                <Plus className="h-4 w-4 mr-1" />
                新規作成
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedFilters.map((filter) => (
              <Card key={filter.id} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{filter.name}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {filter.filters.status && (
                      <div className="flex gap-1">
                        <span>ステータス:</span>
                        {filter.filters.status.map(s => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                    {filter.filters.priority && (
                      <div className="flex gap-1">
                        <span>優先度:</span>
                        {filter.filters.priority.map(p => (
                          <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                    )}
                    {(filter.filters.minAmount || filter.filters.maxAmount) && (
                      <div>
                        金額: {filter.filters.minAmount ? `¥${(filter.filters.minAmount / 10000).toFixed(0)}万〜` : ""}
                        {filter.filters.maxAmount ? `¥${(filter.filters.maxAmount / 10000).toFixed(0)}万` : ""}
                      </div>
                    )}
                  </div>
                  {filter.sortBy && (
                    <p className="text-xs text-muted-foreground">
                      ソート: {filter.sortBy} ({filter.sortOrder === "asc" ? "昇順" : "降順"})
                    </p>
                  )}
                </div>
              </Card>
            ))}

            {savedFilters.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                保存済みフィルタがありません
              </p>
            )}
          </CardContent>
        </Card>

        {/* 新規フィルタ作成 */}
        {showNewFilter && (
          <Card>
            <CardHeader>
              <CardTitle>新規フィルタ作成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">フィルタ名</label>
                <Input
                  value={newFilter.name}
                  onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                  placeholder="例: 高額案件"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">ステータス</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => (
                    <Badge
                      key={status}
                      variant={newFilter.status.includes(status) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">優先度</label>
                <div className="flex flex-wrap gap-2">
                  {priorities.map(priority => (
                    <Badge
                      key={priority}
                      variant={newFilter.priority.includes(priority) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePriority(priority)}
                    >
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">最小金額（円）</label>
                  <Input
                    type="number"
                    value={newFilter.minAmount}
                    onChange={(e) => setNewFilter({ ...newFilter, minAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">最大金額（円）</label>
                  <Input
                    type="number"
                    value={newFilter.maxAmount}
                    onChange={(e) => setNewFilter({ ...newFilter, maxAmount: e.target.value })}
                    placeholder="10000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ソート項目</label>
                  <select
                    value={newFilter.sortBy}
                    onChange={(e) => setNewFilter({ ...newFilter, sortBy: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="updatedAt">更新日時</option>
                    <option value="createdAt">作成日時</option>
                    <option value="amount">金額</option>
                    <option value="probability">確度</option>
                    <option value="expectedCloseDate">クロージング予定日</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">並び順</label>
                  <select
                    value={newFilter.sortOrder}
                    onChange={(e) => setNewFilter({ ...newFilter, sortOrder: e.target.value as "asc" | "desc" })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="desc">降順</option>
                    <option value="asc">昇順</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveFilter} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button variant="outline" onClick={() => setShowNewFilter(false)} className="flex-1">
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
