/**
 * メインアプリケーションJS
 * UI制御、イベントハンドラ、ビジネスロジック
 */

// グローバル変数
let currentEditingId = null;
let currentView = 'dashboard';

/**
 * アプリケーション初期化
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // データベース初期化
        await db.init();
        console.log('データベース初期化完了');

        // 年月の選択肢を初期化
        initializeDateSelectors();

        // イベントリスナーを設定
        setupEventListeners();

        // ダッシュボードを読み込み
        await loadDashboard();

        showNotification('アプリケーションを起動しました', 'success');
    } catch (error) {
        console.error('初期化エラー:', error);
        showNotification('アプリケーションの初期化に失敗しました', 'error');
    }
});

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // ナビゲーション
    document.getElementById('btn-dashboard').addEventListener('click', () => switchView('dashboard'));
    document.getElementById('btn-templates').addEventListener('click', () => switchView('templates'));
    document.getElementById('btn-import-export').addEventListener('click', () => switchView('data-management'));

    // ダッシュボード - アクション
    document.getElementById('btn-new-payslip').addEventListener('click', createNewPayslip);
    document.getElementById('btn-copy-previous').addEventListener('click', showCopyPreviousModal);
    document.getElementById('btn-from-template').addEventListener('click', showTemplateSelectionModal);
    document.getElementById('btn-export-semi-annual').addEventListener('click', showSemiAnnualModal);

    // エディター - アクション
    document.getElementById('btn-back-to-dashboard').addEventListener('click', () => switchView('dashboard'));
    document.getElementById('btn-save-payslip').addEventListener('click', savePayslip);
    document.getElementById('btn-save-template').addEventListener('click', saveAsTemplate);
    document.getElementById('btn-clear-form').addEventListener('click', clearForm);
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);
    document.getElementById('btn-delete-payslip').addEventListener('click', deleteCurrentPayslip);

    // テンプレート管理
    document.getElementById('btn-new-template').addEventListener('click', openTemplateEditor);

    // データ管理
    document.getElementById('btn-export-data').addEventListener('click', exportData);
    document.getElementById('btn-import-data').addEventListener('click', () => {
        document.getElementById('import-file-input').click();
    });
    document.getElementById('import-file-input').addEventListener('change', importData);
    document.getElementById('btn-clear-all-data').addEventListener('click', clearAllData);

    // フォーム入力時のリアルタイムプレビュー
    const formInputs = document.querySelectorAll('#payslip-form input, #payslip-form select');
    formInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });

    // ロゴアップロード
    document.getElementById('company-logo').addEventListener('change', handleLogoUpload);

    // モーダルのクローズボタン
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // モーダル背景クリックで閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // テンプレートフォーム送信
    document.getElementById('template-form').addEventListener('submit', saveTemplate);

    // 半期PDF生成
    document.getElementById('btn-generate-semi-annual').addEventListener('click', generateSemiAnnual);
}

/**
 * ビューを切り替え
 */
async function switchView(viewName) {
    currentView = viewName;

    // すべてのビューとナビゲーションボタンを非アクティブに
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // 選択されたビューをアクティブに
    const viewElement = document.getElementById(`${viewName}-view`);
    if (viewElement) viewElement.classList.add('active');

    // 対応するナビゲーションボタンをアクティブに
    const navButtons = {
        'dashboard': 'btn-dashboard',
        'templates': 'btn-templates',
        'data-management': 'btn-import-export'
    };
    const btnId = navButtons[viewName];
    if (btnId) {
        document.getElementById(btnId).classList.add('active');
    }

    // ビューに応じてデータを読み込み
    switch (viewName) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'templates':
            await loadTemplates();
            break;
        case 'data-management':
            // 特に何もしない
            break;
        case 'editor':
            // エディタービューは別途処理
            break;
    }
}

/**
 * ダッシュボードを読み込み
 */
