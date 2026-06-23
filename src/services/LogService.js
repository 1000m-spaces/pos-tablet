import RNFS from 'react-native-fs';
import { Platform, Share } from 'react-native';

// ============================================================
// CẤU TRÚC THƯ MỤC LOG:
//   pos_logs/
//   ├── 2026-05-28/
//   │   ├── all.jsonl       ← Tổng toàn bộ log ngày 28
//   │   ├── api.jsonl       ← Log API
//   │   ├── order.jsonl     ← Log đơn hàng
//   │   ├── sync.jsonl      ← Log đồng bộ
//   │   ├── system.jsonl    ← Log hệ thống
//   │   └── print.jsonl     ← Log in ấn (nếu có)
//   ├── 2026-05-29/
//   │   ├── all.jsonl
//   │   └── ...
//   └── ...
//
// GHI: Mỗi log entry ghi vào CẢ HAI file:
//   1. all.jsonl (file tổng)
//   2. {category}.jsonl (file theo mục)
//
// ĐỌC:
//   - Tab "Tất cả"  → đọc all.jsonl
//   - Tab "Đơn hàng" → đọc order.jsonl
//   - Tab "API"      → đọc api.jsonl
//   - ...
// ============================================================

const LOG_DIR = `${RNFS.DocumentDirectoryPath}/pos_logs`;
const MAX_LOG_DAYS = 10;
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB per file

// Danh sách category
export const LOG_CATEGORIES = {
    API: 'api',           // Mọi API request/response
    ORDER: 'order',       // Đặt đơn, thanh toán
    SYNC: 'sync',         // Đồng bộ đơn
    PRINT: 'print',       // In tem, in bill
    SYSTEM: 'system',     // Khởi động, lỗi hệ thống
};

export const CATEGORY_LABELS = {
    api: '🌐 API',
    order: '📦 Đơn hàng',
    sync: '🔄 Đồng bộ',
    print: '🖨️ In ấn',
    system: '⚙️ Hệ thống',
};

class LogService {
    constructor() {
        this.initialized = false;
        this.buffer = []; // 1 buffer duy nhất cho tất cả category
        this.flushInterval = null;
    }

    async init() {
        if (this.initialized) return;
        try {
            const dirExists = await RNFS.exists(LOG_DIR);
            if (!dirExists) {
                await RNFS.mkdir(LOG_DIR);
            }

            // Di chuyển file cũ (flat) vào folder ngày
            await this._migrateOldFiles();

            // Flush buffer mỗi 5 giây
            this.flushInterval = setInterval(() => {
                this.flush();
            }, 5000);

            // Cleanup log cũ
            await this.cleanupOldLogs();

            this.initialized = true;
            this.info(LOG_CATEGORIES.SYSTEM, 'LogService initialized', { logDir: LOG_DIR });
        } catch (error) {
            console.error('[LogService] Init error:', error);
        }
    }

    // ============ DI CHUYỂN FILE CŨ ============
    // File cũ: pos_logs/pos_order_2026-05-28.jsonl
    // → Chuyển vào: pos_logs/2026-05-28/order.jsonl + all.jsonl
    async _migrateOldFiles() {
        try {
            const items = await RNFS.readDir(LOG_DIR);
            for (const item of items) {
                if (item.isDirectory()) continue;
                const match = item.name.match(/^pos_(\w+)_(\d{4}-\d{2}-\d{2})\.jsonl$/);
                if (!match) continue;

                const category = match[1];
                const date = match[2];
                const dayDir = `${LOG_DIR}/${date}`;

                // Tạo folder ngày nếu chưa có
                const dayDirExists = await RNFS.exists(dayDir);
                if (!dayDirExists) await RNFS.mkdir(dayDir);

                // Đọc nội dung file cũ
                const content = await RNFS.readFile(item.path, 'utf8');
                if (!content.trim()) {
                    await RNFS.unlink(item.path);
                    continue;
                }

                // Ghi vào file category trong folder ngày
                const catFile = `${dayDir}/${category}.jsonl`;
                await this._appendOrWrite(catFile, content);

                // Ghi vào file tổng all.jsonl
                const allFile = `${dayDir}/all.jsonl`;
                await this._appendOrWrite(allFile, content);

                // Xóa file cũ
                await RNFS.unlink(item.path);
                console.log(`[LogService] Migrated ${item.name} → ${date}/${category}.jsonl`);
            }
        } catch (error) {
            console.error('[LogService] Migration error:', error);
        }
    }

    // Helper: append nếu file đã tồn tại, write nếu chưa
    async _appendOrWrite(filePath, content) {
        const exists = await RNFS.exists(filePath);
        if (exists) {
            await RNFS.appendFile(filePath, content, 'utf8');
        } else {
            await RNFS.writeFile(filePath, content, 'utf8');
        }
    }

