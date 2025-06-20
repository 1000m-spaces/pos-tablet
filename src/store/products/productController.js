import { PARTNER_ID } from 'assets/config';
import HttpClient from 'http/HttpClient';
import { UrlApi } from 'http/UrlApi';
// import moment from 'moment';

class ProductController {
  getProductMenu = async body => {
    try {
      const { data } = await HttpClient.post(UrlApi.internalMenuShop, body);
      console.log('data:::', data)
      return {
        success: data.status,
        categories: data.data,
      };
    } catch (error) {
      console.log('error::', error)
      return { success: false, status: 400, products: [], categories: [] };
    }
  };
  getVoucher = async body => {
    console.log('body controller::', UrlApi.getVoucher);
    try {
      const { data } = await HttpClient.post(UrlApi.getVoucher, body);
      console.log('GET VOUCHER DATA:::', data);
      return { success: true, data: data };
    } catch (error) {
      return { success: false };
    }
  };

  getProductDetail = async body => {
    try {
      const { data } = await HttpClient.post(UrlApi.getProdDetail, body);
      console.log('product detail data:::', data);
      return {
        success: data ? true : false,
        product: data ? data : null,
      };
    } catch (error) {
      console.log('get product detail error::', error);
      return { success: false, status: 400, product: null };
    }
  };
}

export default new ProductController();
