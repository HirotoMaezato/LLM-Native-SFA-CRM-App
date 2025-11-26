"use client"

import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { contactsStore } from "@/lib/store/contacts"
import { accountsStore } from "@/lib/store/accounts"
import { ArrowLeft, Trash2, User, Mail, Phone, Smartphone, Building2, Briefcase } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const contact = contactsStore.getContactById(id)
  const account = contact ? accountsStore.getAccountById(contact.accountId) : undefined

  if (!contact) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">取引先責任者が見つかりませんでした</p>
          <Link href="/contacts">
            <Button variant="outline">取引先責任者一覧に戻る</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm("この取引先責任者を削除してもよろしいですか？")) {
      contactsStore.deleteContact(id)
      router.push("/contacts")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/contacts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* 名前と役職 */}
        <Card>
          <CardHeader>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">
                  {contact.lastName} {contact.firstName}
                </CardTitle>
                {contact.isPrimaryContact && (
                  <Badge variant="default">主担当者</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.title && <Badge variant="outline" className="text-sm">{contact.title}</Badge>}
                {contact.department && <Badge variant="secondary" className="text-sm">{contact.department}</Badge>}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 所属取引先 */}
        {account && (
          <Link href={`/accounts/${account.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">所属取引先</p>
                    <p className="font-medium">{account.name}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        )}

        {/* 連絡先情報 */}
        <Card>
          <CardHeader>
            <CardTitle>連絡先情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">メール</p>
                <a href={`mailto:${contact.email}`} className="font-medium text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">電話番号</p>
                  <a href={`tel:${contact.phone}`} className="font-medium text-primary hover:underline">
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
            {contact.mobilePhone && (
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">携帯電話</p>
                  <a href={`tel:${contact.mobilePhone}`} className="font-medium text-primary hover:underline">
                    {contact.mobilePhone}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 役職情報 */}
        {(contact.title || contact.department) && (
          <Card>
            <CardHeader>
              <CardTitle>役職情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.title && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">役職</p>
                    <p className="font-medium">{contact.title}</p>
                  </div>
                </div>
              )}
              {contact.department && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">部門</p>
                    <p className="font-medium">{contact.department}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* メモ */}
        {contact.notes && (
          <Card>
            <CardHeader>
              <CardTitle>メモ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{contact.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* タイムスタンプ */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p>作成日時</p>
                <p className="font-medium text-foreground">
                  {new Date(contact.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
              <div>
                <p>更新日時</p>
                <p className="font-medium text-foreground">
                  {new Date(contact.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
