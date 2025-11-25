"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { contactsStore } from "@/lib/store/contacts"
import { accountsStore } from "@/lib/store/accounts"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

function NewContactForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedAccountId = searchParams.get('accountId')

  const allAccounts = accountsStore.getAccounts()

  const [formData, setFormData] = useState({
    accountId: preselectedAccountId || "",
    firstName: "",
    lastName: "",
    title: "",
    department: "",
    email: "",
    phone: "",
    mobilePhone: "",
    isPrimaryContact: false,
    notes: "",
  })

  // URLパラメータから取引先IDが変わった場合に更新
  useEffect(() => {
    if (preselectedAccountId) {
      setFormData(prev => ({ ...prev, accountId: preselectedAccountId }))
    }
  }, [preselectedAccountId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.accountId || !formData.firstName || !formData.lastName || !formData.email) {
      alert("必須項目を入力してください")
      return
    }

    const account = accountsStore.getAccountById(formData.accountId)

    contactsStore.addContact({
      accountId: formData.accountId,
      accountName: account?.name,
      firstName: formData.firstName,
      lastName: formData.lastName,
      title: formData.title || undefined,
      department: formData.department || undefined,
      email: formData.email,
      phone: formData.phone || undefined,
      mobilePhone: formData.mobilePhone || undefined,
      isPrimaryContact: formData.isPrimaryContact,
      notes: formData.notes || undefined,
    })

    // 取引先詳細から来た場合はそこに戻る
    if (preselectedAccountId) {
      router.push(`/accounts/${preselectedAccountId}`)
    } else {
      router.push("/contacts")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-4">
          <Link href={preselectedAccountId ? `/accounts/${preselectedAccountId}` : "/contacts"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <Button type="submit" form="contact-form">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>

        <h1 className="text-2xl font-bold">新規取引先責任者登録</h1>

        <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  所属取引先 <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">選択してください</option>
                  {allAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    姓 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="例: 山田"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    名 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="例: 太郎"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimaryContact"
                  checked={formData.isPrimaryContact}
                  onChange={(e) => setFormData({ ...formData, isPrimaryContact: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isPrimaryContact" className="text-sm font-medium">
                  主担当者
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 役職情報 */}
          <Card>
            <CardHeader>
              <CardTitle>役職情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">役職</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 営業部長"
                />
              </div>

              <div>
                <label className="text-sm font-medium">部門</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="例: 営業部"
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
                <label className="text-sm font-medium">
                  メールアドレス <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@company.co.jp"
                  required
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
                <label className="text-sm font-medium">携帯電話</label>
                <Input
                  type="tel"
                  value={formData.mobilePhone}
                  onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                  placeholder="090-1234-5678"
                />
              </div>
            </CardContent>
          </Card>

          {/* メモ */}
          <Card>
            <CardHeader>
              <CardTitle>メモ</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="メモや特記事項を入力してください"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default function NewContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">読み込み中...</div>}>
      <NewContactForm />
    </Suspense>
  )
}
