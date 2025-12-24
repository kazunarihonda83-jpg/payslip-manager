/**
 * 給与明細フォーマット生成モジュール
 * 5種類の異なるレイアウトを提供
 */

/**
 * 金額を3桁カンマ区切りでフォーマット
 */
function formatCurrency(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('ja-JP');
}

/**
 * フォーマット1: 伝統的な縦型レイアウト
 */
function generateFormat1(data) {
    return `
        <div class="payslip-preview" style="font-family: 'Noto Serif JP', serif; padding: 2rem; background: white;">
            <!-- ヘッダー -->
            <div style="text-align: center; border-bottom: 3px double #333; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                ${data.companyLogo ? `<img src="${data.companyLogo}" style="max-width: 150px; max-height: 80px; margin-bottom: 0.5rem;">` : ''}
                <h1 style="font-size: 1.8rem; margin: 0.5rem 0;">給 与 明 細 書</h1>
                ${data.companyName ? `<p style="font-size: 1rem; margin: 0.25rem 0;">${data.companyName}</p>` : ''}
            </div>

            <!-- 基本情報 -->
            <table style="width: 100%; margin-bottom: 1.5rem; border-collapse: collapse;">
                <tr>
                    <td style="border: 1px solid #333; padding: 0.5rem; width: 25%; background-color: #f5f5f5; font-weight: bold;">発行年月</td>
                    <td style="border: 1px solid #333; padding: 0.5rem; width: 25%;">${data.issueYear}年 ${data.issueMonth}月</td>
                    <td style="border: 1px solid #333; padding: 0.5rem; width: 25%; background-color: #f5f5f5; font-weight: bold;">氏名</td>
                    <td style="border: 1px solid #333; padding: 0.5rem; width: 25%;">${data.employeeName || ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #333; padding: 0.5rem; background-color: #f5f5f5; font-weight: bold;">労働期間</td>
                    <td colspan="3" style="border: 1px solid #333; padding: 0.5rem;">
                        ${data.workStartYear || ''}年${data.workStartMonth || ''}月${data.workStartDay || ''}日 ～ 
                        ${data.workEndYear || ''}年${data.workEndMonth || ''}月${data.workEndDay || ''}日
                    </td>
                </tr>
            </table>

            <!-- 勤怠情報 -->
            <table style="width: 100%; margin-bottom: 1.5rem; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #333; padding: 0.5rem; background-color: #e0e0e0; text-align: center;">労働日数</th>
                        <th style="border: 1px solid #333; padding: 0.5rem; background-color: #e0e0e0; text-align: center;">労働時間</th>
                        <th style="border: 1px solid #333; padding: 0.5rem; background-color: #e0e0e0; text-align: center;">所定時間外労働</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: center;">${data.workingDays || '0'} 日</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: center;">${data.workingHours || '0.0'} 時間</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: center;">${data.overtimeHours || '0.0'} 時間</td>
                    </tr>
                </tbody>
            </table>

            <!-- 支給・控除項目 -->
            <table style="width: 100%; margin-bottom: 1.5rem; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #333; padding: 0.5rem; background-color: #e0e0e0; width: 25%;">支給項目</th>
                        <th style="border: 1px solid #333; padding: 0.5rem; background-color: #e0e0e0; width: 25%; text-align: right;">金額（円）</th>
                        <th style="border: 1px solid #333; padding: 0.5rem; background-color: #e0e0e0; width: 25%;">控除項目</th>
                        <th style="border: 1px solid #333; padding: 0.5rem; background-color: #e0e0e0; width: 25%; text-align: right;">金額（円）</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem;">基本給</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.basicSalary)}</td>
                        <td style="border: 1px solid #333; padding: 0.5rem;">所得税</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.incomeTax)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem;">非課税通勤費</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.taxFreeCommute)}</td>
                        <td style="border: 1px solid #333; padding: 0.5rem;">住民税</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.residentTax)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem;">残業手当</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.overtimePay)}</td>
                        <td style="border: 1px solid #333; padding: 0.5rem;">健康保険</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.healthInsurance)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem;">その他手当</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.otherAllowance)}</td>
                        <td style="border: 1px solid #333; padding: 0.5rem;">厚生年金</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.pensionInsurance)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem;"></td>
                        <td style="border: 1px solid #333; padding: 0.5rem;"></td>
                        <td style="border: 1px solid #333; padding: 0.5rem;">雇用保険</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.employmentInsurance)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem;"></td>
                        <td style="border: 1px solid #333; padding: 0.5rem;"></td>
                        <td style="border: 1px solid #333; padding: 0.5rem;">その他控除</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.otherDeduction)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.5rem; background-color: #f5f5f5; font-weight: bold;">支給額合計</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right; background-color: #f5f5f5; font-weight: bold;">${formatCurrency(data.totalEarnings)}</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; background-color: #f5f5f5; font-weight: bold;">控除額合計</td>
                        <td style="border: 1px solid #333; padding: 0.5rem; text-align: right; background-color: #f5f5f5; font-weight: bold;">${formatCurrency(data.totalDeductions)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 差引支給額 -->
            <div style="border: 3px double #333; padding: 1.5rem; text-align: center; background-color: #f9f9f9;">
                <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem;">差引支給額（手取り額）</div>
                <div style="font-size: 2rem; font-weight: bold; color: #333;">¥ ${formatCurrency(data.netPay)}</div>
            </div>
        </div>
    `;
}

