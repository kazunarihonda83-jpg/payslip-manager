import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { hashPassword, verifyPassword, createToken, verifyToken } from './auth'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors())

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './public' }))

// 認証ミドルウェア
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = verifyToken(token)
    c.set('userId', decoded.userId)
    await next()
  } catch (error) {
    return c.json({ error: '無効なトークンです' }, 401)
  }
}

// === 認証API ===

// ユーザー登録
app.post('/api/auth/register', async (c) => {
  const { email, password, name } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: 'メールアドレスとパスワードは必須です' }, 400)
  }
  
  try {
    // メールアドレスの重複チェック
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (existingUser) {
      return c.json({ error: 'このメールアドレスは既に登録されています' }, 400)
    }
    
    // パスワードのハッシュ化
    const passwordHash = await hashPassword(password)
    
    // ユーザー作成
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).bind(email, passwordHash, name || null).run()
    
    const userId = result.meta.last_row_id
    
    // JWTトークン生成
    const token = createToken({ userId })
    
    return c.json({ 
      success: true, 
      token, 
      user: { id: userId, email, name } 
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'ユーザー登録に失敗しました' }, 500)
  }
})

// ログイン
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: 'メールアドレスとパスワードは必須です' }, 400)
  }
  
  try {
    // ユーザー取得
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?'
    ).bind(email).first() as any
    
    if (!user) {
      return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 401)
    }
    
    // パスワード検証
    const isValid = await verifyPassword(password, user.password_hash)
    
    if (!isValid) {
      return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 401)
    }
    
    // JWTトークン生成
    const token = createToken({ userId: user.id })
    
    return c.json({ 
      success: true, 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'ログインに失敗しました' }, 500)
  }
})

// ユーザー情報取得
app.get('/api/auth/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  try {
    const user = await c.env.DB.prepare(
      'SELECT id, email, name FROM users WHERE id = ?'
    ).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404)
    }
    
    return c.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'ユーザー情報の取得に失敗しました' }, 500)
  }
})

// === 給与明細API ===

// 給与明細一覧取得
app.get('/api/payslips', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM payslips WHERE user_id = ? ORDER BY issue_year DESC, issue_month DESC'
    ).bind(userId).all()
    
    return c.json({ payslips: results })
  } catch (error) {
    console.error('Get payslips error:', error)
    return c.json({ error: '給与明細の取得に失敗しました' }, 500)
  }
})

// 給与明細詳細取得
app.get('/api/payslips/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const payslipId = c.req.param('id')
  
  try {
    const payslip = await c.env.DB.prepare(
      'SELECT * FROM payslips WHERE id = ? AND user_id = ?'
    ).bind(payslipId, userId).first()
    
    if (!payslip) {
      return c.json({ error: '給与明細が見つかりません' }, 404)
    }
    
    return c.json({ payslip })
  } catch (error) {
    console.error('Get payslip error:', error)
    return c.json({ error: '給与明細の取得に失敗しました' }, 500)
  }
})

// 給与明細作成
app.post('/api/payslips', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const data = await c.req.json()
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO payslips (
        user_id, issue_year, issue_month, employee_name,
        company_name, company_logo_url,
        work_start_year, work_start_month, work_start_day,
        work_end_year, work_end_month, work_end_day,
        working_days, working_hours, overtime_hours,
        basic_salary, tax_free_commute, overtime_pay, other_allowance, total_payment,
        income_tax, resident_tax, health_insurance, pension_insurance, employment_insurance, other_deduction, total_deduction,
        net_payment, format_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      data.issue_year, data.issue_month, data.employee_name,
      data.company_name || null, data.company_logo_url || null,
      data.work_start_year, data.work_start_month, data.work_start_day,
      data.work_end_year, data.work_end_month, data.work_end_day,
      data.working_days, data.working_hours, data.overtime_hours || 0,
      data.basic_salary, data.tax_free_commute || 0, data.overtime_pay || 0, data.other_allowance || 0, data.total_payment,
      data.income_tax || 0, data.resident_tax || 0, data.health_insurance || 0, data.pension_insurance || 0, data.employment_insurance || 0, data.other_deduction || 0, data.total_deduction,
      data.net_payment, data.format_id || 1
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Create payslip error:', error)
    return c.json({ error: '給与明細の作成に失敗しました' }, 500)
  }
})

