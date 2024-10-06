import HttpClient from 'http/HttpClient';
import {UrlApi} from 'http/UrlApi';

class AuthController {
  sendPhoneController = async phone => {
    try {
      console.log(phone);
      const {data} = await HttpClient.post(UrlApi.sendPhone, {
        phone,
      });
      return {success: true, data: data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };
  confirmOtpController = async query => {
    const result = await HttpClient.put(UrlApi.confirmPhone, query);
    console.log('RESULT CONFIRM OTP CONTROLLER', result, query);
    return result.data;
  };

  loginPhoneController = async phone => {
    const result = await HttpClient.post(UrlApi.loginPhone, {
      phone: phone,
      allownoti: 0,
      partnerid: 100,
    });
    return result.data;
  };

  getVersion = async (os, version, app_id) => {
    console.log('app_idapp_idapp_idapp_idapp_idapp_id:', os, version, app_id);
    const result = await HttpClient.get(UrlApi.getVersion, {
      params: {
        os,
        version,
        app_id,
      },
    });
    return result.data;
  };
}
export default new AuthController();