/**
 * フォーマット2: モダンな横型レイアウト
 */
function generateFormat2(data) {
    return `
        <div class="payslip-preview" style="font-family: 'Noto Serif JP', serif; padding: 2rem; background: white;">
            <!-- ヘッダー -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <div>
                    ${data.companyLogo ? `<img src="${data.companyLogo}" style="max-width: 120px; max-height: 60px; display: block; margin-bottom: 0.5rem;">` : ''}
                    ${data.companyName ? `<div style="font-size: 0.9rem; color: #555;">${data.companyName}</div>` : ''}
                </div>
                <div style="text-align: right;">
                    <h1 style="font-size: 1.6rem; margin: 0;">給与明細書</h1>
                    <div style="font-size: 1.1rem; margin-top: 0.5rem;">${data.issueYear}年 ${data.issueMonth}月分</div>
                </div>
            </div>

            <!-- 基本情報と勤怠情報 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="border: 1px solid #333; padding: 1rem;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">氏名</div>
                    <div style="font-size: 1.2rem; font-weight: bold;">${data.employeeName || ''}</div>
                </div>
                <div style="border: 1px solid #333; padding: 1rem;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">労働期間</div>
                    <div style="font-size: 1rem;">
                        ${data.workStartYear || ''}/${data.workStartMonth || ''}/${data.workStartDay || ''} - 
                        ${data.workEndYear || ''}/${data.workEndMonth || ''}/${data.workEndDay || ''}
                    </div>
                </div>
            </div>

            <!-- 勤怠詳細 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="border: 1px solid #333; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">労働日数</div>
                    <div style="font-size: 1.3rem; font-weight: bold;">${data.workingDays || '0'} 日</div>
                </div>
                <div style="border: 1px solid #333; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">労働時間</div>
                    <div style="font-size: 1.3rem; font-weight: bold;">${data.workingHours || '0.0'} h</div>
                </div>
                <div style="border: 1px solid #333; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">時間外労働</div>
                    <div style="font-size: 1.3rem; font-weight: bold;">${data.overtimeHours || '0.0'} h</div>
                </div>
            </div>

            <!-- 支給・控除 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <!-- 支給項目 -->
                <div>
                    <div style="background-color: #333; color: white; padding: 0.75rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem;">
                        支給項目
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">基本給</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right; font-weight: bold;">¥${formatCurrency(data.basicSalary)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">非課税通勤費</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.taxFreeCommute)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">残業手当</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.overtimePay)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">その他手当</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.otherAllowance)}</td>
                        </tr>
                        <tr>
                            <td style="border-top: 2px solid #333; padding: 0.5rem; background-color: #f5f5f5; font-weight: bold;">合計</td>
                            <td style="border-top: 2px solid #333; padding: 0.5rem; text-align: right; background-color: #f5f5f5; font-weight: bold;">¥${formatCurrency(data.totalEarnings)}</td>
                        </tr>
                    </table>
                </div>

                <!-- 控除項目 -->
                <div>
                    <div style="background-color: #333; color: white; padding: 0.75rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem;">
                        控除項目
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">所得税</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.incomeTax)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">住民税</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.residentTax)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">健康保険</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.healthInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">厚生年金</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.pensionInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">雇用保険</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.employmentInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 0.5rem;">その他控除</td>
                            <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: right;">¥${formatCurrency(data.otherDeduction)}</td>
                        </tr>
                        <tr>
                            <td style="border-top: 2px solid #333; padding: 0.5rem; background-color: #f5f5f5; font-weight: bold;">合計</td>
                            <td style="border-top: 2px solid #333; padding: 0.5rem; text-align: right; background-color: #f5f5f5; font-weight: bold;">¥${formatCurrency(data.totalDeductions)}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- 差引支給額 -->
            <div style="border: 3px solid #333; padding: 1.5rem; text-align: center; background-color: #f0f0f0;">
                <div style="font-size: 1rem; margin-bottom: 0.5rem;">差引支給額（手取り額）</div>
                <div style="font-size: 2.2rem; font-weight: bold; color: #000;">¥ ${formatCurrency(data.netPay)}</div>
            </div>
        </div>
    `;
}

