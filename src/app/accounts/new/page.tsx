"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { accountsStore } from "@/lib/store/accounts"
import { AccountStatus, AccountIndustry } from "@/types/account"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewAccountPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    industry: "" as AccountIndustry | "",
    region: "",
    phone: "",
    email: "",
    website: "",
    representative: "",
    employeeCount: "",
    annualRevenue: "",
    address: "",
    status: "活動中" as AccountStatus,
    description: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.region) {
      alert("必須項目を入力してください")
      return
    }

    accountsStore.addAccount({
      name: formData.name,
      industry: formData.industry || undefined,
      region: formData.region,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      website: formData.website || undefined,
      representative: formData.representative || undefined,
      employeeCount: formData.employeeCount ? Number(formData.employeeCount) : undefined,
      annualRevenue: formData.annualRevenue ? Number(formData.annualRevenue) : undefined,
      address: formData.address || undefined,
      status: formData.status,
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    })

    router.push("/accounts")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/accounts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <Button type="submit" form="account-form">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>

        <h1 className="text-2xl font-bold">新規取引先登録</h1>

        <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  会社名 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 株式会社テックソリューション"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">業種</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value as AccountIndustry })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">選択してください</option>
                    <option value="IT">IT</option>
                    <option value="製造">製造</option>
                    <option value="金融">金融</option>
                    <option value="物流">物流</option>
                    <option value="医療">医療</option>
                    <option value="建設">建設</option>
                    <option value="農業">農業</option>
                    <option value="観光">観光</option>
                    <option value="小売">小売</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">ステータス</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AccountStatus })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="活動中">活動中</option>
                    <option value="休止">休止</option>
                    <option value="見込み">見込み</option>
                    <option value="提携">提携</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  地域 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="例: 関東"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">代表者名</label>
                <Input
                  value={formData.representative}
                  onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                  placeholder="例: 山田太郎"
                />
              </div>
            </CardContent>
          </Card>

          {/* 連絡先情報 */}
          <Card>
            <CardHeader>
              <CardTitle>連絡先情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">住所</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="例: 東京都渋谷区渋谷1-1-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">電話番号</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="03-1234-5678"
                />
              </div>

              <div>
                <label className="text-sm font-medium">メールアドレス</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@company.co.jp"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Webサイト</label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.co.jp"
                />
              </div>
            </CardContent>
          </Card>

          {/* 企業規模 */}
          <Card>
            <CardHeader>
              <CardTitle>企業規模</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">従業員数</label>
                <Input
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">年間売上（円）</label>
                <Input
                  type="number"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                  placeholder="1000000000"
                />
              </div>
            </CardContent>
          </Card>

          {/* 詳細 */}
          <Card>
            <CardHeader>
              <CardTitle>詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">企業概要</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="企業の概要を入力してください"
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
