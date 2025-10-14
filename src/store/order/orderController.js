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
  getOrderShipping = async payload => {
    try {
      const { data } = await HttpClient.post(UrlApi.getOrderShipping, payload);
      console.log('data getOrder Shipping and Pick up controller:', data);
      console.log('getOrder Shipping and Pick up payload', payload);
      return { success: true, data };
    } catch (error) {
      console.log('error getOrder Shipping and Pick up controller:', error, UrlApi.getOrderShipping);
      return { success: false, error: error.message };
    }
  };
  getOrderPaidSuccess = async payload => {
    console.log('getOrderPaidSuccess', UrlApi.getOrderPaidSuccess, payload);
    try {
      const { data } = await HttpClient.post(UrlApi.getOrderPaidSuccess, payload);
      console.log('getOrderPaidSuccess data', data);
      return { success: true, data };
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
  // New method to fetch orders from getOrderOnlineNew API
  fetchOrderOnlineNew = async payload => {
    try {
      console.log('payload fetchOrderOnlineNew', UrlApi.getOnlineOrder, payload);
      const { data } = await HttpClient.post(UrlApi.getOnlineOrder, payload);
      console.log('all data fetchOrderOnlineNew', data);
      return { success: true, data: data };
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

  confirmOrderOnline = async payload => {
    try {
      console.log('confirmOrderOnline:', UrlApi.confirmOrderOnline, payload);
      const { data } = await HttpClient.post(UrlApi.confirmOrderOnline, payload);
      console.log('data confirmOrderOnline:', data);
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  // call the driver back
  callDriverBackController = async payload => {
    try {
      console.log('payload callDriverBackController', payload);
      const { data } = await HttpClient.post(UrlApi.callDriverBack, payload);
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
}
export default new OrderController();
