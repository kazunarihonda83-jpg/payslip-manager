// === グローバル状態管理 ===
const state = {
    currentUser: null,
    token: localStorage.getItem('token') || null,
    payslips: [],
    currentPayslip: null,
    currentView: 'login',
    selectedFormat: 1
};

// === API通信ヘルパー ===
const api = {
    async request(method, url, data = null) {
        const config = {
            method,
            url,
            headers: {}
        };
        
        if (state.token) {
            config.headers['Authorization'] = `Bearer ${state.token}`;
        }
        
        if (data) {
            config.data = data;
            config.headers['Content-Type'] = 'application/json';
        }
        
        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                // トークンが無効な場合はログアウト
                logout();
            }
            throw error;
        }
    },
    
    get(url) { return this.request('GET', url); },
    post(url, data) { return this.request('POST', url, data); },
    put(url, data) { return this.request('PUT', url, data); },
    delete(url) { return this.request('DELETE', url); }
};

// === 認証機能 ===
async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;
    
    try {
        const result = await api.post('/api/auth/register', { email, password, name });
        state.token = result.token;
        state.currentUser = result.user;
        localStorage.setItem('token', result.token);
        showView('dashboard');
        await loadPayslips();
        showNotification('登録が完了しました', 'success');
    } catch (error) {
        showNotification(error.response?.data?.error || '登録に失敗しました', 'error');
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const result = await api.post('/api/auth/login', { email, password });
        state.token = result.token;
        state.currentUser = result.user;
        localStorage.setItem('token', result.token);
        showView('dashboard');
        await loadPayslips();
        showNotification('ログインしました', 'success');
    } catch (error) {
        showNotification(error.response?.data?.error || 'ログインに失敗しました', 'error');
    }
}

function logout() {
    state.token = null;
    state.currentUser = null;
    state.payslips = [];
    localStorage.removeItem('token');
    showView('login');
    showNotification('ログアウトしました', 'info');
}

// === 給与明細データ管理 ===
async function loadPayslips() {
    try {
        const result = await api.get('/api/payslips');
        state.payslips = result.payslips || [];
        renderPayslipList();
    } catch (error) {
        showNotification('給与明細の読み込みに失敗しました', 'error');
    }
}

async function savePayslip() {
    const data = collectFormData();
    
    // バリデーション
    if (!validateFormData(data)) {
        return;
    }
    
    try {
        if (state.currentPayslip) {
            // 更新
            await api.put(`/api/payslips/${state.currentPayslip.id}`, data);
            showNotification('給与明細を更新しました', 'success');
        } else {
            // 新規作成
            const result = await api.post('/api/payslips', data);
            showNotification('給与明細を保存しました', 'success');
        }
        await loadPayslips();
    } catch (error) {
        showNotification('保存に失敗しました', 'error');
    }
}

async function deletePayslip(id) {
    if (!confirm('この給与明細を削除してもよろしいですか？')) {
        return;
    }
    
    try {
        await api.delete(`/api/payslips/${id}`);
        showNotification('給与明細を削除しました', 'success');
        await loadPayslips();
        if (state.currentPayslip?.id === id) {
            newPayslip();
        }
    } catch (error) {
        showNotification('削除に失敗しました', 'error');
    }
}

async function loadPayslip(id) {
    try {
        const result = await api.get(`/api/payslips/${id}`);
        state.currentPayslip = result.payslip;
        populateForm(result.payslip);
        state.selectedFormat = result.payslip.format_id;
        updatePreview();
    } catch (error) {
        showNotification('給与明細の読み込みに失敗しました', 'error');
    }
}

function newPayslip() {
    state.currentPayslip = null;
    clearForm();
    updatePreview();
}

// === フォームデータ収集 ===
function collectFormData() {
    const getValue = (id) => document.getElementById(id)?.value || '';
    const getNumber = (id) => parseFloat(getValue(id)) || 0;
    
    // 支給額計算
    const basicSalary = getNumber('basicSalary');
    const taxFreeCommute = getNumber('taxFreeCommute');
    const overtimePay = getNumber('overtimePay');
    const otherAllowance = getNumber('otherAllowance');
    const totalPayment = basicSalary + taxFreeCommute + overtimePay + otherAllowance;
    
    // 控除額計算
    const incomeTax = getNumber('incomeTax');
    const residentTax = getNumber('residentTax');
    const healthInsurance = getNumber('healthInsurance');
    const pensionInsurance = getNumber('pensionInsurance');
    const employmentInsurance = getNumber('employmentInsurance');
    const otherDeduction = getNumber('otherDeduction');
    const totalDeduction = incomeTax + residentTax + healthInsurance + pensionInsurance + employmentInsurance + otherDeduction;
    
    // 差引支給額
    const netPayment = totalPayment - totalDeduction;
    
    return {
        issue_year: parseInt(getValue('issueYear')),
        issue_month: parseInt(getValue('issueMonth')),
        employee_name: getValue('employeeName'),
        company_name: getValue('companyName'),
        company_logo_url: getValue('companyLogo'),
        work_start_year: parseInt(getValue('workStartYear')),
        work_start_month: parseInt(getValue('workStartMonth')),
        work_start_day: parseInt(getValue('workStartDay')),
        work_end_year: parseInt(getValue('workEndYear')),
        work_end_month: parseInt(getValue('workEndMonth')),
        work_end_day: parseInt(getValue('workEndDay')),
        working_days: getNumber('workingDays'),
        working_hours: getNumber('workingHours'),
        overtime_hours: getNumber('overtimeHours'),
        basic_salary: basicSalary,
        tax_free_commute: taxFreeCommute,
        overtime_pay: overtimePay,
        other_allowance: otherAllowance,
        total_payment: totalPayment,
        income_tax: incomeTax,
        resident_tax: residentTax,
        health_insurance: healthInsurance,
        pension_insurance: pensionInsurance,
        employment_insurance: employmentInsurance,
        other_deduction: otherDeduction,
        total_deduction: totalDeduction,
        net_payment: netPayment,
        format_id: state.selectedFormat
    };
}

