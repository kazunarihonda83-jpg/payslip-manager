-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payslips table
CREATE TABLE IF NOT EXISTS payslips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- 発行年月
  issue_year INTEGER NOT NULL,
  issue_month INTEGER NOT NULL,
  
  -- 氏名
  employee_name TEXT NOT NULL,
  
  -- 会社情報
  company_name TEXT,
  company_logo_url TEXT,
  
  -- 労働期間
  work_start_year INTEGER NOT NULL,
  work_start_month INTEGER NOT NULL,
  work_start_day INTEGER NOT NULL,
  work_end_year INTEGER NOT NULL,
  work_end_month INTEGER NOT NULL,
  work_end_day INTEGER NOT NULL,
  
  -- 勤怠情報
  working_days REAL NOT NULL,
  working_hours REAL NOT NULL,
  overtime_hours REAL NOT NULL DEFAULT 0,
  
  -- 支給項目
  basic_salary INTEGER NOT NULL,
  tax_free_commute INTEGER DEFAULT 0,
  overtime_pay INTEGER DEFAULT 0,
  other_allowance INTEGER DEFAULT 0,
  total_payment INTEGER NOT NULL,
  
  -- 控除項目
  income_tax INTEGER NOT NULL DEFAULT 0,
  resident_tax INTEGER NOT NULL DEFAULT 0,
  health_insurance INTEGER NOT NULL DEFAULT 0,
  pension_insurance INTEGER NOT NULL DEFAULT 0,
  employment_insurance INTEGER NOT NULL DEFAULT 0,
  other_deduction INTEGER DEFAULT 0,
  total_deduction INTEGER NOT NULL,
  
  -- 差引支給額
  net_payment INTEGER NOT NULL,
  
  -- 選択したフォーマット
  format_id INTEGER NOT NULL DEFAULT 1,
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_payslips_user_id ON payslips(user_id);
CREATE INDEX IF NOT EXISTS idx_payslips_issue_date ON payslips(user_id, issue_year, issue_month);
