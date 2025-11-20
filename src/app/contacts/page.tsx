"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { contactsStore } from "@/lib/store/contacts"
import { ContactFilterCondition } from "@/types/contact"
import { Search, Plus, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<ContactFilterCondition | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const allContacts = contactsStore.getContacts()
  const savedFilters = contactsStore.getFilterConditions()

  // フィルタリング・検索処理
  let filteredContacts = selectedFilter
    ? contactsStore.filterContacts(selectedFilter)
    : allContacts

  if (searchQuery) {
    filteredContacts = filteredContacts.filter(contact =>
      `${contact.lastName} ${contact.firstName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.accountName && contact.accountName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.department && contact.department.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold">取引先責任者一覧</h1>
            <p className="text-sm text-muted-foreground">
              {filteredContacts.length}件の担当者
            </p>
          </div>
          <Link href="/contacts/new">
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
            placeholder="名前、会社名、メール、部門で検索..."
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

        {/* 担当者リスト */}
        <div className="space-y-3 pb-4">
          {filteredContacts.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="space-y-3">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">
                          {contact.lastName} {contact.firstName}
                        </h3>
                        {contact.isPrimaryContact && (
                          <Badge variant="default" className="text-xs">
                            主担当
                          </Badge>
                        )}
                      </div>
                      {contact.accountName && (
                        <p className="text-sm text-muted-foreground">{contact.accountName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {contact.title && (
                        <p className="text-sm font-medium">{contact.title}</p>
                      )}
                      {contact.department && (
                        <p className="text-xs text-muted-foreground">{contact.department}</p>
                      )}
                    </div>
                  </div>

                  {/* 連絡先情報 */}
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span>{contact.email}</span>
                    {contact.phone && <span>TEL: {contact.phone}</span>}
                    {contact.mobilePhone && <span>携帯: {contact.mobilePhone}</span>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {filteredContacts.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">取引先責任者が見つかりませんでした</p>
              <Link href="/contacts/new">
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  新規担当者を作成
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
