import HttpClient from 'http/HttpClient';
import {UrlApi} from 'http/UrlApi';

class OrderController {
  getInternalMenuShopController = async payload => {
    try {
      console.log('payload get menu  shop', payload);
      const {data} = await HttpClient.post(UrlApi.internalMenuShop, {
        roleid: payload.roleid,
        userid: payload.userid,
        restid: payload.restid,
      });
      return {success: true, data: data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };

  createOrderController = async payload => {
    try {
      console.log('payload create order', payload);
      const {data} = await HttpClient.post(UrlApi.orderInternal, payload);
      return {success: true, data: data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };
}
export default new OrderController();
