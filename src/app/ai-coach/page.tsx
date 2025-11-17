"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dealsStore } from "@/lib/store/deals"
import { Bot, Phone, AlertCircle, CheckCircle, Clock, Sparkles } from "lucide-react"

interface CoachingSuggestion {
  dealId: string
  dealTitle: string
  company: string
  type: "missing_info" | "follow_up" | "next_action"
  priority: "high" | "medium" | "low"
  message: string
  questions: string[]
}

export default function AICoachPage() {
  const deals = dealsStore.getDeals()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // AIコーチングの提案を生成（実際にはAI APIを使用）
  const generateSuggestions = (): CoachingSuggestion[] => {
    const suggestions: CoachingSuggestion[] = []

    deals.forEach(deal => {
      // 情報不足チェック
      if (!deal.contactEmail || !deal.contactPhone) {
        suggestions.push({
          dealId: deal.id,
          dealTitle: deal.title,
          company: deal.company,
          type: "missing_info",
          priority: "high",
          message: "連絡先情報が不完全です",
          questions: [
            "担当者様のメールアドレスを教えていただけますか？",
            "お電話番号を共有いただけますでしょうか？",
          ]
        })
      }

      // フォローアップチェック
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceUpdate > 7 && deal.status !== "成約" && deal.status !== "失注") {
        suggestions.push({
          dealId: deal.id,
          dealTitle: deal.title,
          company: deal.company,
          type: "follow_up",
          priority: daysSinceUpdate > 14 ? "high" : "medium",
          message: `${daysSinceUpdate}日間更新がありません`,
          questions: [
            "前回のご提案についてのご意見はいかがでしょうか？",
            "何かご不明点やご懸念点はございますか？",
            "導入に向けて次のステップをご相談させていただけますか？",
          ]
        })
      }

      // 次のアクション提案
      if (deal.status === "提案" && !deal.notes) {
        suggestions.push({
          dealId: deal.id,
          dealTitle: deal.title,
          company: deal.company,
          type: "next_action",
          priority: "medium",
          message: "提案後のフィードバックを収集しましょう",
          questions: [
            "ご提案内容についてどう思われましたか？",
            "予算の調整は可能でしょうか？",
            "技術的な要件で追加で確認したい点はありますか？",
          ]
        })
      }
    })

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const [suggestions] = useState<CoachingSuggestion[]>(generateSuggestions())

  const handleCallCoach = (suggestion: CoachingSuggestion) => {
    alert(`AI営業コーチが ${suggestion.company} への電話を開始します...\n\n質問内容:\n${suggestion.questions.join('\n')}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "missing_info": return AlertCircle
      case "follow_up": return Clock
      case "next_action": return CheckCircle
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "missing_info": return "情報不足"
      case "follow_up": return "フォローアップ"
      case "next_action": return "次のアクション"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">AI営業コーチ</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            AIがあなたの営業活動をサポートし、必要な情報を顧客から収集します
          </p>
        </div>

        {/* 機能説明 */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI営業コーチとは？</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              AI営業コーチは、あなたの上司兼営業企画担当として機能します：
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside ml-2">
              <li>商談の情報不足を検出</li>
              <li>フォローアップのタイミングを提案</li>
              <li>顧客に電話して必要な情報を収集</li>
              <li>商談を前に進めるためのアドバイス</li>
            </ul>
          </CardContent>
        </Card>

        {/* 統計 */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">総提案数</CardDescription>
              <CardTitle className="text-xl">{suggestions.length}件</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">高優先度</CardDescription>
              <CardTitle className="text-xl text-destructive">
                {suggestions.filter(s => s.priority === "high").length}件
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">要フォロー</CardDescription>
              <CardTitle className="text-xl">
                {suggestions.filter(s => s.type === "follow_up").length}件
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 提案リスト */}
        <div className="space-y-3">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const TypeIcon = getTypeIcon(suggestion.type)!
              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base">{suggestion.dealTitle}</CardTitle>
                          <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                            {suggestion.priority === "high" ? "高" : suggestion.priority === "medium" ? "中" : "低"}
                          </Badge>
                        </div>
                        <CardDescription>{suggestion.company}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getTypeLabel(suggestion.type)}</Badge>
                      <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">AIが聞く質問:</p>
                      <ul className="text-sm space-y-1">
                        {suggestion.questions.map((q, qIndex) => (
                          <li key={qIndex} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span className="flex-1">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleCallCoach(suggestion)}
                      variant={suggestion.priority === "high" ? "default" : "outline"}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      AIコーチに電話を依頼
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">素晴らしい！</p>
                <p className="text-sm text-muted-foreground">
                  現在、AIコーチからの提案はありません。<br />
                  すべての商談が順調に進んでいます。
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 設定 */}
        <Card>
          <CardHeader>
            <CardTitle>AI コーチ設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">自動フォローアップ</p>
                <p className="text-xs text-muted-foreground">7日間更新のない商談を自動検出</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                有効
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">情報不足アラート</p>
                <p className="text-xs text-muted-foreground">必須情報の不足を通知</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                有効
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">AIの積極性</p>
                <p className="text-xs text-muted-foreground">提案の頻度を調整</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                標準
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
