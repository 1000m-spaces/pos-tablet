import {PARTNER_ID} from 'assets/config';
import HttpClient from 'http/HttpClient';
import {UrlApi} from 'http/UrlApi';
// import moment from 'moment';

class ProductController {
  getProductMenu = async body => {
    try {
      const {data} = await HttpClient.post(UrlApi.getProductMenu, body);
      return {
        success: true,
        products: data.data,
        categories: data.categorys,
      };
    } catch (error) {
      return {success: false, status: 400, products: [], categories: []};
    }
  };
}

export default new ProductController();
