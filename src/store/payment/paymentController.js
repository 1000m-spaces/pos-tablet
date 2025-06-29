import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class PaymentController {
    // Get Order Channel Types (dine-in, takeaway, etc.)
    getListChanelType = async () => {
        try {
            const { data } = await HttpClient.get(UrlApi.getListChanelType);
            console.log('order channels data:::', data);

            // Transform data to match expected format for order types
            const transformedChannels = data ? data.map(item => ({
                id: item.id,
                name_vn: item.name_vn || item.name,
                name_en: item.name_en || item.name,
                chanel_type_id: item.chanel_type_id || item.id,
            })) : [];

            return {
                success: data ? true : false,
                channels: transformedChannels,
            };
        } catch (error) {
            console.log('get order channels error::', error);
            return { success: false, status: 400, channels: [] };
        }
    };

    // Get Payment Methods (cash, card, etc.)
    getTransType = async () => {
        try {
            const response = await HttpClient.get(UrlApi.getTransType);
            console.log('payment methods response:::', response);

            // Handle the new API response format
            if (response.data && response.data.status && response.data.data) {
                // Filter payment methods that are available for POS (pos_running === "1")
                const availablePayments = response.data.data.filter(item => item.pos_running === "1");

                // Transform to the expected format for payment methods
                const transformedChannels = availablePayments.map(item => ({
                    id: item.id,
                    trans_name: item.trans_name, // This is the actual transaction type (41, 42, etc.)
                    name: item.desc_vn, // Vietnamese description for display
                    desc_eng: item.desc_eng, // English description
                    chanel_type_id: item.id, // Use id as chanel_type_id
                    icon: item.trans_name === '41' ? 'cash' : 'card' // Default icons
                }));

                console.log('transformed payment methods:::', transformedChannels);
                return {
                    success: true,
                    channels: transformedChannels,
                };
            } else {
                console.log('Invalid response format:', response);
                return { success: false, status: 400, channels: [] };
            }
        } catch (error) {
            console.log('get payment methods error::', error);
            return { success: false, status: 400, channels: [] };
        }
    };
}

export default new PaymentController(); 