// === ビュー切り替え ===
function showView(viewName) {
    state.currentView = viewName;
    const app = document.getElementById('app');
    
    switch(viewName) {
        case 'login':
            app.innerHTML = renderLoginView();
            break;
        case 'dashboard':
            app.innerHTML = renderDashboardView();
            renderPayslipList();
            break;
        case 'editor':
            app.innerHTML = renderEditorView();
            setupFormListeners();
            updatePreview();
            break;
    }
}

// === ログイン/登録ビュー ===
function renderLoginView() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div class="text-center mb-8">
                    <i class="fas fa-file-invoice-dollar text-5xl text-blue-600 mb-4"></i>
                    <h1 class="text-3xl font-bold text-gray-800">給与明細管理システム</h1>
                    <p class="text-gray-600 mt-2">ログインまたは新規登録</p>
                </div>
                
                <div class="space-y-4" id="authForms">
                    <!-- ログインフォーム -->
                    <div id="loginForm" class="space-y-4">
                        <h2 class="text-xl font-bold text-gray-700">ログイン</h2>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                            <input type="email" id="loginEmail" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="email@example.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                            <input type="password" id="loginPassword" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="パスワード">
                        </div>
                        <button onclick="login()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            <i class="fas fa-sign-in-alt mr-2"></i>ログイン
                        </button>
                    </div>
                    
                    <div class="border-t pt-4">
                        <button onclick="toggleRegisterForm()" class="w-full text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                            新規登録はこちら
                        </button>
                    </div>
                    
                    <!-- 登録フォーム（初期は非表示） -->
                    <div id="registerForm" class="space-y-4 hidden">
                        <h2 class="text-xl font-bold text-gray-700">新規登録</h2>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">氏名（任意）</label>
                            <input type="text" id="registerName" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="山田太郎">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
                            <input type="email" id="registerEmail" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="email@example.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">パスワード *</label>
                            <input type="password" id="registerPassword" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="8文字以上">
                        </div>
                        <button onclick="register()" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                            <i class="fas fa-user-plus mr-2"></i>登録
                        </button>
                        <button onclick="toggleRegisterForm()" class="w-full text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            ログインに戻る
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

// === ダッシュボードビュー ===
function renderDashboardView() {
    return `
        <div class="min-h-screen bg-gray-50">
            <!-- ヘッダー -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-file-invoice-dollar text-3xl text-blue-600"></i>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800">給与明細管理</h1>
                            <p class="text-sm text-gray-600">${state.currentUser?.name || state.currentUser?.email}</p>
                        </div>
                    </div>
                    <button onclick="logout()" class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <i class="fas fa-sign-out-alt mr-2"></i>ログアウト
                    </button>
                </div>
            </header>
            
            <!-- メインコンテンツ -->
            <main class="max-w-7xl mx-auto px-4 py-8">
                <div class="mb-6 flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-list mr-2 text-blue-600"></i>給与明細一覧
                    </h2>
                    <button onclick="showView('editor'); newPayslip();" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                        <i class="fas fa-plus mr-2"></i>新規作成
                    </button>
                </div>
                
                <div id="payslipList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- 給与明細リストがここに表示されます -->
                </div>
            </main>
        </div>
    `;
}

