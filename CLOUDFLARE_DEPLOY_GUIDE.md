# Cloudflare Pages デプロイガイド

## 方法1: GitHub連携（推奨・最も簡単）

### ステップ1: Cloudflare Dashboardでプロジェクト作成

1. https://dash.cloudflare.com/ にログイン
2. 左メニュー「Workers & Pages」をクリック
3. 「Create application」→「Pages」→「Connect to Git」
4. GitHubアカウントを連携
5. `kazunarihonda83-jpg/payslip-manager` を選択

### ステップ2: ビルド設定

```
Project name: payslip-manager
Production branch: main
Framework preset: None (または Vite)
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)

Environment variables:
NODE_VERSION = 18
```

「Save and Deploy」をクリック

### ステップ3: D1データベースの作成と接続

デプロイ後、以下の手順でD1データベースを設定：

1. Cloudflare Dashboard > Workers & Pages > payslip-manager
2. 「Settings」タブ > 「Functions」セクション
3. 「D1 database bindings」で「Add binding」をクリック

または、Wrangler CLIで：

```bash
# D1データベース作成
npx wrangler d1 create payslip-production

# 出力されたdatabase_idをメモ

# マイグレーション実行
npx wrangler d1 migrations apply payslip-production --remote

# Pagesプロジェクトにバインド
npx wrangler pages deployment create payslip-manager \
  --d1=DB:payslip-production
```

### ステップ4: 環境変数の追加（必要に応じて）

Settings > Environment variables で以下を追加：

```
JWT_SECRET = your-secret-key-change-this-in-production
NODE_ENV = production
```

### ステップ5: 再デプロイ

Settings > Builds & deployments > 「Retry deployment」

---

## 方法2: Wrangler CLI（手動デプロイ）

### 前提条件

Cloudflare APIキーが必要です。Deploy タブで設定してください。

### コマンド

```bash
cd /home/user/webapp

# 1. D1データベース作成
npx wrangler d1 create payslip-production

# 2. wrangler.jsoncを更新
# database_idを上記で取得したIDに置き換える

# 3. マイグレーション実行
npx wrangler d1 migrations apply payslip-production --remote

# 4. ビルド
npm run build

# 5. デプロイ
npx wrangler pages deploy dist --project-name payslip-manager
```

---

## デプロイ後の確認

デプロイ完了後、以下のURLでアクセス可能になります：

- Production: https://payslip-manager.pages.dev
- または: https://payslip-manager-xxx.pages.dev

### 動作確認

1. ブラウザでURLにアクセス
2. 新規ユーザー登録
3. 給与明細を作成
4. PDF出力をテスト

### トラブルシューティング

**問題**: データベースエラーが発生
**解決**: D1 bindingが正しく設定されているか確認

```bash
npx wrangler pages deployment list --project-name payslip-manager
```

**問題**: ビルドエラー
**解決**: Node.jsバージョンを確認（18以上必要）

```
Environment variables > NODE_VERSION = 18
```

---

## 自動デプロイの設定

GitHub連携を使用している場合：

1. mainブランチにpushすると自動デプロイ
2. プルリクエストごとにプレビュー環境が自動作成
3. デプロイ履歴はDashboardで確認可能

---

## カスタムドメインの設定

1. Cloudflare Dashboard > payslip-manager
2. 「Custom domains」タブ
3. 「Set up a custom domain」
4. ドメイン名を入力して設定

---

## まとめ

✅ GitHub連携が最も簡単で、自動デプロイも可能
✅ D1データベースの設定を忘れずに
✅ デプロイ後は必ず動作確認

デプロイURL: https://payslip-manager.pages.dev
