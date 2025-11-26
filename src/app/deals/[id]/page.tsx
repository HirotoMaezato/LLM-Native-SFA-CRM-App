"use client"

import { use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dealsStore } from "@/lib/store/deals"
import { ArrowLeft, Edit, Trash2, Building2, User, Mail, Phone, Calendar, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const deal = dealsStore.getDealById(id)

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">商談が見つかりませんでした</p>
          <Link href="/deals">
            <Button variant="outline">商談一覧に戻る</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm("この商談を削除してもよろしいですか？")) {
      dealsStore.deleteDeal(id)
      router.push("/deals")
    }
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
          <div className="flex gap-2">
            <Link href={`/deals/${id}/edit`}>
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
                <CardTitle className="text-2xl">{deal.title}</CardTitle>
                <Badge
                  variant={deal.priority === "高" ? "destructive" : deal.priority === "中" ? "default" : "secondary"}
                >
                  {deal.priority}優先度
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">{deal.status}</Badge>
                {deal.tags.map(tag => (
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

        {/* 金額と確度 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                商談金額
              </CardDescription>
              <CardTitle className="text-2xl">
                ¥{(deal.amount / 10000).toFixed(0)}万
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                成約確度
              </CardDescription>
              <CardTitle className="text-2xl">{deal.probability}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 顧客情報 */}
        <Card>
          <CardHeader>
            <CardTitle>顧客情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">会社名</p>
                <p className="font-medium">{deal.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">担当者</p>
                <p className="font-medium">{deal.contactPerson}</p>
              </div>
            </div>
            {deal.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">メール</p>
                  <a href={`mailto:${deal.contactEmail}`} className="font-medium text-primary hover:underline">
                    {deal.contactEmail}
                  </a>
                </div>
              </div>
            )}
            {deal.contactPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">電話番号</p>
                  <a href={`tel:${deal.contactPhone}`} className="font-medium text-primary hover:underline">
                    {deal.contactPhone}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 商談情報 */}
        <Card>
          <CardHeader>
            <CardTitle>商談情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">クロージング予定日</p>
                <p className="font-medium">
                  {new Date(deal.expectedCloseDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {deal.area && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">エリア</p>
                  <p className="font-medium">{deal.area}</p>
                </div>
                {deal.product && (
                  <div>
                    <p className="text-sm text-muted-foreground">商材</p>
                    <p className="font-medium">{deal.product}</p>
                  </div>
                )}
              </div>
            )}
            {deal.team && (
              <div>
                <p className="text-sm text-muted-foreground">担当チーム</p>
                <p className="font-medium">{deal.team}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 説明・メモ */}
        {(deal.description || deal.notes) && (
          <Card>
            <CardHeader>
              <CardTitle>詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">商談概要</p>
                  <p className="text-sm">{deal.description}</p>
                </div>
              )}
              {deal.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">メモ</p>
                  <p className="text-sm">{deal.notes}</p>
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
                  {new Date(deal.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
              <div>
                <p>更新日時</p>
                <p className="font-medium text-foreground">
                  {new Date(deal.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
