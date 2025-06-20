import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class PaymentController {
    getPaymentChannels = async () => {
        try {
            const { data } = await HttpClient.get(UrlApi.getListChanelType);
            console.log('payment channels data:::', data);
            return {
                success: data ? true : false,
                channels: data ? data : [],
            };
        } catch (error) {
            console.log('get payment channels error::', error);
            return { success: false, status: 400, channels: [] };
        }
    };
}

export default new PaymentController(); 