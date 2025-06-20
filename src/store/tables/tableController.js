import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class TableController {
    getShopTables = async body => {
        try {
            const { data } = await HttpClient.post(UrlApi.getListShopTable, body);
            console.log('shop tables data:::', data, body);
            return {
                success: data ? true : false,
                tables: data ? data : [],
            };
        } catch (error) {
            console.log('get shop tables error::', error);
            return { success: false, status: 400, tables: [] };
        }
    };
}

export default new TableController(); 