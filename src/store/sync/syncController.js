import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';
import logService, { LOG_CATEGORIES } from '../../services/LogService';

class SyncController {
    syncOrders = async body => {
        try {
            const startTime = new Date();
            const orderCount = body?.orders?.length || 0;
            const sessions = body?.orders?.map(o => o.session).filter(Boolean) || [];

            logService.info(LOG_CATEGORIES.SYNC, `[API] syncOrders REQUEST: ${orderCount} đơn`, {
                sessions,
                url: UrlApi.syncOrders,
            });

            const response = await HttpClient.post(UrlApi.syncOrders, body);
            const { data, status } = response;
            const duration = new Date() - startTime;

            if (status !== 200) {
                logService.error(LOG_CATEGORIES.SYNC, `[API] syncOrders RESPONSE: HTTP ${status} (${duration}ms)`, {
                    status,
                    duration,
                    data: data ? JSON.stringify(data).substring(0, 500) : null,
                });
                return { success: false, status, result: null };
            }

            // Log chi tiết kết quả từ server
            const serverResults = data?.data || [];
            logService.info(LOG_CATEGORIES.SYNC, `[API] syncOrders RESPONSE OK: HTTP ${status} (${duration}ms), ${serverResults.length} kết quả`, {
                status,
                duration,
                results: serverResults.map(r => ({
                    order_id: r.order_id,
                    match: r.match,
                    offline_code: r.offline_code || 'THIẾU',
                    differences: r.differences,
                })),
            });

            // Phát hiện đơn kẹt: server trả về match:true nhưng THIẾU offline_code
            for (const result of serverResults) {
                if (!result.offline_code) {
                    logService.error(LOG_CATEGORIES.SYNC, `[API] CẢNH BÁO: Server trả về order_id=${result.order_id} KHÔNG CÓ offline_code → sẽ gây kẹt đơn!`, {
                        order_id: result.order_id,
                        match: result.match,
                        differences: result.differences,
                    });
                }
            }

            return {
                success: true,
                result: data,
            };
        } catch (error) {
            const status = error.response?.status || 500;
            logService.error(LOG_CATEGORIES.SYNC, `[API] syncOrders EXCEPTION: ${error.message} (HTTP ${status})`, {
                message: error.message,
                status,
                responseData: error.response?.data ? JSON.stringify(error.response.data).substring(0, 500) : null,
            });
            return { success: false, status, result: null };
        }
    };
}

export default new SyncController();