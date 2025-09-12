import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class SyncController {
    syncOrders = async body => {
        try {
            const response = await HttpClient.post(UrlApi.syncOrders, body);
            const { data, status } = response;
            console.log('sync orders error serrverrr: ', response);
            if (status !== 200) {
                console.log('sync orders error: non-200 status:', status);
                return { success: false, status, result: null };
            }

            console.log('sync orders data:::', data);
            return {
                success: true,
                result: data,
            };
        } catch (error) {
            console.log('sync orders error::', error);
            const status = error.response?.status || 500;
            return { success: false, status, result: null };
        }
    };
}

export default new SyncController(); 