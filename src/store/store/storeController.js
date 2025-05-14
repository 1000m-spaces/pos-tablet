import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class StoreController {
  getListStore = async (partnerID) => {
    try {
      const { data } = await HttpClient.post(UrlApi.getListStore, {
        partnerid: partnerID,
      });
      console.log('data', data);
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
}
export default new StoreController();
