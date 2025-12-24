-- テストユーザー（パスワード: password123）
INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES 
  (1, 'test@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'テストユーザー');

-- サンプル給与明細データ
INSERT OR IGNORE INTO payslips (
  user_id, issue_year, issue_month, employee_name,
  company_name,
  work_start_year, work_start_month, work_start_day,
  work_end_year, work_end_month, work_end_day,
  working_days, working_hours, overtime_hours,
  basic_salary, tax_free_commute, overtime_pay, other_allowance, total_payment,
  income_tax, resident_tax, health_insurance, pension_insurance, employment_insurance, other_deduction, total_deduction,
  net_payment, format_id
) VALUES 
  (
    1, 2024, 12, 'テストユーザー',
    '株式会社サンプル',
    2024, 12, 1,
    2024, 12, 31,
    22, 176.0, 10.0,
    300000, 15000, 25000, 10000, 350000,
    12000, 15000, 18000, 27000, 3500, 0, 75500,
    274500, 1
  );
