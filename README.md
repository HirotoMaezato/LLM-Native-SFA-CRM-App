# LLM Native SFA CRM App

生成AIネイティブな営業支援（SFA）アプリケーション

## 概要

このアプリケーションは、モダンなフロントエンド技術とAI機能を組み合わせた、モバイルファーストのSFA/CRMシステムです。

## 主な機能

### 📱 モバイルファースト設計
- レスポンシブデザイン
- 下部メニューバーによる直感的なナビゲーション
- モバイルデバイスでの最適な操作性

### 💼 商談管理
- 商談の作成、編集、削除
- 詳細な商談情報の管理
- ステータス、優先度、確度の追跡
- 顧客情報の一元管理

### 🔍 フィルタ/ソート機能
- 複数項目の同時フィルタリング
- カスタムフィルタの作成と保存
- 柔軟なソート機能
- 保存済みフィルタの再利用

### 🏷️ タグ機能
- カラーコード付きタグ
- 商談へのタグ付け
- タグによる分類と検索

### 📊 レポート/グラフ機能
- エリア別商談金額
- 商材別商談金額
- 期間別商談金額
- チーム別商談金額
- ステータス別商談数
- インタラクティブなグラフ表示

### 🤖 AI営業コーチ
- 商談の情報不足を自動検出
- フォローアップのタイミング提案
- 顧客への電話催促機能
- 営業活動の進捗サポート

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **バックエンド**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Shadcn UI
- **グラフ**: Recharts
- **アイコン**: Lucide React
- **デプロイ**: Vercel (推奨)

## セットアップ

### 前提条件
- Node.js 18以上
- Supabaseアカウント（無料で作成可能）

### インストール

```bash
# 依存関係のインストール
npm install
```

### Supabaseバックエンドのセットアップ

詳細な手順は [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) を参照してください。

**簡単な手順:**

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/migrations/` 内のSQLファイルをSupabase SQL Editorで実行
3. `.env.local` ファイルを作成して、SupabaseのURLとAPIキーを設定

```bash
cp .env.local.example .env.local
# .env.local を編集してSupabaseの認証情報を設定
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて確認してください。

### ビルドと本番起動

```bash
# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## プロジェクト構造

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # ダッシュボード
│   ├── deals/               # 商談管理
│   ├── accounts/            # 取引先管理
│   ├── contacts/            # 取引先責任者管理
│   ├── reports/             # レポート
│   ├── ai-coach/page.tsx    # AI営業コーチ
│   └── settings/page.tsx    # 設定
├── components/
│   ├── layout/              # レイアウトコンポーネント
│   └── ui/                  # UIコンポーネント
├── lib/
│   ├── actions/             # Server Actions (データ操作)
│   ├── supabase/            # Supabase クライアント設定
│   └── store/               # クライアント側データストア
├── types/                   # TypeScript型定義
│   ├── deal.ts
│   ├── account.ts
│   └── contact.ts
└── supabase/
    └── migrations/          # データベースマイグレーション
```

## ライセンス

MIT