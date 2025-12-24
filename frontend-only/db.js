/**
 * IndexedDBを使用したデータ管理モジュール
 * 給与明細とテンプレートのCRUD操作を提供
 */

class PayslipDatabase {
    constructor() {
        this.dbName = 'PayslipManagerDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * データベースを初期化
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error('データベースの初期化に失敗しました'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 給与明細ストア
                if (!db.objectStoreNames.contains('payslips')) {
                    const payslipStore = db.createObjectStore('payslips', { keyPath: 'id' });
                    payslipStore.createIndex('issueDate', 'issueDate', { unique: false });
                    payslipStore.createIndex('employeeName', 'employeeName', { unique: false });
                    payslipStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // テンプレートストア
                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
                    templateStore.createIndex('name', 'name', { unique: false });
                    templateStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    /**
     * ユニークIDを生成
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 給与明細を保存
     */
    async savePayslip(payslipData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payslips'], 'readwrite');
            const store = transaction.objectStore('payslips');

            // IDが存在しない場合は新規作成
            if (!payslipData.id) {
                payslipData.id = this.generateId();
                payslipData.createdAt = new Date().toISOString();
            }
            payslipData.updatedAt = new Date().toISOString();

            const request = store.put(payslipData);

            request.onsuccess = () => {
                resolve(payslipData);
            };

            request.onerror = () => {
                reject(new Error('給与明細の保存に失敗しました'));
            };
        });
    }

    /**
     * すべての給与明細を取得
     */
    async getAllPayslips() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payslips'], 'readonly');
            const store = transaction.objectStore('payslips');
            const request = store.getAll();

            request.onsuccess = () => {
                // 発行年月の降順でソート
                const payslips = request.result.sort((a, b) => {
                    const dateA = `${a.issueYear}-${String(a.issueMonth).padStart(2, '0')}`;
                    const dateB = `${b.issueYear}-${String(b.issueMonth).padStart(2, '0')}`;
                    return dateB.localeCompare(dateA);
                });
                resolve(payslips);
            };

            request.onerror = () => {
                reject(new Error('給与明細の取得に失敗しました'));
            };
        });
    }

    /**
     * IDで給与明細を取得
     */
    async getPayslipById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payslips'], 'readonly');
            const store = transaction.objectStore('payslips');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('給与明細の取得に失敗しました'));
            };
        });
    }

    /**
     * 給与明細を削除
     */
    async deletePayslip(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payslips'], 'readwrite');
            const store = transaction.objectStore('payslips');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('給与明細の削除に失敗しました'));
            };
        });
    }

    /**
     * 指定期間の給与明細を取得（半期PDF用）
     */
    async getPayslipsByDateRange(startYear, startMonth, monthCount = 6) {
        const payslips = await this.getAllPayslips();
        const result = [];

        for (let i = 0; i < monthCount; i++) {
            const year = startYear;
            const month = startMonth + i;
            
            // 月が12を超える場合は年を繰り上げ
            const adjustedYear = year + Math.floor((month - 1) / 12);
            const adjustedMonth = ((month - 1) % 12) + 1;

            const found = payslips.find(p => 
                p.issueYear === adjustedYear && p.issueMonth === adjustedMonth
            );

            if (found) {
                result.push(found);
            }
        }

        return result;
    }

    /**
     * テンプレートを保存
     */
    async saveTemplate(templateData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');

            // IDが存在しない場合は新規作成
            if (!templateData.id) {
                templateData.id = this.generateId();
                templateData.createdAt = new Date().toISOString();
            }
            templateData.updatedAt = new Date().toISOString();

            const request = store.put(templateData);

            request.onsuccess = () => {
                resolve(templateData);
            };

            request.onerror = () => {
                reject(new Error('テンプレートの保存に失敗しました'));
            };
        });
    }

    /**
     * すべてのテンプレートを取得
     */
    async getAllTemplates() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const request = store.getAll();

            request.onsuccess = () => {
                // 作成日時の降順でソート
                const templates = request.result.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                resolve(templates);
            };

            request.onerror = () => {
                reject(new Error('テンプレートの取得に失敗しました'));
            };
        });
    }

    /**
     * IDでテンプレートを取得
     */
    async getTemplateById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('テンプレートの取得に失敗しました'));
            };
        });
    }

    /**
     * テンプレートを削除
     */
    async deleteTemplate(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('テンプレートの削除に失敗しました'));
            };
        });
    }

    /**
     * 全データをエクスポート（JSON形式）
     */
    async exportAllData() {
        const payslips = await this.getAllPayslips();
        const templates = await this.getAllTemplates();

        return {
            version: this.version,
            exportedAt: new Date().toISOString(),
            payslips: payslips,
            templates: templates
        };
    }

    /**
     * データをインポート（JSON形式）
     */
    async importData(data) {
        // バリデーション
        if (!data || !data.payslips || !data.templates) {
            throw new Error('無効なデータ形式です');
        }

        // トランザクションで一括インポート
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payslips', 'templates'], 'readwrite');

            transaction.oncomplete = () => {
                resolve({
                    payslipsCount: data.payslips.length,
                    templatesCount: data.templates.length
                });
            };

            transaction.onerror = () => {
                reject(new Error('データのインポートに失敗しました'));
            };

            const payslipStore = transaction.objectStore('payslips');
            const templateStore = transaction.objectStore('templates');

            // 給与明細をインポート
            data.payslips.forEach(payslip => {
                payslipStore.put(payslip);
            });

            // テンプレートをインポート
            data.templates.forEach(template => {
                templateStore.put(template);
            });
        });
    }

    /**
     * 全データを削除
     */
    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payslips', 'templates'], 'readwrite');

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(new Error('データの削除に失敗しました'));
            };

            const payslipStore = transaction.objectStore('payslips');
            const templateStore = transaction.objectStore('templates');

            payslipStore.clear();
            templateStore.clear();
        });
    }

    /**
     * 最新の給与明細を取得（前月コピー用）
     */
    async getLatestPayslip() {
        const payslips = await this.getAllPayslips();
        return payslips.length > 0 ? payslips[0] : null;
    }
}

// グローバルインスタンスを作成
const db = new PayslipDatabase();
