// === 給与明細フォーマット（6種類） ===

const payslipFormats = {
    // フォーマット1: 伝統的な縦型レイアウト
    format1: (data) => `
        <div class="mincho bg-white p-8 shadow-lg" style="width: 210mm; min-height: 297mm; margin: 0 auto;">
            <div class="border-2 border-black p-6">
                <h1 class="text-center text-3xl font-bold mb-6">給与明細書</h1>
                
                <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                        <p><span class="font-bold">発行年月:</span> ${data.issue_year}年${data.issue_month}月</p>
                        <p><span class="font-bold">氏名:</span> ${data.employee_name} 殿</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-lg">${data.company_name || ''}</p>
                        <p class="text-xs">労働期間: ${data.work_start_year}年${data.work_start_month}月${data.work_start_day}日 ～ ${data.work_end_year}年${data.work_end_month}月${data.work_end_day}日</p>
                    </div>
                </div>
                
                <div class="mb-6 border border-black">
                    <div class="grid grid-cols-3 text-sm">
                        <div class="border-r border-black p-2 bg-gray-100 font-bold text-center">労働日数</div>
                        <div class="border-r border-black p-2 bg-gray-100 font-bold text-center">労働時間</div>
                        <div class="p-2 bg-gray-100 font-bold text-center">所定時間外</div>
                    </div>
                    <div class="grid grid-cols-3 text-sm">
                        <div class="border-r border-t border-black p-2 text-center">${data.working_days}日</div>
                        <div class="border-r border-t border-black p-2 text-center">${data.working_hours}時間</div>
                        <div class="border-t border-black p-2 text-center">${data.overtime_hours}時間</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="border-2 border-black">
                        <div class="bg-gray-200 border-b-2 border-black p-2 text-center font-bold">支給項目</div>
                        <div class="text-sm">
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>基本給</span>
                                <span class="font-bold">${data.basic_salary.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>非課税通勤費</span>
                                <span>${data.tax_free_commute.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>残業手当</span>
                                <span>${data.overtime_pay.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>その他手当</span>
                                <span>${data.other_allowance.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between p-2 bg-yellow-100 font-bold">
                                <span>支給額合計</span>
                                <span>${data.total_payment.toLocaleString()}円</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-2 border-black">
                        <div class="bg-gray-200 border-b-2 border-black p-2 text-center font-bold">控除項目</div>
                        <div class="text-sm">
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>所得税</span>
                                <span>${data.income_tax.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>住民税</span>
                                <span>${data.resident_tax.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>健康保険</span>
                                <span>${data.health_insurance.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>厚生年金</span>
                                <span>${data.pension_insurance.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>雇用保険</span>
                                <span>${data.employment_insurance.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between border-b border-gray-300 p-2">
                                <span>その他控除</span>
                                <span>${data.other_deduction.toLocaleString()}円</span>
                            </div>
                            <div class="flex justify-between p-2 bg-red-100 font-bold">
                                <span>控除額合計</span>
                                <span>${data.total_deduction.toLocaleString()}円</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="border-4 border-black p-4 bg-green-50">
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold">差引支給額（手取り額）</span>
                        <span class="text-3xl font-bold text-green-700">${data.net_payment.toLocaleString()}円</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    // フォーマット2: モダンな横型レイアウト
    format2: (data) => `
        <div class="mincho bg-white p-8 shadow-lg" style="width: 210mm; min-height: 297mm; margin: 0 auto;">
            <div class="border border-gray-400">
                <div class="bg-gray-800 text-white p-4">
                    <h1 class="text-2xl font-bold">給 与 明 細 書</h1>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-3 gap-6 mb-6">
                        <div>
                            <p class="text-xs text-gray-600 mb-1">対象年月</p>
                            <p class="text-xl font-bold">${data.issue_year}年${data.issue_month}月分</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-600 mb-1">氏名</p>
                            <p class="text-xl font-bold">${data.employee_name}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-600 mb-1">会社名</p>
                            <p class="text-lg">${data.company_name || ''}</p>
                        </div>
                    </div>
                    
                    <div class="bg-gray-100 p-4 rounded mb-6">
                        <h3 class="font-bold mb-2 text-sm">勤怠情報</h3>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span class="text-gray-600">労働日数:</span>
                                <span class="font-bold ml-2">${data.working_days}日</span>
                            </div>
                            <div>
                                <span class="text-gray-600">労働時間:</span>
                                <span class="font-bold ml-2">${data.working_hours}時間</span>
                            </div>
                            <div>
                                <span class="text-gray-600">時間外:</span>
                                <span class="font-bold ml-2">${data.overtime_hours}時間</span>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">期間: ${data.work_start_year}/${data.work_start_month}/${data.work_start_day} - ${data.work_end_year}/${data.work_end_month}/${data.work_end_day}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <div class="bg-blue-600 text-white p-2 rounded-t">
                                <h3 class="font-bold">支給</h3>
                            </div>
                            <div class="border border-t-0 border-gray-300 rounded-b p-3">
                                <table class="w-full text-sm">
                                    <tr class="border-b">
                                        <td class="py-2">基本給</td>
                                        <td class="text-right font-bold">${data.basic_salary.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">非課税通勤費</td>
                                        <td class="text-right">${data.tax_free_commute.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">残業手当</td>
                                        <td class="text-right">${data.overtime_pay.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">その他手当</td>
                                        <td class="text-right">${data.other_allowance.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="bg-blue-50 font-bold">
                                        <td class="py-2">合計</td>
                                        <td class="text-right text-blue-700">${data.total_payment.toLocaleString()}円</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        
                        <div>
                            <div class="bg-red-600 text-white p-2 rounded-t">
                                <h3 class="font-bold">控除</h3>
                            </div>
                            <div class="border border-t-0 border-gray-300 rounded-b p-3">
                                <table class="w-full text-sm">
                                    <tr class="border-b">
                                        <td class="py-2">所得税</td>
                                        <td class="text-right">${data.income_tax.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">住民税</td>
                                        <td class="text-right">${data.resident_tax.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">健康保険</td>
                                        <td class="text-right">${data.health_insurance.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">厚生年金</td>
                                        <td class="text-right">${data.pension_insurance.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">雇用保険</td>
                                        <td class="text-right">${data.employment_insurance.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="py-2">その他</td>
                                        <td class="text-right">${data.other_deduction.toLocaleString()}円</td>
                                    </tr>
                                    <tr class="bg-red-50 font-bold">
                                        <td class="py-2">合計</td>
                                        <td class="text-right text-red-700">${data.total_deduction.toLocaleString()}円</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-green-600 text-white p-6 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="text-xl font-bold">差引支給額</span>
                            <span class="text-4xl font-bold">¥${data.net_payment.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    // 残りのフォーマット3-6は次のファイルで実装します
    format3: (data) => payslipFormats.format1(data), // 一旦format1を使用
    format4: (data) => payslipFormats.format2(data), // 一旦format2を使用
    format5: (data) => payslipFormats.format1(data), // 一旦format1を使用
    format6: (data) => payslipFormats.format2(data)  // 一旦format2を使用
};
