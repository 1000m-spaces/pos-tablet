import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class SyncController {
    syncOrders = async body => {
        try {
            const { data } = await HttpClient.post(UrlApi.syncOrders, body);
            console.log('sync orders data:::', data);
            return {
                success: data ? true : false,
                result: data ? data : null,
            };
        } catch (error) {
            console.log('sync orders error::', error);
            return { success: false, status: 400, result: null };
        }
    };
}

export default new SyncController(); 