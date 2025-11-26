"use client"

import { use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { accountsStore } from "@/lib/store/accounts"
import { contactsStore } from "@/lib/store/contacts"
import { formatRevenue } from "@/lib/utils/formatters"
import { ArrowLeft, Edit, Trash2, Building2, User, Mail, Phone, Globe, MapPin, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const account = accountsStore.getAccountById(id)
  const contacts = contactsStore.getContactsByAccountId(id)

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">取引先が見つかりませんでした</p>
          <Link href="/accounts">
            <Button variant="outline">取引先一覧に戻る</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm("この取引先を削除してもよろしいですか？")) {
      accountsStore.deleteAccount(id)
      router.push("/accounts")
    }
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
          <div className="flex gap-2">
            <Link href={`/accounts/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                編集
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* タイトルとステータス */}
        <Card>
          <CardHeader>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{account.name}</CardTitle>
                <Badge
                  variant={account.status === "活動中" ? "default" : account.status === "休止" ? "secondary" : "outline"}
                >
                  {account.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {account.industry && <Badge variant="outline" className="text-sm">{account.industry}</Badge>}
                {account.tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 売上と従業員数 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                年間売上
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatRevenue(account.annualRevenue)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                従業員数
              </CardDescription>
              <CardTitle className="text-2xl">
                {account.employeeCount ? `${account.employeeCount.toLocaleString()}名` : "-"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 企業情報 */}
        <Card>
          <CardHeader>
            <CardTitle>企業情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {account.representative && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">代表者</p>
                  <p className="font-medium">{account.representative}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">地域</p>
                <p className="font-medium">{account.region}</p>
              </div>
            </div>
            {account.address && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">住所</p>
                  <p className="font-medium">{account.address}</p>
                </div>
              </div>
            )}
            {account.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">電話番号</p>
                  <a href={`tel:${account.phone}`} className="font-medium text-primary hover:underline">
                    {account.phone}
                  </a>
                </div>
              </div>
            )}
            {account.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">メール</p>
                  <a href={`mailto:${account.email}`} className="font-medium text-primary hover:underline">
                    {account.email}
                  </a>
                </div>
              </div>
            )}
            {account.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Webサイト</p>
                  <a href={account.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {account.website}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 取引先責任者 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>取引先責任者</CardTitle>
              <Link href={`/contacts/new?accountId=${id}`}>
                <Button variant="outline" size="sm">
                  追加
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map(contact => (
                  <Link key={contact.id} href={`/contacts/${contact.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {contact.lastName} {contact.firstName}
                            {contact.isPrimaryContact && (
                              <Badge variant="secondary" className="ml-2 text-xs">主担当</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contact.title && `${contact.title}`}
                            {contact.title && contact.department && " / "}
                            {contact.department && `${contact.department}`}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{contact.email}</p>
                          {contact.phone && <p>{contact.phone}</p>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                取引先責任者が登録されていません
              </p>
            )}
          </CardContent>
        </Card>

        {/* 説明・メモ */}
        {(account.description || account.notes) && (
          <Card>
            <CardHeader>
              <CardTitle>詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {account.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">企業概要</p>
                  <p className="text-sm">{account.description}</p>
                </div>
              )}
              {account.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">メモ</p>
                  <p className="text-sm">{account.notes}</p>
                </div>
              )}
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
                  {new Date(account.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
              <div>
                <p>更新日時</p>
                <p className="font-medium text-foreground">
                  {new Date(account.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
