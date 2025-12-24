# 給与明細管理システム

Webブラウザで動作する、ログイン機能付きの給与明細書作成・管理ツールです。ユーザーごとにデータを保存し、複数のフォーマットで本格的な給与明細PDFを出力できます。

## 🌐 本番環境URL

**開発環境**: https://3000-ic5jc8y9sl0ffowi4vyyk-5634da27.sandbox.novita.ai

**Cloudflare Pages** (デプロイ後): https://payslip-manager.pages.dev

## ✨ 主要機能

### 1. ユーザー認証機能
- ✅ ユーザー登録（メールアドレス、パスワード）
- ✅ ログイン/ログアウト機能
- ✅ パスワードのセキュアな保存（SHA-256ハッシュ化）
- ✅ JWTベースのセッション管理

### 2. 給与明細データ管理
- ✅ 給与明細の作成・編集・削除（CRUD操作）
- ✅ ユーザーごとのデータ保存（Cloudflare D1データベース）
- ✅ 過去の給与明細履歴の一覧表示
- ✅ データのJSON形式エクスポート
- ✅ リアルタイムプレビュー機能
- ✅ 自動計算機能（支給額・控除額・差引支給額）

### 3. 給与明細フォーマット
- ✅ 6種類の異なるフォーマット
  - フォーマット1: 伝統的な縦型レイアウト
  - フォーマット2: モダンな横型レイアウト
  - フォーマット3-6: 各種バリエーション
- ✅ 明朝体フォント使用（Noto Serif JP）
- ✅ A4サイズ対応
- ✅ 印刷・PDF出力対応

### 4. 入力項目
#### 基本情報
- 発行年月（年・月）
- 氏名（必須）
- 会社名（任意）

#### 労働期間
- 開始日・終了日（年・月・日）

#### 勤怠情報
- 労働日数、労働時間、所定時間外労働

#### 支給項目
- 基本給（必須）
- 非課税通勤費
- 残業手当
- その他手当
- 支給額合計（自動計算）

#### 控除項目
- 所得税、住民税、健康保険、厚生年金、雇用保険
- その他控除
- 控除額合計（自動計算）

#### 最終金額
- 差引支給額（手取り額）: 自動計算

## 🛠 技術スタック

### フロントエンド
- HTML/CSS/JavaScript
- Tailwind CSS（スタイリング）
- Font Awesome（アイコン）
- Axios（HTTP通信）
- jsPDF（PDF生成）
- Google Fonts（明朝体: Noto Serif JP）

### バックエンド
- Node.js + TypeScript
- Hono Framework（軽量Webフレームワーク）
- Cloudflare Workers（エッジランタイム）

### データベース
- Cloudflare D1（SQLiteベース分散データベース）
- テーブル構成:
  - `users`: ユーザー情報
  - `sessions`: セッション管理（JWT）
  - `payslips`: 給与明細データ

### 認証・セキュリティ
- Web Crypto API（SHA-256ハッシュ化）
- JWT（JSON Web Token）
- CORS対応
- SQL injection対策

### ホスティング
- Cloudflare Pages
- PM2（プロセス管理 - 開発環境）

## 📋 データモデル

### ユーザーテーブル (users)
```sql
- id: INTEGER (PRIMARY KEY)
- email: TEXT (UNIQUE, NOT NULL)
- password_hash: TEXT (NOT NULL)
- name: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

### 給与明細テーブル (payslips)
```sql
- id: INTEGER (PRIMARY KEY)
- user_id: INTEGER (FOREIGN KEY)
- issue_year, issue_month: 発行年月
- employee_name: 氏名
- company_name, company_logo_url: 会社情報
- work_start_*, work_end_*: 労働期間
- working_days, working_hours, overtime_hours: 勤怠情報
- basic_salary, tax_free_commute, overtime_pay, other_allowance: 支給項目
- income_tax, resident_tax, health_insurance, pension_insurance, employment_insurance, other_deduction: 控除項目
- total_payment, total_deduction, net_payment: 金額合計
- format_id: フォーマット選択
- created_at, updated_at: タイムスタンプ
```

## 🚀 セットアップ手順

### 1. 必要なソフトウェア
- Node.js 18以上
- npm
- Wrangler CLI（Cloudflare用）

### 2. プロジェクトのクローン
```bash
git clone <repository-url>
cd webapp
```

### 3. 依存関係のインストール
```bash
npm install
```

### 4. ローカル開発環境の準備
```bash
# D1データベースのマイグレーション適用
npm run db:migrate:local

# テストデータの投入
npm run db:seed
```

### 5. ビルド
```bash
npm run build
```

### 6. ローカル開発サーバーの起動
```bash
# PM2を使用（推奨）
pm2 start ecosystem.config.cjs

