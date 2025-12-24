/**
 * PDF生成モジュール
 * jsPDFを使用して給与明細のPDFを生成
 */

/**
 * 月次給与明細PDFを生成
 */
async function generateMonthlyPDF(payslipData) {
    try {
        const { jsPDF } = window.jspdf;
        
        // A4サイズのPDFを作成
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Noto Serif JPフォントを使用するための設定
        pdf.setFont('helvetica');
        
        // HTMLからPDFを生成
        const formatId = payslipData.selectedFormat || 1;
        const htmlContent = generatePayslipHTML(formatId, payslipData);
        
        // 一時的なコンテナを作成
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = htmlContent;
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '210mm'; // A4幅
        document.body.appendChild(tempContainer);

        // html2canvasを使用してHTMLをキャンバスに変換
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // コンテナを削除
        document.body.removeChild(tempContainer);

        // キャンバスを画像として追加
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4幅（mm）
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // PDFを保存
        const filename = `給与明細_${payslipData.employeeName || '未設定'}_${payslipData.issueYear}年${payslipData.issueMonth}月.pdf`;
        pdf.save(filename);

        return { success: true, filename };
    } catch (error) {
        console.error('PDF生成エラー:', error);
        throw new Error('PDFの生成に失敗しました: ' + error.message);
    }
}

/**
 * 半期給与明細PDF（6ヶ月分）を生成
 * 1枚のA4に6ヶ月分の給与明細を縦に並べて表示
 */