    _getLocalDateString(date = new Date()) {
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date; // Already formatted YYYY-MM-DD
        }
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Thư mục theo ngày: pos_logs/2026-05-28/
    _getDayDir(date = new Date()) {
        const dateStr = this._getLocalDateString(date);
        return `${LOG_DIR}/${dateStr}`;
    }

    // ============ CORE LOG METHOD ============
    async log(level, category, message, data = null) {
        try {
            const entry = {
                t: new Date().toISOString(),
                l: level,       // 'info' | 'warn' | 'error'
                c: category,    // 'api' | 'order' | 'sync' | 'print' | 'system'
                m: message,
            };

            if (data !== null && data !== undefined) {
                try {
                    const dataStr = JSON.stringify(data);
                    if (dataStr.length > 2000) {
                        entry.d = dataStr.substring(0, 2000) + '...[truncated]';
                    } else {
                        entry.d = data;
                    }
                } catch {
                    entry.d = String(data);
                }
            }

            this.buffer.push(entry);

            // Auto-flush nếu buffer lớn
            if (this.buffer.length >= 20) {
                await this.flush();
            }
        } catch (error) {
            console.error('[LogService] Log error:', error.message);
        }
    }

    // ============ CONVENIENCE METHODS ============
    async info(category, message, data) {
        return this.log('info', category, message, data);
    }
    async warn(category, message, data) {
        return this.log('warn', category, message, data);
    }
    async error(category, message, data) {
        return this.log('error', category, message, data);
    }

    // ============ API LOGGING ============
    async logApiRequest(method, url, body, category = null) {
        const apiName = this._extractApiName(url);
        const cat = category || LOG_CATEGORIES.API;
        return this.log('info', cat, `→ ${method?.toUpperCase()} ${apiName}`, {
            url,
            method: method?.toUpperCase(),
            requestBody: body ? this._truncate(JSON.stringify(body), 2000) : undefined,
        });
    }

    async logApiResponse(status, url, data, duration, category = null) {
        const apiName = this._extractApiName(url);
        const cat = category || LOG_CATEGORIES.API;
        return this.log('info', cat, `← ${status} ${apiName} (${duration}ms)`, {
            url,
            status,
            duration,
            success: data?.success,
            message: data?.message || data?.msg,
            responseBody: data ? this._truncate(JSON.stringify(data), 2000) : undefined,
        });
    }

    async logApiError(url, error, category = null) {
        const apiName = this._extractApiName(url);
        const cat = category || LOG_CATEGORIES.API;
        return this.log('error', cat, `✗ ERROR ${apiName}`, {
            url,
            status: error?.response?.status,
            message: error?.message,
            errorData: error?.response?.data
                ? this._truncate(JSON.stringify(error.response.data), 1000)
                : undefined,
            requestBody: error?.config?.data
                ? this._truncate(JSON.stringify(error.config.data), 1000)
                : undefined,
        });
    }

    _extractApiName(url) {
        if (!url) return 'unknown';
        try {
            const urlObj = new URL(url);
            return urlObj.pathname;
        } catch {
            // URL không đầy đủ, lấy phần cuối
            const parts = url.split('/');
            return '/' + parts.slice(-2).join('/');
        }
    }

    _truncate(str, maxLen) {
        if (!str || str.length <= maxLen) return str;
        return str.substring(0, maxLen) + '...[truncated]';
    }

    // ============ FLUSH BUFFER TO FILES ============
    // Ghi mỗi entry vào CẢ HAI: all.jsonl + {category}.jsonl
    async flush() {
        if (this.buffer.length === 0) return;

        const entries = [...this.buffer];
        this.buffer = [];

        try {
            // Tạo thư mục ngày
            const dayDir = this._getDayDir();
            const dayDirExists = await RNFS.exists(dayDir);
            if (!dayDirExists) {
                const rootExists = await RNFS.exists(LOG_DIR);
                if (!rootExists) await RNFS.mkdir(LOG_DIR);
                await RNFS.mkdir(dayDir);
            }

            // 1. Ghi TẤT CẢ vào all.jsonl
            const allLines = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
            const allFile = `${dayDir}/all.jsonl`;
            await this._safeAppend(allFile, allLines);

            // 2. Ghi vào từng file category riêng
            const byCategory = {};
            for (const entry of entries) {
                const cat = entry.c || 'system';
                if (!byCategory[cat]) byCategory[cat] = [];
                byCategory[cat].push(entry);
            }
            for (const [cat, catEntries] of Object.entries(byCategory)) {
                const catLines = catEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
                const catFile = `${dayDir}/${cat}.jsonl`;
                await this._safeAppend(catFile, catLines);
            }

            // 3. Backup ra Download (Android only) — cùng cấu trúc folder
            if (Platform.OS === 'android') {
                try {
                    const dateStr = this._getLocalDateString();
                    const publicRoot = `${RNFS.DownloadDirectoryPath}/pos_logs`;
                    const publicDayDir = `${publicRoot}/${dateStr}`;

                    const publicRootExists = await RNFS.exists(publicRoot);
                    if (!publicRootExists) await RNFS.mkdir(publicRoot);
                    const publicDayExists = await RNFS.exists(publicDayDir);
                    if (!publicDayExists) await RNFS.mkdir(publicDayDir);

                    // Backup all.jsonl
                    await this._safeAppend(`${publicDayDir}/all.jsonl`, allLines);

                    // Backup từng category
                    for (const [cat, catEntries] of Object.entries(byCategory)) {
                        const catLines = catEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
                        await this._safeAppend(`${publicDayDir}/${cat}.jsonl`, catLines);
                    }
                } catch (publicError) {
                    console.log('[LogService] Public backup error (silent):', publicError.message);
                }
            }
        } catch (error) {
            console.error('[LogService] Flush error:', error.message);
            // Đưa entries về buffer để thử lại
            this.buffer = [...entries, ...(this.buffer || [])];
        }
    }