async function loadDashboard() {
    try {
        const payslips = await db.getAllPayslips();
        const listContainer = document.getElementById('payslip-list');
        const emptyState = document.getElementById('empty-state');

        if (payslips.length === 0) {
            listContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        listContainer.style.display = 'grid';
        emptyState.style.display = 'none';
        listContainer.innerHTML = '';

        payslips.forEach(payslip => {
            const card = createPayslipCard(payslip);
            listContainer.appendChild(card);
        });
    } catch (error) {
        console.error('ダッシュボード読み込みエラー:', error);
        showNotification('給与明細の読み込みに失敗しました', 'error');
    }
}

/**
 * 給与明細カードを作成
 */
function createPayslipCard(payslip) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <div>
                <div class="card-title">${payslip.issueYear}年 ${payslip.issueMonth}月</div>
                <div class="card-meta">${payslip.employeeName || '氏名未設定'}</div>
            </div>
        </div>
        <div class="card-info">
            <div class="card-info-item">
                <span class="card-info-label">支給額</span>
                <span class="card-info-value">¥${formatCurrency(payslip.totalEarnings)}</span>
            </div>
            <div class="card-info-item">
                <span class="card-info-label">控除額</span>
                <span class="card-info-value">¥${formatCurrency(payslip.totalDeductions)}</span>
            </div>
            <div class="card-info-item">
                <span class="card-info-label">手取り額</span>
                <span class="card-info-value" style="color: var(--primary-color); font-weight: 700;">¥${formatCurrency(payslip.netPay)}</span>
            </div>
        </div>
        <div class="card-actions">
            <button class="card-btn card-btn-edit" onclick="editPayslip('${payslip.id}')">
                <i class="fas fa-edit"></i> 編集
            </button>
            <button class="card-btn card-btn-delete" onclick="deletePayslip('${payslip.id}')">
                <i class="fas fa-trash"></i> 削除
            </button>
        </div>
    `;

    // カードクリックで編集
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.card-actions')) {
            editPayslip(payslip.id);
        }
    });

    return card;
}

/**
 * 給与明細を編集
 */
async function editPayslip(id) {
    try {
        const payslip = await db.getPayslipById(id);
        if (!payslip) {
            showNotification('給与明細が見つかりません', 'error');
            return;
        }

        currentEditingId = id;
        loadPayslipToForm(payslip);
        
        // 削除ボタンを表示
        document.getElementById('btn-delete-payslip').style.display = 'inline-flex';
        document.getElementById('editor-title').textContent = '給与明細編集';

        // エディタービューに切り替え
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('editor-view').classList.add('active');
        
        // プレビューを更新
        updatePreview();
    } catch (error) {
        console.error('給与明細編集エラー:', error);
        showNotification('給与明細の読み込みに失敗しました', 'error');
    }
}

/**
 * 給与明細を削除
 */
async function deletePayslip(id) {
    if (!confirm('この給与明細を削除してもよろしいですか？\nこの操作は取り消せません。')) {
        return;
    }

    try {
        await db.deletePayslip(id);
        showNotification('給与明細を削除しました', 'success');
        await loadDashboard();
    } catch (error) {
        console.error('給与明細削除エラー:', error);
        showNotification('給与明細の削除に失敗しました', 'error');
    }
}

/**
 * 現在編集中の給与明細を削除
 */
async function deleteCurrentPayslip() {
    if (!currentEditingId) return;
    
    await deletePayslip(currentEditingId);
    switchView('dashboard');
}

/**
 * 新規給与明細を作成
 */
function createNewPayslip() {
    currentEditingId = null;
    clearForm();
    
    // 削除ボタンを非表示
    document.getElementById('btn-delete-payslip').style.display = 'none';
    document.getElementById('editor-title').textContent = '給与明細作成';

    // 現在の年月を初期値に設定
    const now = new Date();
    document.getElementById('issue-year').value = now.getFullYear();
    document.getElementById('issue-month').value = now.getMonth() + 1;

    // 労働期間を当月に設定
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();

    document.getElementById('work-start-year').value = year;
    document.getElementById('work-start-month').value = month;
    document.getElementById('work-start-day').value = 1;
    document.getElementById('work-end-year').value = year;
    document.getElementById('work-end-month').value = month;
    document.getElementById('work-end-day').value = lastDay;

    // エディタービューに切り替え
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('editor-view').classList.add('active');
    
    updatePreview();
}

/**
 * 給与明細を保存
 */
async function savePayslip() {
    try {
        // バリデーション
        const form = document.getElementById('payslip-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const payslipData = getFormData();

        // 既存のIDがあれば編集、なければ新規作成
        if (currentEditingId) {
            payslipData.id = currentEditingId;
        }

        await db.savePayslip(payslipData);
        
        showNotification('給与明細を保存しました', 'success');
        switchView('dashboard');
    } catch (error) {
        console.error('給与明細保存エラー:', error);
        showNotification('給与明細の保存に失敗しました', 'error');
    }
}

/**
 * フォームデータを取得
 */
function getFormData() {
    // 基本情報
    const issueYear = parseInt(document.getElementById('issue-year').value);
    const issueMonth = parseInt(document.getElementById('issue-month').value);
    const employeeName = document.getElementById('employee-name').value;
    const companyName = document.getElementById('company-name').value;
    const companyLogo = document.getElementById('logo-preview').querySelector('img')?.src || null;

    // 労働期間
    const workStartYear = parseInt(document.getElementById('work-start-year').value) || null;
    const workStartMonth = parseInt(document.getElementById('work-start-month').value) || null;
    const workStartDay = parseInt(document.getElementById('work-start-day').value) || null;
    const workEndYear = parseInt(document.getElementById('work-end-year').value) || null;
    const workEndMonth = parseInt(document.getElementById('work-end-month').value) || null;
    const workEndDay = parseInt(document.getElementById('work-end-day').value) || null;

    // 勤怠情報
    const workingDays = parseFloat(document.getElementById('working-days').value) || 0;
    const workingHours = parseFloat(document.getElementById('working-hours').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtime-hours').value) || 0;

    // 支給項目
    const basicSalary = parseInt(document.getElementById('basic-salary').value) || 0;
    const taxFreeCommute = parseInt(document.getElementById('tax-free-commute').value) || 0;
    const overtimePay = parseInt(document.getElementById('overtime-pay').value) || 0;
    const otherAllowance = parseInt(document.getElementById('other-allowance').value) || 0;
    const totalEarnings = basicSalary + taxFreeCommute + overtimePay + otherAllowance;

    // 控除項目
    const incomeTax = parseInt(document.getElementById('income-tax').value) || 0;
    const residentTax = parseInt(document.getElementById('resident-tax').value) || 0;
    const healthInsurance = parseInt(document.getElementById('health-insurance').value) || 0;
    const pensionInsurance = parseInt(document.getElementById('pension-insurance').value) || 0;
    const employmentInsurance = parseInt(document.getElementById('employment-insurance').value) || 0;
    const otherDeduction = parseInt(document.getElementById('other-deduction').value) || 0;
    const totalDeductions = incomeTax + residentTax + healthInsurance + pensionInsurance + employmentInsurance + otherDeduction;

    // 差引支給額
    const netPay = totalEarnings - totalDeductions;

    // フォーマット選択
    const selectedFormat = parseInt(document.getElementById('format-select').value);

    return {
        issueYear,
        issueMonth,
        employeeName,
        companyName,
        companyLogo,
        workStartYear,
        workStartMonth,
        workStartDay,
        workEndYear,
        workEndMonth,
        workEndDay,
        workingDays,
        workingHours,
        overtimeHours,
        basicSalary,
        taxFreeCommute,
        overtimePay,
        otherAllowance,
        totalEarnings,
        incomeTax,
        residentTax,
        healthInsurance,
        pensionInsurance,
        employmentInsurance,
        otherDeduction,
        totalDeductions,
        netPay,
        selectedFormat
    };
}

/**
 * 給与明細データをフォームに読み込み
 */
function loadPayslipToForm(payslip) {
    // 基本情報
    document.getElementById('issue-year').value = payslip.issueYear;
    document.getElementById('issue-month').value = payslip.issueMonth;
    document.getElementById('employee-name').value = payslip.employeeName || '';
    document.getElementById('company-name').value = payslip.companyName || '';

    // ロゴ
    if (payslip.companyLogo) {
        const logoPreview = document.getElementById('logo-preview');
        logoPreview.innerHTML = `<img src="${payslip.companyLogo}" alt="会社ロゴ">`;
    }

    // 労働期間
    document.getElementById('work-start-year').value = payslip.workStartYear || '';
    document.getElementById('work-start-month').value = payslip.workStartMonth || '';
    document.getElementById('work-start-day').value = payslip.workStartDay || '';
    document.getElementById('work-end-year').value = payslip.workEndYear || '';
    document.getElementById('work-end-month').value = payslip.workEndMonth || '';
    document.getElementById('work-end-day').value = payslip.workEndDay || '';

    // 勤怠情報
    document.getElementById('working-days').value = payslip.workingDays || '';
    document.getElementById('working-hours').value = payslip.workingHours || '';
    document.getElementById('overtime-hours').value = payslip.overtimeHours || '';

    // 支給項目
    document.getElementById('basic-salary').value = payslip.basicSalary || '';
    document.getElementById('tax-free-commute').value = payslip.taxFreeCommute || '';
    document.getElementById('overtime-pay').value = payslip.overtimePay || '';
    document.getElementById('other-allowance').value = payslip.otherAllowance || '';

    // 控除項目
    document.getElementById('income-tax').value = payslip.incomeTax || '';
    document.getElementById('resident-tax').value = payslip.residentTax || '';
    document.getElementById('health-insurance').value = payslip.healthInsurance || '';
    document.getElementById('pension-insurance').value = payslip.pensionInsurance || '';
    document.getElementById('employment-insurance').value = payslip.employmentInsurance || '';
    document.getElementById('other-deduction').value = payslip.otherDeduction || '';

    // フォーマット選択
    document.getElementById('format-select').value = payslip.selectedFormat || 1;
}

/**
 * フォームをクリア
 */
function clearForm() {
    document.getElementById('payslip-form').reset();
    document.getElementById('logo-preview').innerHTML = '';
    updatePreview();
}

/**
 * プレビューを更新
 */
function updatePreview() {
    const data = getFormData();
    const formatId = document.getElementById('format-select').value;
    const previewHtml = generatePayslipHTML(formatId, data);
    document.getElementById('preview-container').innerHTML = previewHtml;

    // 合計金額を表示
    document.getElementById('total-earnings').textContent = `${formatCurrency(data.totalEarnings)} 円`;
    document.getElementById('total-deductions').textContent = `${formatCurrency(data.totalDeductions)} 円`;
    document.getElementById('net-pay').textContent = `${formatCurrency(data.netPay)} 円`;
}

/**
 * PDF出力
 */
async function exportPDF() {
    try {
        const data = getFormData();
        
        if (!data.employeeName) {
            showNotification('氏名を入力してください', 'warning');
            return;
        }

        showNotification('PDFを生成しています...', 'info');
        
        await generateMonthlyPDF(data);
        
        showNotification('PDFを出力しました', 'success');
    } catch (error) {
        console.error('PDF出力エラー:', error);
        showNotification('PDFの出力に失敗しました', 'error');
    }
}

/**
 * ロゴアップロード処理
 */
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('画像ファイルを選択してください', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const logoPreview = document.getElementById('logo-preview');
        logoPreview.innerHTML = `<img src="${event.target.result}" alt="会社ロゴ">`;
        updatePreview();
    };
    reader.readAsDataURL(file);
}

/**
 * 年月日の選択肢を初期化
 */
function initializeDateSelectors() {
    // 年の選択肢（2020-2030）
    const yearSelectors = ['issue-year', 'work-start-year', 'work-end-year', 'semi-annual-start-year'];
    yearSelectors.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        for (let year = 2020; year <= 2030; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
    });

    // 月の選択肢（1-12）
    const monthSelectors = ['issue-month', 'work-start-month', 'work-end-month', 'semi-annual-start-month'];
    monthSelectors.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            select.appendChild(option);
        }
    });

    // 日の選択肢（1-31）
    const daySelectors = ['work-start-day', 'work-end-day'];
    daySelectors.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        for (let day = 1; day <= 31; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            select.appendChild(option);
        }
    });
}

/**
 * 通知を表示
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * ===========================================
 * 前月データコピー機能
 * ===========================================
 */

/**
 * 前月データコピーモーダルを表示
 */
async function showCopyPreviousModal() {
    try {
        const payslips = await db.getAllPayslips();
        
        if (payslips.length === 0) {
            showNotification('コピー元のデータがありません。新規作成してください。', 'warning');
            return;
        }

        const modal = document.getElementById('modal-select-previous');
        const listContainer = document.getElementById('previous-payslip-list');
        
        listContainer.innerHTML = '';

        payslips.forEach(payslip => {
            const item = document.createElement('div');
            item.className = 'modal-list-item';
            item.innerHTML = `
                <div class="modal-list-item-title">${payslip.issueYear}年 ${payslip.issueMonth}月分</div>
                <div class="modal-list-item-meta">
                    ${payslip.employeeName || '氏名未設定'} / 
                    手取り: ¥${formatCurrency(payslip.netPay)}
                </div>
            `;
            
            item.addEventListener('click', () => {
                copyFromPrevious(payslip);
                modal.classList.remove('active');
            });
            
            listContainer.appendChild(item);
        });

        modal.classList.add('active');
    } catch (error) {
        console.error('前月データコピーエラー:', error);
        showNotification('前月データの取得に失敗しました', 'error');
    }
}

/**
 * 前月データからコピー
 */
function copyFromPrevious(sourcePayslip) {
    // 確認ダイアログ
    const nextMonth = getNextMonth(sourcePayslip.issueYear, sourcePayslip.issueMonth);
    const confirmMessage = `${sourcePayslip.issueYear}年${sourcePayslip.issueMonth}月のデータをコピーして\n${nextMonth.year}年${nextMonth.month}月の給与明細を作成しますか？`;
    
    if (!confirm(confirmMessage)) {
        return;
    }

    // 新規作成モードに
    currentEditingId = null;
    clearForm();
    
    document.getElementById('btn-delete-payslip').style.display = 'none';
    document.getElementById('editor-title').textContent = '給与明細作成（前月からコピー）';

    // コピーされる項目
    document.getElementById('employee-name').value = sourcePayslip.employeeName || '';
    document.getElementById('company-name').value = sourcePayslip.companyName || '';
    
    if (sourcePayslip.companyLogo) {
        const logoPreview = document.getElementById('logo-preview');
        logoPreview.innerHTML = `<img src="${sourcePayslip.companyLogo}" alt="会社ロゴ">`;
    }
    
    document.getElementById('basic-salary').value = sourcePayslip.basicSalary || '';
    document.getElementById('tax-free-commute').value = sourcePayslip.taxFreeCommute || '';
    document.getElementById('other-allowance').value = sourcePayslip.otherAllowance || '';
    document.getElementById('resident-tax').value = sourcePayslip.residentTax || '';
    document.getElementById('health-insurance').value = sourcePayslip.healthInsurance || '';
    document.getElementById('pension-insurance').value = sourcePayslip.pensionInsurance || '';
    document.getElementById('employment-insurance').value = sourcePayslip.employmentInsurance || '';
    document.getElementById('format-select').value = sourcePayslip.selectedFormat || 1;

    // 自動更新される項目
    document.getElementById('issue-year').value = nextMonth.year;
    document.getElementById('issue-month').value = nextMonth.month;

    // 労働期間を新しい月に設定
    const lastDay = new Date(nextMonth.year, nextMonth.month, 0).getDate();
    document.getElementById('work-start-year').value = nextMonth.year;
    document.getElementById('work-start-month').value = nextMonth.month;
    document.getElementById('work-start-day').value = 1;
    document.getElementById('work-end-year').value = nextMonth.year;
    document.getElementById('work-end-month').value = nextMonth.month;
    document.getElementById('work-end-day').value = lastDay;

    // エディタービューに切り替え
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('editor-view').classList.add('active');
    
    updatePreview();
    
    showNotification(`${sourcePayslip.issueYear}年${sourcePayslip.issueMonth}月のデータをコピーしました。空欄の項目を入力してください。`, 'success');
}

/**
 * 翌月の年月を取得
 */
function getNextMonth(year, month) {
    const nextMonth = month + 1;
    if (nextMonth > 12) {
        return { year: year + 1, month: 1 };
    }
    return { year: year, month: nextMonth };
}

/**
 * ===========================================
 * テンプレート機能
 * ===========================================
 */

/**
 * テンプレート一覧を読み込み
 */
async function loadTemplates() {
    try {
        const templates = await db.getAllTemplates();
        const listContainer = document.getElementById('template-list');
        const emptyState = document.getElementById('template-empty-state');

        if (templates.length === 0) {
            listContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        listContainer.style.display = 'grid';
        emptyState.style.display = 'none';
        listContainer.innerHTML = '';

        templates.forEach(template => {
            const card = createTemplateCard(template);
            listContainer.appendChild(card);
        });
    } catch (error) {
        console.error('テンプレート読み込みエラー:', error);
        showNotification('テンプレートの読み込みに失敗しました', 'error');
    }
}

/**
 * テンプレートカードを作成
 */
function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const includedFields = [];
    if (template.includedFields) {
        if (template.includedFields.basicSalary) includedFields.push('基本給');
        if (template.includedFields.taxFreeCommute) includedFields.push('通勤費');
        if (template.includedFields.otherAllowance) includedFields.push('手当');
        if (template.includedFields.residentTax) includedFields.push('住民税');
        if (template.includedFields.healthInsurance) includedFields.push('健保');
        if (template.includedFields.pensionInsurance) includedFields.push('年金');
        if (template.includedFields.employmentInsurance) includedFields.push('雇保');
    }

    card.innerHTML = `
        <div class="card-header">
            <div>
                <div class="card-title">${template.name}</div>
                <div class="card-meta">${template.companyName || '会社名未設定'}</div>
            </div>
        </div>
        <div class="card-info">
            <div class="card-info-item">
                <span class="card-info-label">含まれる項目</span>
                <span class="card-info-value">${includedFields.join(', ') || 'なし'}</span>
            </div>
            <div class="card-info-item">
                <span class="card-info-label">フォーマット</span>
                <span class="card-info-value">フォーマット${template.selectedFormat || 1}</span>
            </div>
        </div>
        <div class="card-actions">
            <button class="card-btn card-btn-use" onclick="useTemplate('${template.id}')">
                <i class="fas fa-check"></i> 使用
            </button>
            <button class="card-btn card-btn-edit" onclick="editTemplate('${template.id}')">
                <i class="fas fa-edit"></i> 編集
            </button>
            <button class="card-btn card-btn-duplicate" onclick="duplicateTemplate('${template.id}')">
                <i class="fas fa-copy"></i> 複製
            </button>
            <button class="card-btn card-btn-delete" onclick="deleteTemplate('${template.id}')">
                <i class="fas fa-trash"></i> 削除
            </button>
        </div>
    `;

    return card;
}

/**
 * テンプレートエディターを開く（新規作成）
 */
function openTemplateEditor(templateId = null) {
    const modal = document.getElementById('modal-template-editor');
    const form = document.getElementById('template-form');
    const title = document.getElementById('template-editor-title');
    
    if (templateId) {
        title.innerHTML = '<i class="fas fa-edit"></i> テンプレート編集';
        // 編集モード（別途実装）
    } else {
        title.innerHTML = '<i class="fas fa-plus"></i> 新規テンプレート作成';
        form.reset();
    }
    
    form.dataset.templateId = templateId || '';
    modal.classList.add('active');
}

/**
 * テンプレートを保存
 */
async function saveTemplate(e) {
    e.preventDefault();
    
    try {
        const form = e.target;
        const templateId = form.dataset.templateId;
        
        const templateData = {
            name: document.getElementById('template-name').value,
            companyName: document.getElementById('template-company-name').value,
            defaultValues: {},
            includedFields: {},
            selectedFormat: parseInt(document.getElementById('template-format').value)
        };
        
        // 含まれる項目とその値を取得
        const fields = [
            'basicSalary',
            'taxFreeCommute',
            'otherAllowance',
            'residentTax',
            'healthInsurance',
            'pensionInsurance',
            'employmentInsurance'
        ];
        
        fields.forEach(field => {
            const checkbox = document.getElementById(`include-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            const input = document.getElementById(`template-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            
            if (checkbox && checkbox.checked) {
                templateData.includedFields[field] = true;
                templateData.defaultValues[field] = parseInt(input.value) || 0;
            } else {
                templateData.includedFields[field] = false;
            }
        });
        
        // バリデーション
        if (!templateData.name) {
            showNotification('テンプレート名を入力してください', 'warning');
            return;
        }
        
        const hasAtLeastOneField = Object.values(templateData.includedFields).some(v => v === true);
        if (!hasAtLeastOneField) {
            showNotification('少なくとも1つの項目を含めてください', 'warning');
            return;
        }
        
        // 既存のIDがある場合は編集
        if (templateId) {
            templateData.id = templateId;
        }
        
        await db.saveTemplate(templateData);
        
        showNotification('テンプレートを保存しました', 'success');
        
        // モーダルを閉じる
        document.getElementById('modal-template-editor').classList.remove('active');
        
        // テンプレート一覧を再読み込み
        if (currentView === 'templates') {
            await loadTemplates();
        }
    } catch (error) {
        console.error('テンプレート保存エラー:', error);
        showNotification('テンプレートの保存に失敗しました', 'error');
    }
}

/**
 * テンプレートを使用して新規作成
 */
async function useTemplate(templateId) {
    try {
        const template = await db.getTemplateById(templateId);
        if (!template) {
            showNotification('テンプレートが見つかりません', 'error');
            return;
        }
        
        // 新規作成モードに
        currentEditingId = null;
        clearForm();
        
        document.getElementById('btn-delete-payslip').style.display = 'none';
        document.getElementById('editor-title').textContent = `給与明細作成（${template.name}）`;
        
        // テンプレートの値を適用
        document.getElementById('company-name').value = template.companyName || '';
        
        Object.keys(template.defaultValues).forEach(field => {
            if (template.includedFields[field]) {
                const input = document.getElementById(field.replace(/([A-Z])/g, '-$1').toLowerCase());
                if (input) {
                    input.value = template.defaultValues[field];
                }
            }
        });
        
        document.getElementById('format-select').value = template.selectedFormat || 1;
        
        // 現在の年月を設定
        const now = new Date();
        document.getElementById('issue-year').value = now.getFullYear();
        document.getElementById('issue-month').value = now.getMonth() + 1;
        
        // 労働期間を当月に設定
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const lastDay = new Date(year, month, 0).getDate();
        
        document.getElementById('work-start-year').value = year;
        document.getElementById('work-start-month').value = month;
        document.getElementById('work-start-day').value = 1;
        document.getElementById('work-end-year').value = year;
        document.getElementById('work-end-month').value = month;
        document.getElementById('work-end-day').value = lastDay;
        
        // エディタービューに切り替え
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('editor-view').classList.add('active');
        
        updatePreview();
        
        showNotification(`テンプレート「${template.name}」を適用しました`, 'success');
    } catch (error) {
        console.error('テンプレート使用エラー:', error);
        showNotification('テンプレートの読み込みに失敗しました', 'error');
    }
}

/**
 * テンプレート選択モーダルを表示
 */
async function showTemplateSelectionModal() {
    try {
        const templates = await db.getAllTemplates();
        
        if (templates.length === 0) {
            showNotification('テンプレートがありません。先にテンプレートを作成してください。', 'warning');
            return;
        }
        
        const modal = document.getElementById('modal-select-template');
        const listContainer = document.getElementById('template-selection-list');
        
        listContainer.innerHTML = '';
        
        templates.forEach(template => {
            const item = document.createElement('div');
            item.className = 'modal-list-item';
            item.innerHTML = `
                <div class="modal-list-item-title">${template.name}</div>
                <div class="modal-list-item-meta">
                    ${template.companyName || '会社名未設定'} / 
                    フォーマット${template.selectedFormat || 1}
                </div>
            `;
            
            item.addEventListener('click', () => {
                useTemplate(template.id);
                modal.classList.remove('active');
            });
            
            listContainer.appendChild(item);
        });
        
        modal.classList.add('active');
    } catch (error) {
        console.error('テンプレート選択エラー:', error);
        showNotification('テンプレートの取得に失敗しました', 'error');
    }
}

/**
 * テンプレートを編集
 */
async function editTemplate(templateId) {
    try {
        const template = await db.getTemplateById(templateId);
        if (!template) {
            showNotification('テンプレートが見つかりません', 'error');
            return;
        }
        
        // テンプレートエディターを開く
        const modal = document.getElementById('modal-template-editor');
        const form = document.getElementById('template-form');
        const title = document.getElementById('template-editor-title');
        
        title.innerHTML = '<i class="fas fa-edit"></i> テンプレート編集';
        form.dataset.templateId = templateId;
        
        // フォームに値を設定
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-company-name').value = template.companyName || '';
        document.getElementById('template-format').value = template.selectedFormat || 1;
        
        // 各フィールドの値とチェックボックスを設定
        Object.keys(template.includedFields).forEach(field => {
            const checkbox = document.getElementById(`include-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            const input = document.getElementById(`template-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            
            if (checkbox) {
                checkbox.checked = template.includedFields[field];
            }
            
            if (input && template.defaultValues[field] !== undefined) {
                input.value = template.defaultValues[field];
            }
        });
        
        modal.classList.add('active');
    } catch (error) {
        console.error('テンプレート編集エラー:', error);
        showNotification('テンプレートの読み込みに失敗しました', 'error');
    }
}

/**
 * テンプレートを複製
 */
async function duplicateTemplate(templateId) {
    try {
        const template = await db.getTemplateById(templateId);
        if (!template) {
            showNotification('テンプレートが見つかりません', 'error');
            return;
        }
        
        // IDを削除して新規テンプレートとして保存
        const newTemplate = { ...template };
        delete newTemplate.id;
        newTemplate.name = `${template.name}（コピー）`;
        
        await db.saveTemplate(newTemplate);
        
        showNotification('テンプレートを複製しました', 'success');
        await loadTemplates();
    } catch (error) {
        console.error('テンプレート複製エラー:', error);
        showNotification('テンプレートの複製に失敗しました', 'error');
    }
}

/**
 * テンプレートを削除
 */
async function deleteTemplate(templateId) {
    if (!confirm('このテンプレートを削除してもよろしいですか？\nこの操作は取り消せません。')) {
        return;
    }
    
    try {
        await db.deleteTemplate(templateId);
        showNotification('テンプレートを削除しました', 'success');
        await loadTemplates();
    } catch (error) {
        console.error('テンプレート削除エラー:', error);
        showNotification('テンプレートの削除に失敗しました', 'error');
    }
}

/**
 * 現在のフォームをテンプレートとして保存
 */
async function saveAsTemplate() {
    // 簡易版：テンプレートエディターを開いて現在の値を設定
    openTemplateEditor();
    
    const data = getFormData();
    
    // 現在のフォームの値をテンプレートフォームに適用
    document.getElementById('template-company-name').value = data.companyName || '';
    document.getElementById('template-format').value = data.selectedFormat || 1;
    
    // 各フィールドの値を設定
    const fields = {
        'basicSalary': data.basicSalary,
        'taxFreeCommute': data.taxFreeCommute,
        'otherAllowance': data.otherAllowance,
        'residentTax': data.residentTax,
        'healthInsurance': data.healthInsurance,
        'pensionInsurance': data.pensionInsurance,
        'employmentInsurance': data.employmentInsurance
    };
    
    Object.keys(fields).forEach(field => {
        const input = document.getElementById(`template-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        if (input && fields[field]) {
            input.value = fields[field];
            const checkbox = document.getElementById(`include-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            if (checkbox) checkbox.checked = true;
        }
    });
}

/**
 * ===========================================
 * 半期PDF出力機能
 * ===========================================
 */

/**
 * 半期PDF出力モーダルを表示
 */
function showSemiAnnualModal() {
    const modal = document.getElementById('modal-semi-annual');
    
    // 現在の年月を初期値に設定
    const now = new Date();
    document.getElementById('semi-annual-start-year').value = now.getFullYear();
    document.getElementById('semi-annual-start-month').value = now.getMonth() + 1;
    
    modal.classList.add('active');
}

/**
 * 半期PDF を生成
 */
async function generateSemiAnnual() {
    try {
        const startYear = parseInt(document.getElementById('semi-annual-start-year').value);
        const startMonth = parseInt(document.getElementById('semi-annual-start-month').value);
        
        if (!startYear || !startMonth) {
            showNotification('開始年月を選択してください', 'warning');
            return;
        }
        
        showNotification('半期PDFを生成しています...', 'info');
        
        // 6ヶ月分のデータを取得
        const payslips = await db.getPayslipsByDateRange(startYear, startMonth, 6);
        
        if (payslips.length === 0) {
            showNotification('指定期間の給与明細が見つかりません', 'warning');
            return;
        }
        
        // PDF生成
        await generateSemiAnnualPDF(payslips, startYear, startMonth);
        
        // モーダルを閉じる
        document.getElementById('modal-semi-annual').classList.remove('active');
        
        showNotification('半期PDFを出力しました', 'success');
    } catch (error) {
        console.error('半期PDF生成エラー:', error);
        showNotification('半期PDFの生成に失敗しました', 'error');
    }
}

/**
 * ===========================================
 * データ管理機能
 * ===========================================
 */

/**
 * データをエクスポート
 */
async function exportData() {
    try {
        const data = await db.exportAllData();
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `給与明細データ_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        showNotification('データをエクスポートしました', 'success');
    } catch (error) {
        console.error('データエクスポートエラー:', error);
        showNotification('データのエクスポートに失敗しました', 'error');
    }
}

/**
 * データをインポート
 */
async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // データのバリデーション
        if (!data.payslips || !data.templates) {
            showNotification('無効なデータ形式です', 'error');
            return;
        }
        
        if (!confirm(`${data.payslips.length}件の給与明細と${data.templates.length}件のテンプレートをインポートします。\n既存のデータと重複する場合は上書きされます。\nよろしいですか？`)) {
            return;
        }
        
        const result = await db.importData(data);
        
        showNotification(`${result.payslipsCount}件の給与明細と${result.templatesCount}件のテンプレートをインポートしました`, 'success');
        
        // 現在のビューを再読み込み
        if (currentView === 'dashboard') {
            await loadDashboard();
        } else if (currentView === 'templates') {
            await loadTemplates();
        }
    } catch (error) {
        console.error('データインポートエラー:', error);
        showNotification('データのインポートに失敗しました', 'error');
    } finally {
        // ファイル選択をリセット
        e.target.value = '';
    }
}

/**
 * 全データを削除
 */
async function clearAllData() {
    if (!confirm('全てのデータを削除してもよろしいですか？\nこの操作は取り消せません。\n\n※事前にデータをエクスポートしてバックアップすることをお勧めします。')) {
        return;
    }
    
    if (!confirm('本当に削除してもよろしいですか？\nこれは最終確認です。')) {
        return;
    }
    
    try {
        await db.clearAllData();
        
        showNotification('全データを削除しました', 'success');
        
        // ダッシュボードを再読み込み
        await loadDashboard();
        await loadTemplates();
    } catch (error) {
        console.error('データ削除エラー:', error);
        showNotification('データの削除に失敗しました', 'error');
    }
}