async function generateSemiAnnualPDF(payslips, startYear, startMonth) {
    try {
        if (!payslips || payslips.length === 0) {
            throw new Error('給与明細データが見つかりません');
        }

        const { jsPDF } = window.jspdf;
        
        // A4サイズのPDFを作成
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Noto Serif JPフォントを設定
        pdf.setFont('helvetica');

        // タイトル
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('給与明細一覧（半期）', 105, 15, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${startYear}年${startMonth}月 ～ ${getEndMonth(startYear, startMonth, 5).year}年${getEndMonth(startYear, startMonth, 5).month}月`, 105, 22, { align: 'center' });

        if (payslips.length > 0 && payslips[0].employeeName) {
            pdf.setFontSize(10);
            pdf.text(`氏名: ${payslips[0].employeeName}`, 105, 28, { align: 'center' });
        }

        // テーブルヘッダー
        const startY = 35;
        const rowHeight = 8;
        const colWidths = [30, 40, 40, 40, 40];
        let currentY = startY;

        // ヘッダー行
        pdf.setFillColor(220, 220, 220);
        pdf.rect(10, currentY, 190, rowHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        
        pdf.text('年月', 15, currentY + 5.5);
        pdf.text('支給額合計', 45, currentY + 5.5);
        pdf.text('控除額合計', 85, currentY + 5.5);
        pdf.text('差引支給額', 125, currentY + 5.5);
        pdf.text('備考', 165, currentY + 5.5);

        // 罫線
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.3);
        pdf.line(10, currentY, 200, currentY);
        pdf.line(10, currentY + rowHeight, 200, currentY + rowHeight);
        pdf.line(10, currentY, 10, currentY + rowHeight);
        pdf.line(200, currentY, 200, currentY + rowHeight);
        pdf.line(40, currentY, 40, currentY + rowHeight);
        pdf.line(80, currentY, 80, currentY + rowHeight);
        pdf.line(120, currentY, 120, currentY + rowHeight);
        pdf.line(160, currentY, 160, currentY + rowHeight);

        currentY += rowHeight;

        // データ行
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        let totalEarnings = 0;
        let totalDeductions = 0;
        let totalNet = 0;

        for (let i = 0; i < 6; i++) {
            const monthInfo = getEndMonth(startYear, startMonth, i);
            const payslip = payslips.find(p => 
                p.issueYear === monthInfo.year && p.issueMonth === monthInfo.month
            );

            // 罫線
            pdf.line(10, currentY, 200, currentY);
            pdf.line(10, currentY, 10, currentY + rowHeight);
            pdf.line(200, currentY, 200, currentY + rowHeight);
            pdf.line(40, currentY, 40, currentY + rowHeight);
            pdf.line(80, currentY, 80, currentY + rowHeight);
            pdf.line(120, currentY, 120, currentY + rowHeight);
            pdf.line(160, currentY, 160, currentY + rowHeight);

            if (payslip) {
                // データがある場合
                pdf.text(`${monthInfo.year}/${String(monthInfo.month).padStart(2, '0')}`, 15, currentY + 5.5);
                pdf.text(`¥${formatCurrency(payslip.totalEarnings)}`, 45, currentY + 5.5);
                pdf.text(`¥${formatCurrency(payslip.totalDeductions)}`, 85, currentY + 5.5);
                pdf.text(`¥${formatCurrency(payslip.netPay)}`, 125, currentY + 5.5);
                pdf.text('-', 165, currentY + 5.5);

                totalEarnings += Number(payslip.totalEarnings) || 0;
                totalDeductions += Number(payslip.totalDeductions) || 0;
                totalNet += Number(payslip.netPay) || 0;
            } else {
                // データがない場合
                pdf.setTextColor(150, 150, 150);
                pdf.text(`${monthInfo.year}/${String(monthInfo.month).padStart(2, '0')}`, 15, currentY + 5.5);
                pdf.text('データなし', 45, currentY + 5.5);
                pdf.text('-', 85, currentY + 5.5);
                pdf.text('-', 125, currentY + 5.5);
                pdf.text('未作成', 165, currentY + 5.5);
                pdf.setTextColor(0, 0, 0);
            }

            currentY += rowHeight;
        }

        // 合計行
        pdf.line(10, currentY, 200, currentY);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(10, currentY, 190, rowHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        
        pdf.text('合計', 15, currentY + 5.5);
        pdf.text(`¥${formatCurrency(totalEarnings)}`, 45, currentY + 5.5);
        pdf.text(`¥${formatCurrency(totalDeductions)}`, 85, currentY + 5.5);
        pdf.text(`¥${formatCurrency(totalNet)}`, 125, currentY + 5.5);
        pdf.text('', 165, currentY + 5.5);

        // 最終罫線
        pdf.line(10, currentY, 10, currentY + rowHeight);
        pdf.line(200, currentY, 200, currentY + rowHeight);
        pdf.line(40, currentY, 40, currentY + rowHeight);
        pdf.line(80, currentY, 80, currentY + rowHeight);
        pdf.line(120, currentY, 120, currentY + rowHeight);
        pdf.line(160, currentY, 160, currentY + rowHeight);
        pdf.line(10, currentY + rowHeight, 200, currentY + rowHeight);

        currentY += rowHeight + 10;

        // 平均行
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const dataCount = payslips.length;
        if (dataCount > 0) {
            pdf.text(`平均: 支給額 ¥${formatCurrency(Math.round(totalEarnings / dataCount))} / 控除額 ¥${formatCurrency(Math.round(totalDeductions / dataCount))} / 手取り ¥${formatCurrency(Math.round(totalNet / dataCount))}`, 105, currentY, { align: 'center' });
        }

        currentY += 10;

        // 詳細情報（支給・控除の内訳）
        if (payslips.length > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text('■ 各月の詳細', 15, currentY);
            currentY += 8;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);

            payslips.forEach((payslip, index) => {
                if (currentY > 270) {
                    // ページを追加
                    pdf.addPage();
                    currentY = 20;
                }

                pdf.setFont('helvetica', 'bold');
                pdf.text(`${payslip.issueYear}年${payslip.issueMonth}月`, 15, currentY);
                currentY += 5;

                pdf.setFont('helvetica', 'normal');
                
                // 支給項目
                const earnings = [
                    `基本給: ¥${formatCurrency(payslip.basicSalary)}`,
                    `非課税通勤費: ¥${formatCurrency(payslip.taxFreeCommute)}`,
                    `残業手当: ¥${formatCurrency(payslip.overtimePay)}`,
                    `その他手当: ¥${formatCurrency(payslip.otherAllowance)}`
                ];
                pdf.text(`支給: ${earnings.join(' / ')}`, 20, currentY);
                currentY += 4;

                // 控除項目
                const deductions = [
                    `所得税: ¥${formatCurrency(payslip.incomeTax)}`,
                    `住民税: ¥${formatCurrency(payslip.residentTax)}`,
                    `健保: ¥${formatCurrency(payslip.healthInsurance)}`,
                    `年金: ¥${formatCurrency(payslip.pensionInsurance)}`,
                    `雇保: ¥${formatCurrency(payslip.employmentInsurance)}`
                ];
                pdf.text(`控除: ${deductions.join(' / ')}`, 20, currentY);
                currentY += 4;

                // 勤怠情報
                pdf.text(`勤怠: 労働日数 ${payslip.workingDays || 0}日 / 労働時間 ${payslip.workingHours || 0}h / 時間外 ${payslip.overtimeHours || 0}h`, 20, currentY);
                currentY += 7;
            });
        }

        // フッター
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`発行日: ${new Date().toLocaleDateString('ja-JP')}`, 15, 287);
            pdf.text(`ページ ${i} / ${pageCount}`, 185, 287);
        }

        // PDFを保存
        const filename = `給与明細半期_${payslips[0]?.employeeName || '未設定'}_${startYear}年${startMonth}月-${getEndMonth(startYear, startMonth, 5).year}年${getEndMonth(startYear, startMonth, 5).month}月.pdf`;
        pdf.save(filename);

        return { success: true, filename };
    } catch (error) {
        console.error('半期PDF生成エラー:', error);
        throw new Error('半期PDFの生成に失敗しました: ' + error.message);
    }
}

/**
 * N ヶ月後の年月を計算
 */
function getEndMonth(year, month, offset) {
    const totalMonths = year * 12 + month + offset;
    return {
        year: Math.floor((totalMonths - 1) / 12),
        month: ((totalMonths - 1) % 12) + 1
    };
}

/**
 * html2canvasライブラリの読み込み
 */
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        if (window.html2canvas) {
            resolve(window.html2canvas);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => resolve(window.html2canvas);
        script.onerror = () => reject(new Error('html2canvasの読み込みに失敗しました'));
        document.head.appendChild(script);
    });
}

// ページ読み込み時にhtml2canvasを読み込み
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadHtml2Canvas();
        console.log('html2canvas読み込み完了');
    } catch (error) {
        console.error('html2canvas読み込みエラー:', error);
    }
});
