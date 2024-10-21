import {PARTNER_ID} from 'assets/config';
import HttpClient from 'http/HttpClient';
import {UrlApi} from 'http/UrlApi';
// import moment from 'moment';

class ProductController {
  getProductMenu = async body => {
    try {
      const {data} = await HttpClient.post(UrlApi.internalMenuShop, body);
      console.log('UrlApi.internalMenuShop::', UrlApi.internalMenuShop);
      return {
        success: data ? true : false,
        categories: data ? data : [],
      };
    } catch (error) {
      return {success: false, status: 400, products: [], categories: []};
    }
  };
}

export default new ProductController();