/**
 * フォーマット3: 詳細型レイアウト
 */
function generateFormat3(data) {
    return `
        <div class="payslip-preview" style="font-family: 'Noto Serif JP', serif; padding: 2rem; background: white;">
            <!-- タイトル -->
            <div style="text-align: center; margin-bottom: 2rem;">
                ${data.companyLogo ? `<img src="${data.companyLogo}" style="max-width: 150px; max-height: 80px; margin-bottom: 0.5rem;">` : ''}
                <h1 style="font-size: 1.8rem; margin: 0.5rem 0; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 0.75rem 0;">給 与 明 細 書</h1>
                ${data.companyName ? `<p style="font-size: 1rem; margin: 0.5rem 0; color: #555;">${data.companyName}</p>` : ''}
                <p style="font-size: 1.2rem; font-weight: bold; margin: 0.5rem 0;">${data.issueYear}年 ${data.issueMonth}月分</p>
            </div>

            <!-- 従業員情報 -->
            <table style="width: 100%; margin-bottom: 1rem; border-collapse: collapse;">
                <tr>
                    <td style="border: 1px solid #333; padding: 0.75rem; width: 20%; background-color: #e8e8e8; font-weight: bold;">氏名</td>
                    <td style="border: 1px solid #333; padding: 0.75rem; width: 80%;">${data.employeeName || ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #333; padding: 0.75rem; background-color: #e8e8e8; font-weight: bold;">労働期間</td>
                    <td style="border: 1px solid #333; padding: 0.75rem;">
                        ${data.workStartYear || ''}年${data.workStartMonth || ''}月${data.workStartDay || ''}日 から 
                        ${data.workEndYear || ''}年${data.workEndMonth || ''}月${data.workEndDay || ''}日 まで
                    </td>
                </tr>
            </table>

            <!-- 勤怠詳細 -->
            <div style="margin-bottom: 1.5rem;">
                <div style="background-color: #333; color: white; padding: 0.75rem; font-weight: bold; margin-bottom: 0.5rem;">■ 勤怠情報</div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.75rem; width: 33.33%; background-color: #f5f5f5; font-weight: bold;">労働日数</td>
                        <td style="border: 1px solid #333; padding: 0.75rem; width: 33.33%; background-color: #f5f5f5; font-weight: bold;">労働時間</td>
                        <td style="border: 1px solid #333; padding: 0.75rem; width: 33.33%; background-color: #f5f5f5; font-weight: bold;">所定時間外労働</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 0.75rem; text-align: center; font-size: 1.1rem;">${data.workingDays || '0'} 日</td>
                        <td style="border: 1px solid #333; padding: 0.75rem; text-align: center; font-size: 1.1rem;">${data.workingHours || '0.0'} 時間</td>
                        <td style="border: 1px solid #333; padding: 0.75rem; text-align: center; font-size: 1.1rem;">${data.overtimeHours || '0.0'} 時間</td>
                    </tr>
                </table>
            </div>

            <!-- 支給項目詳細 -->
            <div style="margin-bottom: 1.5rem;">
                <div style="background-color: #333; color: white; padding: 0.75rem; font-weight: bold; margin-bottom: 0.5rem;">■ 支給項目</div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #333; padding: 0.75rem; background-color: #e8e8e8; text-align: left;">項目名</th>
                            <th style="border: 1px solid #333; padding: 0.75rem; background-color: #e8e8e8; text-align: right; width: 30%;">金額（円）</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">基本給</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right; font-weight: bold;">${formatCurrency(data.basicSalary)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">非課税通勤費</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.taxFreeCommute)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">残業手当</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.overtimePay)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">その他手当</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.otherAllowance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem; background-color: #f5f5f5; font-weight: bold;">支給額合計</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right; background-color: #f5f5f5; font-weight: bold; font-size: 1.1rem;">${formatCurrency(data.totalEarnings)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 控除項目詳細 -->
            <div style="margin-bottom: 1.5rem;">
                <div style="background-color: #333; color: white; padding: 0.75rem; font-weight: bold; margin-bottom: 0.5rem;">■ 控除項目</div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #333; padding: 0.75rem; background-color: #e8e8e8; text-align: left;">項目名</th>
                            <th style="border: 1px solid #333; padding: 0.75rem; background-color: #e8e8e8; text-align: right; width: 30%;">金額（円）</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">所得税</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.incomeTax)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">住民税</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.residentTax)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">健康保険</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.healthInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">厚生年金</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.pensionInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">雇用保険</td>
                            <td style="border: 1px solid #333; padding: 0.5rem; text-align: right;">${formatCurrency(data.employmentInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem;">その他控除</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right;">${formatCurrency(data.otherDeduction)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.75rem; background-color: #f5f5f5; font-weight: bold;">控除額合計</td>
                            <td style="border: 1px solid #333; padding: 0.75rem; text-align: right; background-color: #f5f5f5; font-weight: bold; font-size: 1.1rem;">${formatCurrency(data.totalDeductions)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 差引支給額 -->
            <div style="border: 3px double #333; padding: 1.5rem; text-align: center; background-color: #f9f9f9;">
                <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.75rem;">差引支給額（手取り額）</div>
                <div style="font-size: 2.5rem; font-weight: bold;">¥ ${formatCurrency(data.netPay)}</div>
            </div>
        </div>
    `;
}

