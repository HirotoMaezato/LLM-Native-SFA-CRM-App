# Supabase バックエンド セットアップガイド

このガイドでは、LLM Native SFA CRM AppのSupabaseバックエンドをセットアップする手順を説明します。

## 📋 前提条件

- Node.js 18以上がインストールされていること
- Supabaseアカウント（無料で作成可能）

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてサインアップ/ログイン
2. "New Project"をクリック
3. 以下を設定:
   - **Organization**: 既存のものを選択、または新規作成
   - **Project Name**: `llm-native-crm`（任意の名前でOK）
   - **Database Password**: 強力なパスワードを設定（必ずメモしてください）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
   - **Pricing Plan**: Free tier でOK
4. "Create new project"をクリック

プロジェクトの作成には1-2分かかります。

### 2. データベースマイグレーションの実行

プロジェクトが作成されたら、データベーススキーマをセットアップします。

1. Supabaseダッシュボードで左メニューから **SQL Editor** をクリック
2. "New query"をクリック
3. 以下の順番でマイグレーションファイルの内容をコピー&ペーストして実行:

#### Step 1: 基本スキーマの作成

`supabase/migrations/20250101000000_initial_schema.sql` の内容を全てコピーして、SQL Editorに貼り付け、"Run"をクリック

#### Step 2: RLSポリシーの設定

`supabase/migrations/20250101000001_rls_policies.sql` の内容を全てコピーして、SQL Editorに貼り付け、"Run"をクリック

#### Step 3: サンプルデータの挿入

`supabase/migrations/20250101000002_seed_data.sql` の内容を全てコピーして、SQL Editorに貼り付け、"Run"をクリック

### 3. API認証情報の取得

1. Supabaseダッシュボードで左メニューから **Settings** (歯車アイコン) をクリック
2. **API** セクションをクリック
3. 以下の値をコピー:
   - **Project URL** (例: `https://xxxxx.supabase.co`)
   - **anon public** key (長い文字列)

### 4. 環境変数の設定

1. プロジェクトのルートディレクトリで `.env.local` ファイルを作成:

```bash
cp .env.local.example .env.local
```

2. `.env.local` を開いて、Step 3でコピーした値を設定:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. アプリケーションの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて確認してください。

## ✅ 動作確認

以下を確認してください:

1. **商談一覧ページ** (`/deals`) でサンプルデータが表示される
2. **新規商談の作成** が正常に動作する
3. **商談の編集・削除** が正常に動作する

## 📊 データベース構造

以下のテーブルが作成されています:

- `tags` - タグマスタ
- `accounts` - 取引先
- `account_tags` - 取引先とタグの中間テーブル
- `contacts` - 取引先責任者
- `deals` - 商談
- `deal_tags` - 商談とタグの中間テーブル
- `filter_conditions` - 保存済みフィルタ
- `custom_reports` - カスタムレポート

## 🔍 データの確認

Supabaseダッシュボードの **Table Editor** から各テーブルのデータを確認・編集できます。

## 🔐 セキュリティについて

現在の設定では、すべてのテーブルに対して全アクセス許可のRLSポリシーが設定されています。

本番環境では、以下のような改善を検討してください:

1. **認証の追加**: Supabase Authを使用してユーザー認証を実装
2. **RLSポリシーの厳格化**: ユーザーごとのアクセス制御を実装
3. **APIキーの保護**: サーバーサイドでのみ使用する機密データには`service_role`キーを使用

## 🆘 トラブルシューティング

### エラー: "Invalid API key"

- `.env.local` の設定が正しいか確認
- 開発サーバーを再起動（`Ctrl+C` で停止して `npm run dev` で再起動）

### エラー: "relation does not exist"

- マイグレーションが正しく実行されているか確認
- Supabase SQL Editorで `\dt` を実行してテーブル一覧を確認

### データが表示されない

- ブラウザの開発者ツール（F12）でネットワークタブとコンソールを確認
- Supabase Table Editorでデータが存在するか確認

## 📚 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
