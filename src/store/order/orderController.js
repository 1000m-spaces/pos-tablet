import HttpClient from 'http/HttpClient';
import {UrlApi} from 'http/UrlApi';

class OrderController {
  createOrderController = async payload => {
    try {
      console.log('payload create order', payload);
      const {data} = await HttpClient.post(UrlApi.orderInternal, payload);
      return {success: true, data: data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };
  getOnlineOrder = async payload => {
    try {
      const {data} = await HttpClient.post(UrlApi.getOnlineOrder, payload);
      return {success: true, data: data.data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };
}
export default new OrderController();
