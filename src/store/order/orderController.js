import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';

class OrderController {
  createOrderController = async payload => {
    try {
      console.log('payload create order', payload);
      const { data } = await HttpClient.post(UrlApi.orderInternal, payload);
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  getOnlineOrder = async payload => {
    try {
      const { data } = await HttpClient.post(UrlApi.getOnlineOrder, payload);
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  fetchOrder = async payload => {
    try {
      console.log('fetchOrder', UrlApi.fetchOrder, payload);
      const { data } = await HttpClient.post(UrlApi.fetchOrder, payload);
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  getOrderDetail = async payload => {
    console.log('getOrderDetail', UrlApi.fetchOrderDetail, payload);
    try {
      const { data } = await HttpClient.post(UrlApi.fetchOrderDetail, payload);
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  fetchOrderHistory = async payload => {
    console.log('fetchOrderHistory', UrlApi.fetchOrderHistory, payload);
    try {
      const { data } = await HttpClient.post(UrlApi.fetchOrderHistory, payload);
      console.log('fetchOrderHistory', data);
      return { success: true, data: data };
    } catch (error) {
      console.log('fetchOrderHistory', error);
      return { success: false, error: error.message };
    }
  };
}
export default new OrderController();