/**
 * フォーマット4: コンパクト型レイアウト
 */
function generateFormat4(data) {
    return `
        <div class="payslip-preview" style="font-family: 'Noto Serif JP', serif; padding: 1.5rem; background: white;">
            <!-- ヘッダー（コンパクト） -->
            <div style="border: 2px solid #000; padding: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        ${data.companyLogo ? `<img src="${data.companyLogo}" style="max-width: 100px; max-height: 50px;">` : ''}
                        ${data.companyName ? `<div style="font-size: 0.85rem; margin-top: 0.25rem;">${data.companyName}</div>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <h1 style="font-size: 1.3rem; margin: 0; font-weight: bold;">給与明細書</h1>
                        <div style="font-size: 0.95rem; margin-top: 0.25rem;">${data.issueYear}年${data.issueMonth}月</div>
                    </div>
                </div>
            </div>

            <!-- 基本情報（コンパクト） -->
            <table style="width: 100%; margin-bottom: 1rem; border-collapse: collapse; font-size: 0.9rem;">
                <tr>
                    <td style="border: 1px solid #000; padding: 0.4rem; background-color: #e8e8e8; font-weight: bold; width: 25%;">氏名</td>
                    <td style="border: 1px solid #000; padding: 0.4rem; width: 25%;">${data.employeeName || ''}</td>
                    <td style="border: 1px solid #000; padding: 0.4rem; background-color: #e8e8e8; font-weight: bold; width: 25%;">期間</td>
                    <td style="border: 1px solid #000; padding: 0.4rem; width: 25%;">
                        ${data.workStartMonth || ''}/${data.workStartDay || ''}-${data.workEndMonth || ''}/${data.workEndDay || ''}
                    </td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 0.4rem; background-color: #e8e8e8; font-weight: bold;">日数</td>
                    <td style="border: 1px solid #000; padding: 0.4rem;">${data.workingDays || '0'}日</td>
                    <td style="border: 1px solid #000; padding: 0.4rem; background-color: #e8e8e8; font-weight: bold;">時間</td>
                    <td style="border: 1px solid #000; padding: 0.4rem;">${data.workingHours || '0'}h (残業${data.overtimeHours || '0'}h)</td>
                </tr>
            </table>

            <!-- 支給・控除（コンパクト2列） -->
            <table style="width: 100%; margin-bottom: 1rem; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr>
                        <th colspan="2" style="border: 1px solid #000; padding: 0.5rem; background-color: #000; color: white;">支給</th>
                        <th colspan="2" style="border: 1px solid #000; padding: 0.5rem; background-color: #000; color: white;">控除</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #000; padding: 0.4rem; width: 22%;">基本給</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right; width: 28%; font-weight: bold;">${formatCurrency(data.basicSalary)}</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; width: 22%;">所得税</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right; width: 28%;">${formatCurrency(data.incomeTax)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 0.4rem;">通勤費</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.taxFreeCommute)}</td>
                        <td style="border: 1px solid #000; padding: 0.4rem;">住民税</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.residentTax)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 0.4rem;">残業手当</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.overtimePay)}</td>
                        <td style="border: 1px solid #000; padding: 0.4rem;">健康保険</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.healthInsurance)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 0.4rem;">その他</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.otherAllowance)}</td>
                        <td style="border: 1px solid #000; padding: 0.4rem;">厚生年金</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.pensionInsurance)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 0.4rem;"></td>
                        <td style="border: 1px solid #000; padding: 0.4rem;"></td>
                        <td style="border: 1px solid #000; padding: 0.4rem;">雇用保険</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.employmentInsurance)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 0.4rem;"></td>
                        <td style="border: 1px solid #000; padding: 0.4rem;"></td>
                        <td style="border: 1px solid #000; padding: 0.4rem;">その他</td>
                        <td style="border: 1px solid #000; padding: 0.4rem; text-align: right;">${formatCurrency(data.otherDeduction)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 0.5rem; background-color: #e8e8e8; font-weight: bold;">合計</td>
                        <td style="border: 1px solid #000; padding: 0.5rem; text-align: right; background-color: #e8e8e8; font-weight: bold;">${formatCurrency(data.totalEarnings)}</td>
                        <td style="border: 1px solid #000; padding: 0.5rem; background-color: #e8e8e8; font-weight: bold;">合計</td>
                        <td style="border: 1px solid #000; padding: 0.5rem; text-align: right; background-color: #e8e8e8; font-weight: bold;">${formatCurrency(data.totalDeductions)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 手取り額（強調） -->
            <div style="border: 3px solid #000; padding: 1rem; text-align: center; background-color: #f5f5f5;">
                <div style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem;">差引支給額</div>
                <div style="font-size: 1.8rem; font-weight: bold;">¥ ${formatCurrency(data.netPay)}</div>
            </div>
        </div>
    `;
}

/**
 * フォーマット5: 二段組レイアウト
 */
function generateFormat5(data) {
    return `
        <div class="payslip-preview" style="font-family: 'Noto Serif JP', serif; padding: 2rem; background: white;">
            <!-- タイトルヘッダー -->
            <div style="border: 3px solid #333; padding: 1rem; text-align: center; margin-bottom: 1.5rem; background-color: #f8f8f8;">
                ${data.companyLogo ? `<img src="${data.companyLogo}" style="max-width: 140px; max-height: 70px; margin-bottom: 0.5rem;">` : ''}
                <h1 style="font-size: 1.7rem; margin: 0.5rem 0; font-weight: bold;">給 与 明 細 書</h1>
                ${data.companyName ? `<div style="font-size: 1rem; color: #555;">${data.companyName}</div>` : ''}
                <div style="font-size: 1.2rem; font-weight: bold; margin-top: 0.5rem;">${data.issueYear}年 ${data.issueMonth}月分</div>
            </div>

            <!-- 上段: 基本情報と勤怠 -->
            <div style="border: 2px solid #333; padding: 1rem; margin-bottom: 1.5rem;">
                <div style="background-color: #333; color: white; padding: 0.5rem 1rem; margin: -1rem -1rem 1rem -1rem; font-weight: bold; font-size: 1.1rem;">
                    基本情報・勤怠
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 0.5rem; width: 20%; font-weight: bold; background-color: #f0f0f0;">氏名</td>
                        <td style="padding: 0.5rem; width: 30%; border-left: 1px solid #ddd;">${data.employeeName || ''}</td>
                        <td style="padding: 0.5rem; width: 20%; font-weight: bold; background-color: #f0f0f0; border-left: 1px solid #ddd;">労働期間</td>
                        <td style="padding: 0.5rem; width: 30%; border-left: 1px solid #ddd;">
                            ${data.workStartYear || ''}/${data.workStartMonth || ''}/${data.workStartDay || ''} - 
                            ${data.workEndYear || ''}/${data.workEndMonth || ''}/${data.workEndDay || ''}
                        </td>
                    </tr>
                    <tr style="border-top: 1px solid #ddd;">
                        <td style="padding: 0.5rem; font-weight: bold; background-color: #f0f0f0;">労働日数</td>
                        <td style="padding: 0.5rem; border-left: 1px solid #ddd;">${data.workingDays || '0'} 日</td>
                        <td style="padding: 0.5rem; font-weight: bold; background-color: #f0f0f0; border-left: 1px solid #ddd;">労働時間</td>
                        <td style="padding: 0.5rem; border-left: 1px solid #ddd;">${data.workingHours || '0.0'} 時間（時間外 ${data.overtimeHours || '0.0'} h）</td>
                    </tr>
                </table>
            </div>

            <!-- 下段: 支給・控除詳細 -->
            <div style="border: 2px solid #333; padding: 1rem; margin-bottom: 1.5rem;">
                <div style="background-color: #333; color: white; padding: 0.5rem 1rem; margin: -1rem -1rem 1rem -1rem; font-weight: bold; font-size: 1.1rem;">
                    支給・控除明細
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #333; padding: 0.6rem; background-color: #e8e8e8; width: 25%;">支給項目</th>
                            <th style="border: 1px solid #333; padding: 0.6rem; background-color: #e8e8e8; width: 25%; text-align: right;">金額</th>
                            <th style="border: 1px solid #333; padding: 0.6rem; background-color: #e8e8e8; width: 25%;">控除項目</th>
                            <th style="border: 1px solid #333; padding: 0.6rem; background-color: #e8e8e8; width: 25%; text-align: right;">金額</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.6rem;">基本給</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right; font-weight: bold;">¥${formatCurrency(data.basicSalary)}</td>
                            <td style="border: 1px solid #333; padding: 0.6rem;">所得税</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.incomeTax)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.6rem;">非課税通勤費</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.taxFreeCommute)}</td>
                            <td style="border: 1px solid #333; padding: 0.6rem;">住民税</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.residentTax)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.6rem;">残業手当</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.overtimePay)}</td>
                            <td style="border: 1px solid #333; padding: 0.6rem;">健康保険</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.healthInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.6rem;">その他手当</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.otherAllowance)}</td>
                            <td style="border: 1px solid #333; padding: 0.6rem;">厚生年金</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.pensionInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.6rem;"></td>
                            <td style="border: 1px solid #333; padding: 0.6rem;"></td>
                            <td style="border: 1px solid #333; padding: 0.6rem;">雇用保険</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.employmentInsurance)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #333; padding: 0.6rem;"></td>
                            <td style="border: 1px solid #333; padding: 0.6rem;"></td>
                            <td style="border: 1px solid #333; padding: 0.6rem;">その他控除</td>
                            <td style="border: 1px solid #333; padding: 0.6rem; text-align: right;">¥${formatCurrency(data.otherDeduction)}</td>
                        </tr>
                        <tr>
                            <td style="border: 2px solid #333; padding: 0.6rem; background-color: #f0f0f0; font-weight: bold;">支給合計</td>
                            <td style="border: 2px solid #333; padding: 0.6rem; text-align: right; background-color: #f0f0f0; font-weight: bold; font-size: 1.05rem;">¥${formatCurrency(data.totalEarnings)}</td>
                            <td style="border: 2px solid #333; padding: 0.6rem; background-color: #f0f0f0; font-weight: bold;">控除合計</td>
                            <td style="border: 2px solid #333; padding: 0.6rem; text-align: right; background-color: #f0f0f0; font-weight: bold; font-size: 1.05rem;">¥${formatCurrency(data.totalDeductions)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 差引支給額 -->
            <div style="border: 3px double #333; padding: 1.5rem; text-align: center; background: linear-gradient(to right, #f8f8f8, #ffffff, #f8f8f8);">
                <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.75rem; color: #555;">差引支給額（手取り額）</div>
                <div style="font-size: 2.3rem; font-weight: bold; color: #000;">¥ ${formatCurrency(data.netPay)}</div>
            </div>
        </div>
    `;
}

/**
 * 指定されたフォーマットでHTMLを生成
 */
function generatePayslipHTML(formatId, data) {
    switch (parseInt(formatId)) {
        case 1:
            return generateFormat1(data);
        case 2:
            return generateFormat2(data);
        case 3:
            return generateFormat3(data);
        case 4:
            return generateFormat4(data);
        case 5:
            return generateFormat5(data);
        default:
            return generateFormat1(data);
    }
}