function validateFormData(data) {
    if (!data.employee_name) {
        showNotification('氏名を入力してください', 'error');
        return false;
    }
    if (!data.basic_salary) {
        showNotification('基本給を入力してください', 'error');
        return false;
    }
    return true;
}

function populateForm(payslip) {
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };
    
    setValue('issueYear', payslip.issue_year);
    setValue('issueMonth', payslip.issue_month);
    setValue('employeeName', payslip.employee_name);
    setValue('companyName', payslip.company_name);
    setValue('companyLogo', payslip.company_logo_url);
    setValue('workStartYear', payslip.work_start_year);
    setValue('workStartMonth', payslip.work_start_month);
    setValue('workStartDay', payslip.work_start_day);
    setValue('workEndYear', payslip.work_end_year);
    setValue('workEndMonth', payslip.work_end_month);
    setValue('workEndDay', payslip.work_end_day);
    setValue('workingDays', payslip.working_days);
    setValue('workingHours', payslip.working_hours);
    setValue('overtimeHours', payslip.overtime_hours);
    setValue('basicSalary', payslip.basic_salary);
    setValue('taxFreeCommute', payslip.tax_free_commute);
    setValue('overtimePay', payslip.overtime_pay);
    setValue('otherAllowance', payslip.other_allowance);
    setValue('incomeTax', payslip.income_tax);
    setValue('residentTax', payslip.resident_tax);
    setValue('healthInsurance', payslip.health_insurance);
    setValue('pensionInsurance', payslip.pension_insurance);
    setValue('employmentInsurance', payslip.employment_insurance);
    setValue('otherDeduction', payslip.other_deduction);
}

function clearForm() {
    const form = document.getElementById('payslipForm');
    if (form) form.reset();
    
    // デフォルト値設定
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    document.getElementById('issueYear').value = currentYear;
    document.getElementById('issueMonth').value = currentMonth;
    document.getElementById('workStartYear').value = currentYear;
    document.getElementById('workStartMonth').value = currentMonth;
    document.getElementById('workStartDay').value = 1;
    document.getElementById('workEndYear').value = currentYear;
    document.getElementById('workEndMonth').value = currentMonth;
    document.getElementById('workEndDay').value = new Date(currentYear, currentMonth, 0).getDate();
}

// === UI更新関数 ===
function updatePreview() {
    const data = collectFormData();
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;
    
    // 自動計算結果を表示
    updateCalculatedFields(data);
    
    // プレビューHTML生成
    const formatFunction = payslipFormats[`format${state.selectedFormat}`];
    if (formatFunction) {
        previewContainer.innerHTML = formatFunction(data);
    }
}

function updateCalculatedFields(data) {
    const formatCurrency = (num) => num.toLocaleString('ja-JP') + '円';
    
    document.getElementById('totalPaymentDisplay')?.innerText && 
        (document.getElementById('totalPaymentDisplay').innerText = formatCurrency(data.total_payment));
    document.getElementById('totalDeductionDisplay')?.innerText && 
        (document.getElementById('totalDeductionDisplay').innerText = formatCurrency(data.total_deduction));
    document.getElementById('netPaymentDisplay')?.innerText && 
        (document.getElementById('netPaymentDisplay').innerText = formatCurrency(data.net_payment));
}

function renderPayslipList() {
    const container = document.getElementById('payslipList');
    if (!container) return;
    
    if (state.payslips.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-file-invoice text-4xl mb-4"></i>
                <p>給与明細がまだありません</p>
                <p class="text-sm">「新規作成」ボタンから作成してください</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.payslips.map(payslip => `
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200" 
             onclick="loadPayslip(${payslip.id})">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-bold text-lg">${payslip.issue_year}年${payslip.issue_month}月</h3>
                    <p class="text-gray-600">${payslip.employee_name}</p>
                    <p class="text-sm text-gray-500">${payslip.company_name || '会社名未設定'}</p>
                    <p class="text-sm font-semibold text-blue-600 mt-2">
                        手取り: ${payslip.net_payment.toLocaleString('ja-JP')}円
                    </p>
                </div>
                <button onclick="event.stopPropagation(); deletePayslip(${payslip.id})" 
                        class="text-red-500 hover:text-red-700 px-2 py-1">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// === 通知表示 ===
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('animate-slide-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 続きは次のメッセージで提供します（ファイルが長いため）