    // Append an toàn: kiểm tra tồn tại + rotate nếu quá lớn
    async _safeAppend(filePath, content) {
        const exists = await RNFS.exists(filePath);
        if (exists) {
            const stat = await RNFS.stat(filePath);
            if (stat.size > MAX_FILE_SIZE) {
                const rotated = filePath.replace('.jsonl', `_${Date.now()}.jsonl`);
                await RNFS.moveFile(filePath, rotated);
            }
            await RNFS.appendFile(filePath, content, 'utf8');
        } else {
            await RNFS.writeFile(filePath, content, 'utf8');
        }
    }

    // ============ READ LOGS ============
    // Tab "Tất cả"  → đọc all.jsonl
    // Tab "Đơn hàng" → đọc order.jsonl
    async readLogs(category, date = new Date()) {
        try {
            await this.flush(); // Flush trước khi đọc

            const dayDir = this._getDayDir(date);

            // Xác định file cần đọc
            let logFile;
            if (!category || category === 'all') {
                logFile = `${dayDir}/all.jsonl`;
            } else {
                logFile = `${dayDir}/${category}.jsonl`;
            }

            const exists = await RNFS.exists(logFile);
            if (!exists) return [];

            const content = await RNFS.readFile(logFile, 'utf8');
            const lines = content.trim().split('\n').filter(Boolean);
            return lines.map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return { t: '', l: 'error', c: 'system', m: line };
                }
            });
        } catch (error) {
            console.error('[LogService] Read error:', error);
            return [];
        }
    }

    // Đọc tất cả log cho 1 ngày (từ all.jsonl)
    async readAllLogs(date = new Date()) {
        const allLogs = await this.readLogs('all', date);
        allLogs.sort((a, b) => new Date(a.t) - new Date(b.t));
        return allLogs;
    }

    // ============ LOG FILES INFO ============
    async getLogFiles() {
        try {
            const exists = await RNFS.exists(LOG_DIR);
            if (!exists) return [];

            const items = await RNFS.readDir(LOG_DIR);
            const files = [];

            for (const item of items) {
                if (!item.isDirectory()) continue;

                // Chỉ lấy folder ngày: 2026-05-28
                const dateMatch = item.name.match(/^(\d{4}-\d{2}-\d{2})$/);
                if (!dateMatch) continue;

                const dayFiles = await RNFS.readDir(item.path);
                for (const f of dayFiles) {
                    if (!f.name.endsWith('.jsonl')) continue;
                    const catName = f.name.replace('.jsonl', '');
                    files.push({
                        name: f.name,
                        path: f.path,
                        size: f.size,
                        date: dateMatch[1],
                        category: catName,
                        sizeFormatted: f.size > 1024 * 1024
                            ? `${(f.size / (1024 * 1024)).toFixed(1)}MB`
                            : `${(f.size / 1024).toFixed(1)}KB`,
                    });
                }
            }

            return files.sort((a, b) => b.date.localeCompare(a.date));
        } catch (error) {
            console.error('[LogService] GetLogFiles error:', error);
            return [];
        }
    }

    // Lấy danh sách ngày có log (dựa trên folder ngày)
    async getAvailableDates() {
        try {
            const exists = await RNFS.exists(LOG_DIR);
            if (!exists) return [];

            const items = await RNFS.readDir(LOG_DIR);
            const dates = [];

            for (const item of items) {
                if (!item.isDirectory()) continue;
                const dateMatch = item.name.match(/^(\d{4}-\d{2}-\d{2})$/);
                if (dateMatch) {
                    dates.push(dateMatch[1]);
                }
            }

            return dates.sort().reverse(); // Mới nhất trước
        } catch (error) {
            console.error('[LogService] GetAvailableDates error:', error);
            return [];
        }
    }

    // ============ EXPORT ============
    async exportLogs(category = null, date = null) {
        try {
            await this.flush();

            const targetDate = date || new Date();
            const dateStr = this._getLocalDateString(targetDate);
            const dayDir = this._getDayDir(targetDate);

            // Đọc log từ đúng file
            const logs = category
                ? await this.readLogs(category, targetDate)
                : await this.readAllLogs(targetDate);

            if (logs.length === 0) throw new Error('Không có log nào');

            // Tạo file export tạm
            const exportName = category
                ? `export_${category}_${dateStr}.json`
                : `export_all_${dateStr}.json`;

            const dayDirExists = await RNFS.exists(dayDir);
            if (!dayDirExists) await RNFS.mkdir(dayDir);

            const exportFile = `${dayDir}/${exportName}`;
            await RNFS.writeFile(exportFile, JSON.stringify(logs, null, 2), 'utf8');

            await Share.share({
                url: Platform.OS === 'ios' ? exportFile : `file://${exportFile}`,
                title: `POS Log - ${category || 'all'} - ${dateStr}`,
            });

            // Xóa file export tạm sau 1 phút
            setTimeout(async () => {
                try { await RNFS.unlink(exportFile); } catch { }
            }, 60000);

            return true;
        } catch (error) {
            console.error('[LogService] Export error:', error);
            throw error;
        }
    }

    // ============ CLEANUP ============
    async cleanupOldLogs() {
        try {
            const exists = await RNFS.exists(LOG_DIR);
            if (!exists) return;

            const items = await RNFS.readDir(LOG_DIR);

            // Lấy ngày hôm nay (local) đặt về 00:00:00
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Mốc 10 ngày trước (00:00:00)
            const cutoffTime = today.getTime() - MAX_LOG_DAYS * 24 * 60 * 60 * 1000;

            let removed = 0;
            for (const item of items) {
                // Xóa file cũ nằm ngoài folder (dạng flat cũ)
                if (!item.isDirectory() && item.name.endsWith('.jsonl')) {
                    await RNFS.unlink(item.path);
                    removed++;
                    continue;
                }

                // Xóa folder ngày cũ
                if (item.isDirectory()) {
                    const dateMatch = item.name.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                    if (dateMatch) {
                        const year = parseInt(dateMatch[1], 10);
                        const month = parseInt(dateMatch[2], 10) - 1;
                        const day = parseInt(dateMatch[3], 10);

                        // Tạo đối tượng Date theo giờ địa phương (local midnight)
                        const folderDate = new Date(year, month, day, 0, 0, 0, 0);

                        if (folderDate.getTime() < cutoffTime) {
                            // Xóa đệ quy toàn bộ file bên trong thư mục trước
                            const dirFiles = await RNFS.readDir(item.path);
                            for (const f of dirFiles) {
                                await RNFS.unlink(f.path);
                            }
                            // Sau đó xóa thư mục rỗng
                            await RNFS.unlink(item.path);
                            removed++;
                        }
                    }
                }
            }

            // Đồng bộ xóa thư mục backup Download (Android) nếu có
            if (Platform.OS === 'android') {
                try {
                    const publicRoot = `${RNFS.DownloadDirectoryPath}/pos_logs`;
                    const publicRootExists = await RNFS.exists(publicRoot);
                    if (publicRootExists) {
                        const publicItems = await RNFS.readDir(publicRoot);
                        for (const item of publicItems) {
                            if (item.isDirectory()) {
                                const dateMatch = item.name.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                                if (dateMatch) {
                                    const year = parseInt(dateMatch[1], 10);
                                    const month = parseInt(dateMatch[2], 10) - 1;
                                    const day = parseInt(dateMatch[3], 10);
                                    const folderDate = new Date(year, month, day, 0, 0, 0, 0);

                                    if (folderDate.getTime() < cutoffTime) {
                                        const dirFiles = await RNFS.readDir(item.path);
                                        for (const f of dirFiles) {
                                            await RNFS.unlink(f.path);
                                        }
                                        await RNFS.unlink(item.path);
                                    }
                                }
                            }
                        }
                    }
                } catch (publicError) {
                    console.log('[LogService] Cleanup public logs error:', publicError.message);
                }
            }

            if (removed > 0) {
                console.log(`[LogService] Cleaned up ${removed} log folders older than ${MAX_LOG_DAYS} days`);
            }
        } catch (error) {
            console.error('[LogService] Cleanup error:', error);
        }
    }

    // ============ DESTROY ============
    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
        this.flush();
        this.initialized = false;
    }
}

const logService = new LogService();
export default logService;
