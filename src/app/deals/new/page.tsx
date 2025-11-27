"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dealsStore } from "@/lib/store/deals"
import { DealStatus, DealPriority } from "@/types/deal"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewDealPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    amount: "",
    status: "新規" as DealStatus,
    priority: "中" as DealPriority,
    probability: "30",
    expectedCloseDate: "",
    description: "",
    area: "",
    product: "",
    team: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.company || !formData.contactPerson) {
      alert("必須項目を入力してください")
      return
    }

    dealsStore.addDeal({
      title: formData.title,
      company: formData.company,
      contactPerson: formData.contactPerson,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      amount: Number(formData.amount) || 0,
      status: formData.status,
      priority: formData.priority,
      probability: Number(formData.probability) || 0,
      expectedCloseDate: formData.expectedCloseDate || new Date().toISOString().split('T')[0],
      description: formData.description || undefined,
      area: formData.area || undefined,
      product: formData.product || undefined,
      team: formData.team || undefined,
      notes: formData.notes || undefined,
    })

    router.push("/deals")
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
          <Button type="submit" form="deal-form">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>

        <h1 className="text-2xl font-bold">新規商談登録</h1>

        <form id="deal-form" onSubmit={handleSubmit} className="space-y-4">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  商談名 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 新規CRMシステム導入"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ステータス</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DealStatus })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>新規</option>
                    <option>アプローチ中</option>
                    <option>提案</option>
                    <option>商談中</option>
                    <option>クロージング</option>
                    <option>成約</option>
                    <option>失注</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">優先度</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as DealPriority })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>高</option>
                    <option>中</option>
                    <option>低</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">商談金額（円）</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">成約確度（%）</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">クロージング予定日</label>
                <Input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 顧客情報 */}
          <Card>
            <CardHeader>
              <CardTitle>顧客情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  会社名 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="例: 株式会社テックソリューション"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  担当者名 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="例: 山田太郎"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">メールアドレス</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="example@company.co.jp"
                />
              </div>

              <div>
                <label className="text-sm font-medium">電話番号</label>
                <Input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="03-1234-5678"
                />
              </div>
            </CardContent>
          </Card>

          {/* 商談詳細 */}
          <Card>
            <CardHeader>
              <CardTitle>商談詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">エリア</label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="東京"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">商材</label>
                  <Input
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    placeholder="CRMシステム"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">担当チーム</label>
                <Input
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  placeholder="第一営業部"
                />
              </div>

              <div>
                <label className="text-sm font-medium">商談概要</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="商談の概要を入力してください"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">メモ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="メモや特記事項を入力してください"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