// === エディタービュー ===
function renderEditorView() {
    const years = [];
    for (let i = 2022; i <= 2030; i++) {
        years.push(i);
    }
    const months = Array.from({length: 12}, (_, i) => i + 1);
    const days = Array.from({length: 31}, (_, i) => i + 1);
    
    return `
        <div class="min-h-screen bg-gray-50">
            <!-- ヘッダー -->
            <header class="bg-white shadow-sm border-b no-print">
                <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <button onclick="showView('dashboard')" class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>戻る
                    </button>
                    <div class="flex space-x-2">
                        <button onclick="savePayslip()" class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存
                        </button>
                        <button onclick="generatePDF()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            <i class="fas fa-file-pdf mr-2"></i>PDF出力
                        </button>
                        <button onclick="clearForm()" class="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                            <i class="fas fa-eraser mr-2"></i>クリア
                        </button>
                    </div>
                </div>
            </header>
            
            <main class="max-w-7xl mx-auto px-4 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- 入力フォーム -->
                    <div class="bg-white rounded-lg shadow-lg p-6 no-print">
                        <h2 class="text-2xl font-bold mb-6 text-gray-800">
                            <i class="fas fa-edit mr-2 text-blue-600"></i>給与明細入力
                        </h2>
                        
                        <form id="payslipForm" class="space-y-6">
                            <!-- 基本情報 -->
                            <div class="border-b pb-4">
                                <h3 class="font-bold text-lg mb-3 text-gray-700">基本情報</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">発行年 *</label>
                                        <select id="issueYear" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="updatePreview()">
                                            ${years.map(y => `<option value="${y}" ${y === new Date().getFullYear() ? 'selected' : ''}>${y}年</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">発行月 *</label>
                                        <select id="issueMonth" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="updatePreview()">
                                            ${months.map(m => `<option value="${m}" ${m === new Date().getMonth() + 1 ? 'selected' : ''}>${m}月</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">氏名 *</label>
                                    <input type="text" id="employeeName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="山田太郎">
                                </div>
                            </div>
                            
                            <!-- 会社情報 -->
                            <div class="border-b pb-4">
                                <h3 class="font-bold text-lg mb-3 text-gray-700">会社情報（任意）</h3>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">会社名</label>
                                    <input type="text" id="companyName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="株式会社〇〇">
                                </div>
                                <div class="mt-3 hidden">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">会社ロゴURL</label>
                                    <input type="url" id="companyLogo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()">
                                </div>
                            </div>
                            
                            <!-- 労働期間 -->
                            <div class="border-b pb-4">
                                <h3 class="font-bold text-lg mb-3 text-gray-700">労働期間</h3>
                                <div class="grid grid-cols-3 gap-2 mb-2">
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">開始年</label>
                                        <select id="workStartYear" class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg" onchange="updatePreview()">
                                            ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">開始月</label>
                                        <select id="workStartMonth" class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg" onchange="updatePreview()">
                                            ${months.map(m => `<option value="${m}">${m}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">開始日</label>
                                        <select id="workStartDay" class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg" onchange="updatePreview()">
                                            ${days.map(d => `<option value="${d}" ${d === 1 ? 'selected' : ''}>${d}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-2">
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">終了年</label>
                                        <select id="workEndYear" class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg" onchange="updatePreview()">
                                            ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">終了月</label>
                                        <select id="workEndMonth" class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg" onchange="updatePreview()">
                                            ${months.map(m => `<option value="${m}">${m}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">終了日</label>
                                        <select id="workEndDay" class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg" onchange="updatePreview()">
                                            ${days.map(d => `<option value="${d}">${d}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 勤怠情報 -->
                            <div class="border-b pb-4">
                                <h3 class="font-bold text-lg mb-3 text-gray-700">勤怠情報</h3>
                                <div class="grid grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">労働日数</label>
                                        <input type="number" id="workingDays" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="22" step="0.1">
                                        <span class="text-xs text-gray-500">日</span>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">労働時間</label>
                                        <input type="number" id="workingHours" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="176" step="0.1">
                                        <span class="text-xs text-gray-500">時間</span>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">時間外</label>
                                        <input type="number" id="overtimeHours" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="10" step="0.1">
                                        <span class="text-xs text-gray-500">時間</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 支給項目 -->
                            <div class="border-b pb-4">
                                <h3 class="font-bold text-lg mb-3 text-gray-700 text-blue-600">支給項目</h3>
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">基本給 *</label>
                                        <input type="number" id="basicSalary" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="300000">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">非課税通勤費</label>
                                        <input type="number" id="taxFreeCommute" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">残業手当</label>
                                        <input type="number" id="overtimePay" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">その他手当</label>
                                        <input type="number" id="otherAllowance" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div class="bg-blue-50 p-3 rounded-lg">
                                        <div class="flex justify-between items-center">
                                            <span class="font-bold">支給額合計</span>
                                            <span id="totalPaymentDisplay" class="text-xl font-bold text-blue-600">0円</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 控除項目 -->
                            <div class="border-b pb-4">
                                <h3 class="font-bold text-lg mb-3 text-gray-700 text-red-600">控除項目</h3>
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">所得税 *</label>
                                        <input type="number" id="incomeTax" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">住民税 *</label>
                                        <input type="number" id="residentTax" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">健康保険 *</label>
                                        <input type="number" id="healthInsurance" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">厚生年金 *</label>
                                        <input type="number" id="pensionInsurance" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">雇用保険 *</label>
                                        <input type="number" id="employmentInsurance" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">その他控除</label>
                                        <input type="number" id="otherDeduction" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" oninput="updatePreview()" placeholder="0">
                                    </div>
                                    <div class="bg-red-50 p-3 rounded-lg">
                                        <div class="flex justify-between items-center">
                                            <span class="font-bold">控除額合計</span>
                                            <span id="totalDeductionDisplay" class="text-xl font-bold text-red-600">0円</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 差引支給額 -->
                            <div class="bg-green-50 p-4 rounded-lg">
                                <div class="flex justify-between items-center">
                                    <span class="text-xl font-bold">差引支給額（手取り）</span>
                                    <span id="netPaymentDisplay" class="text-3xl font-bold text-green-600">0円</span>
                                </div>
                            </div>
                            
                            <!-- フォーマット選択 -->
                            <div>
                                <h3 class="font-bold text-lg mb-3 text-gray-700">フォーマット選択</h3>
                                <select id="formatSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="changeFormat()">
                                    <option value="1">フォーマット1: 伝統的な縦型</option>
                                    <option value="2">フォーマット2: モダンな横型</option>
                                    <option value="3">フォーマット3: 詳細型</option>
                                    <option value="4">フォーマット4: コンパクト型</option>
                                    <option value="5">フォーマット5: 二段組</option>
                                    <option value="6">フォーマット6: 半期一覧</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    
                    <!-- プレビュー -->
                    <div class="lg:sticky lg:top-4 self-start">
                        <div class="bg-white rounded-lg shadow-lg p-6">
                            <h2 class="text-2xl font-bold mb-6 text-gray-800 no-print">
                                <i class="fas fa-eye mr-2 text-blue-600"></i>プレビュー
                            </h2>
                            <div id="previewContainer" class="overflow-auto" style="max-height: 800px;">
                                <!-- プレビューがここに表示されます -->
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

function setupFormListeners() {
    // フォーム入力時に自動プレビュー更新
    const form = document.getElementById('payslipForm');
    if (form) {
        form.addEventListener('input', updatePreview);
    }
}

function changeFormat() {
    state.selectedFormat = parseInt(document.getElementById('formatSelect').value);
    updatePreview();
}

// === PDF生成機能 ===
function generatePDF() {
    const data = collectFormData();
    
    if (!validateFormData(data)) {
        return;
    }
    
    showNotification('PDF生成中...', 'info');
    
    // jsPDFを使用してPDF生成
    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // プレビューのHTMLをキャプチャしてPDFに変換
            const element = document.getElementById('previewContainer');
            const formatName = `給与明細_${data.issue_year}年${data.issue_month}月_${data.employee_name}`;
            
            // 簡易的なPDF生成（本格的にはhtml2canvasと組み合わせる）
            doc.setFontSize(16);
            doc.text('給与明細書', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`発行年月: ${data.issue_year}年${data.issue_month}月`, 20, 40);
            doc.text(`氏名: ${data.employee_name}`, 20, 50);
            doc.text(`会社名: ${data.company_name || ''}`, 20, 60);
            
            doc.text('【支給】', 20, 80);
            doc.text(`基本給: ${data.basic_salary.toLocaleString()}円`, 30, 90);
            doc.text(`非課税通勤費: ${data.tax_free_commute.toLocaleString()}円`, 30, 100);
            doc.text(`残業手当: ${data.overtime_pay.toLocaleString()}円`, 30, 110);
            doc.text(`その他手当: ${data.other_allowance.toLocaleString()}円`, 30, 120);
            doc.text(`支給額合計: ${data.total_payment.toLocaleString()}円`, 30, 130);
            
            doc.text('【控除】', 20, 150);
            doc.text(`所得税: ${data.income_tax.toLocaleString()}円`, 30, 160);
            doc.text(`住民税: ${data.resident_tax.toLocaleString()}円`, 30, 170);
            doc.text(`健康保険: ${data.health_insurance.toLocaleString()}円`, 30, 180);
            doc.text(`厚生年金: ${data.pension_insurance.toLocaleString()}円`, 30, 190);
            doc.text(`雇用保険: ${data.employment_insurance.toLocaleString()}円`, 30, 200);
            doc.text(`その他控除: ${data.other_deduction.toLocaleString()}円`, 30, 210);
            doc.text(`控除額合計: ${data.total_deduction.toLocaleString()}円`, 30, 220);
            
            doc.setFontSize(14);
            doc.text(`差引支給額: ${data.net_payment.toLocaleString()}円`, 20, 240);
            
            doc.save(`${formatName}.pdf`);
            showNotification('PDFを生成しました', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            showNotification('PDF生成に失敗しました', 'error');
        }
    }, 500);
}

// === 初期化 ===
async function initialize() {
    if (state.token) {
        try {
            const result = await api.get('/api/auth/me');
            state.currentUser = result.user;
            showView('dashboard');
            await loadPayslips();
        } catch (error) {
            // トークンが無効な場合はログアウト
            logout();
        }
    } else {
        showView('login');
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', initialize);
