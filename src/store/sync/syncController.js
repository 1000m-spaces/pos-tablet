import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class SyncController {
    syncOrders = async body => {
        try {
            const startTime = new Date();
            console.log('🔄 SyncOrders: Request started at', startTime.toISOString());
            console.log('📤 SyncOrders: Request body::', body);
            
            const response = await HttpClient.post(UrlApi.syncOrders, body);
            const { data, status } = response;
            const endTime = new Date();
            const duration = endTime - startTime;
            
            console.log('✅ SyncOrders: Response received');
            console.log('⏱️ SyncOrders: Duration:', duration, 'ms');
            console.log('📊 SyncOrders: Status:', status);
            console.log('📦 SyncOrders: Response data::', data);
            
            if (status !== 200) {
                console.log('❌ SyncOrders: Non-200 status:', status);
                return { success: false, status, result: null };
            }

            console.log('✨ SyncOrders: Success! Data size:', JSON.stringify(data).length, 'bytes');
            return {
                success: true,
                result: data,
            };
        } catch (error) {
            console.log('❌ SyncOrders: Error occurred');
            console.log('💥 SyncOrders: Error message::', error.message);
            console.log('💥 SyncOrders: Full error::', error);
            const status = error.response?.status || 500;
            return { success: false, status, result: null };
        }
    };
}

export default new SyncController(); 