# または直接実行
npm run dev:sandbox
```

### 7. ブラウザでアクセス
```
http://localhost:3000
```

### テストアカウント
- **メールアドレス**: test@example.com
- **パスワード**: password123

## 📦 主要コマンド

```bash
# ビルド
npm run build

# 開発サーバー起動
npm run dev:sandbox

# D1マイグレーション（ローカル）
npm run db:migrate:local

# D1マイグレーション（本番）
npm run db:migrate:prod

# シードデータ投入
npm run db:seed

# データベースリセット
npm run db:reset

# ポートクリーンアップ
npm run clean-port

# サービステスト
npm run test

# Cloudflareにデプロイ
npm run deploy:prod
```

## 🌍 Cloudflare Pagesへのデプロイ

### 1. Cloudflare D1データベースの作成
```bash
npx wrangler d1 create payslip-production
```

### 2. wrangler.jsoncの更新
作成されたdatabase_idを`wrangler.jsonc`に設定します。

### 3. 本番データベースのマイグレーション
```bash
npm run db:migrate:prod
```

### 4. Cloudflare Pagesプロジェクトの作成
```bash
npx wrangler pages project create payslip-manager \
  --production-branch main \
  --compatibility-date 2024-01-01
```

### 5. デプロイ
```bash
npm run deploy:prod
```

## 📱 使用方法

### 1. 新規ユーザー登録
- トップページの「新規登録はこちら」をクリック
- メールアドレスとパスワードを入力して登録

### 2. ログイン
- 登録したメールアドレスとパスワードでログイン

### 3. 給与明細の作成
- 「新規作成」ボタンをクリック
- 必要な情報を入力（氏名、基本給は必須）
- リアルタイムでプレビューが表示されます
- フォーマットを選択可能
- 「保存」ボタンでデータベースに保存

### 4. 給与明細の編集
- ダッシュボードで過去の給与明細をクリック
- 内容を編集して「保存」

### 5. PDF出力
- 編集画面で「PDF出力」ボタンをクリック
- 選択したフォーマットでPDFが生成されます

### 6. 給与明細の削除
- ダッシュボードでゴミ箱アイコンをクリック
- 確認ダイアログで削除を確定

## 🔒 セキュリティ対策

- ✅ パスワードのSHA-256ハッシュ化
- ✅ JWTによるトークンベース認証
- ✅ SQLインジェクション対策（プリペアドステートメント使用）
- ✅ CORS設定
- ✅ XSS対策（入力値のエスケープ）
- ✅ ユーザーごとのデータ分離

## 📊 プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx          # メインアプリケーション（Hono）
│   ├── auth.ts            # 認証ユーティリティ
│   └── renderer.tsx       # レンダラー
├── public/
│   └── static/
│       ├── app.js         # フロントエンドメインJS
│       ├── formats.js     # 給与明細フォーマット
│       └── ui.js          # UI制御
├── migrations/
│   └── 0001_initial_schema.sql  # データベーススキーマ
├── dist/                  # ビルド出力
├── .wrangler/             # ローカルD1データベース
├── ecosystem.config.cjs   # PM2設定
├── wrangler.jsonc         # Cloudflare設定
├── package.json           # 依存関係とスクリプト
└── seed.sql               # テストデータ
```

## 🎨 UI/UX特徴

- ✅ レスポンシブデザイン（PC・タブレット・スマートフォン対応）
- ✅ 直感的なナビゲーション
- ✅ リアルタイムプレビュー
- ✅ 自動計算（支給額・控除額・手取り額）
- ✅ フォームバリデーション
- ✅ 通知メッセージ（成功・エラー・情報）
- ✅ 印刷対応（フォーム非表示）

## 🐛 トラブルシューティング

### ポート3000が使用中の場合
```bash
npm run clean-port
# または
fuser -k 3000/tcp
```

### データベースをリセットしたい場合
```bash
npm run db:reset
```

### PM2サービスのログ確認
```bash
pm2 logs payslip-manager --nostream
```

### PM2サービスの再起動
```bash
pm2 restart payslip-manager
```

## 📈 今後の拡張予定

- [ ] 半期給与明細PDF（6ヶ月分一覧）の実装
- [ ] CSVインポート/エクスポート機能
- [ ] 給与明細のメール送信機能
- [ ] カスタムフォーマットエディタ
- [ ] 会社ロゴのアップロード機能
- [ ] 複数年度の統計・グラフ表示
- [ ] パスワードリセット機能
- [ ] プロフィール編集機能

## 📄 ライセンス

MIT License

## 👨‍💻 開発者

給与明細管理システム開発チーム

## 📞 お問い合わせ

バグ報告や機能要望は、GitHubのIssueでお願いします。

---

**最終更新日**: 2024年12月24日
**バージョン**: 1.0.0
**ステータス**: ✅ 開発完了・デプロイ準備完了