// 給与明細更新
app.put('/api/payslips/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const payslipId = c.req.param('id')
  const data = await c.req.json()
  
  try {
    // 所有権確認
    const existing = await c.env.DB.prepare(
      'SELECT id FROM payslips WHERE id = ? AND user_id = ?'
    ).bind(payslipId, userId).first()
    
    if (!existing) {
      return c.json({ error: '給与明細が見つかりません' }, 404)
    }
    
    await c.env.DB.prepare(`
      UPDATE payslips SET
        issue_year = ?, issue_month = ?, employee_name = ?,
        company_name = ?, company_logo_url = ?,
        work_start_year = ?, work_start_month = ?, work_start_day = ?,
        work_end_year = ?, work_end_month = ?, work_end_day = ?,
        working_days = ?, working_hours = ?, overtime_hours = ?,
        basic_salary = ?, tax_free_commute = ?, overtime_pay = ?, other_allowance = ?, total_payment = ?,
        income_tax = ?, resident_tax = ?, health_insurance = ?, pension_insurance = ?, employment_insurance = ?, other_deduction = ?, total_deduction = ?,
        net_payment = ?, format_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      data.issue_year, data.issue_month, data.employee_name,
      data.company_name || null, data.company_logo_url || null,
      data.work_start_year, data.work_start_month, data.work_start_day,
      data.work_end_year, data.work_end_month, data.work_end_day,
      data.working_days, data.working_hours, data.overtime_hours || 0,
      data.basic_salary, data.tax_free_commute || 0, data.overtime_pay || 0, data.other_allowance || 0, data.total_payment,
      data.income_tax || 0, data.resident_tax || 0, data.health_insurance || 0, data.pension_insurance || 0, data.employment_insurance || 0, data.other_deduction || 0, data.total_deduction,
      data.net_payment, data.format_id || 1,
      payslipId, userId
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Update payslip error:', error)
    return c.json({ error: '給与明細の更新に失敗しました' }, 500)
  }
})

// 給与明細削除
app.delete('/api/payslips/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const payslipId = c.req.param('id')
  
  try {
    const result = await c.env.DB.prepare(
      'DELETE FROM payslips WHERE id = ? AND user_id = ?'
    ).bind(payslipId, userId).run()
    
    if (result.meta.changes === 0) {
      return c.json({ error: '給与明細が見つかりません' }, 404)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete payslip error:', error)
    return c.json({ error: '給与明細の削除に失敗しました' }, 500)
  }
})

// 半期データ取得（6ヶ月分）
app.get('/api/payslips/period/:year/:month', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const year = parseInt(c.req.param('year'))
  const month = parseInt(c.req.param('month'))
  
  // 6ヶ月前の年月を計算
  let startYear = year
  let startMonth = month - 5
  if (startMonth <= 0) {
    startMonth += 12
    startYear -= 1
  }
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM payslips 
      WHERE user_id = ? 
      AND (
        (issue_year = ? AND issue_month >= ?) OR
        (issue_year = ? AND issue_month <= ?) OR
        (issue_year > ? AND issue_year < ?)
      )
      ORDER BY issue_year ASC, issue_month ASC
    `).bind(userId, startYear, startMonth, year, month, startYear, year).all()
    
    return c.json({ payslips: results })
  } catch (error) {
    console.error('Get period payslips error:', error)
    return c.json({ error: '期間データの取得に失敗しました' }, 500)
  }
})

// データエクスポート
app.get('/api/payslips/export/json', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM payslips WHERE user_id = ? ORDER BY issue_year DESC, issue_month DESC'
    ).bind(userId).all()
    
    return c.json({ payslips: results })
  } catch (error) {
    console.error('Export error:', error)
    return c.json({ error: 'データのエクスポートに失敗しました' }, 500)
  }
})

// フロントエンドのメインページ
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>給与明細管理システム</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .mincho { font-family: 'Noto Serif JP', serif; }
        .print-only { display: none; }
        @media print {
            .no-print { display: none !important; }
            .print-only { display: block; }
            body { background: white; }
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div id="app">
        <!-- コンテンツはJavaScriptで動的に生成 -->
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-600">読み込み中...</p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="/static/app.js"></script>
    <script src="/static/formats.js"></script>
    <script src="/static/ui.js"></script>
</body>
</html>
  `)
})

export default app
