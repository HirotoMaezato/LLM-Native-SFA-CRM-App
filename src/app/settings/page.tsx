"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, Palette, Database, Info, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="pt-4">
          <h1 className="text-2xl font-bold">設定</h1>
          <p className="text-sm text-muted-foreground">
            アプリケーションの設定とカスタマイズ
          </p>
        </div>

        {/* ユーザー情報 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>ユーザー情報</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">営業太郎</p>
                <p className="text-sm text-muted-foreground">sales@company.co.jp</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                編集
              </Button>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">所属チーム</p>
              <Badge variant="secondary" className="mt-1">第一営業部</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>通知設定</CardTitle>
            </div>
            <CardDescription>
              重要なイベントの通知を管理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">商談更新通知</p>
                <p className="text-xs text-muted-foreground">商談が更新されたときに通知</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                有効
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">トリガー通知</p>
                <p className="text-xs text-muted-foreground">トリガー条件が満たされたときに通知</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                有効
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">AIコーチ通知</p>
                <p className="text-xs text-muted-foreground">AIからの提案を通知</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                有効
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 表示設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>表示設定</CardTitle>
            </div>
            <CardDescription>
              アプリの外観をカスタマイズ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">テーマ</p>
                <p className="text-xs text-muted-foreground">ライト/ダークモード</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                ライト
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">カラースキーム</p>
                <p className="text-xs text-muted-foreground">アクセントカラーを選択</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                ブルー
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* データ管理 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>データ管理</CardTitle>
            </div>
            <CardDescription>
              データのエクスポートとバックアップ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              <Database className="h-4 w-4 mr-2" />
              データをエクスポート
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Database className="h-4 w-4 mr-2" />
              バックアップを作成
            </Button>
          </CardContent>
        </Card>

        {/* セキュリティ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>セキュリティ</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              <Shield className="h-4 w-4 mr-2" />
              パスワードを変更
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Shield className="h-4 w-4 mr-2" />
              2段階認証を設定
            </Button>
          </CardContent>
        </Card>

        {/* アプリ情報 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <CardTitle>アプリ情報</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>バージョン</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>ビルド</span>
              <span className="font-medium text-foreground">2025.11.17</span>
            </div>
            <div className="pt-2">
              <p className="text-xs">
                LLM Native SFA CRM App - 生成AIネイティブな営業支援システム
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ヘルプ */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>ヘルプとサポート</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" disabled>
              使い方ガイド
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              お問い合わせ
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              利用規約
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
