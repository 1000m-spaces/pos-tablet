import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_URL } from 'react-native-dotenv';
/*
  Base client config for your application.
  Here you can define your base url, headers,
  timeouts and middleware used for each request.
*/
let defaultLanguage = 'vi';
export const setDefaultLanguage = language => {
  defaultLanguage = language;
};
console.log('default language:::', defaultLanguage);
const HttpClient = axios.create({
  timeout: 12000,
  headers: { 'content-type': 'application/json' },
});

// Custom middleware for requests (this one just logs the error).
HttpClient.interceptors.request.use(
  async config => {
    config.headers['X-CUPIFY-APP'] = 'TRA1000M';
    config.headers['Accept-Language'] = defaultLanguage;

    // Add sessionkey to headers if user is logged in
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.sessionkey) {
          config.headers['Authorization'] = `Bearer ${userData.sessionkey}`;
          config.headers['X-Session-Key'] = userData.sessionkey;
        }
      }
    } catch (error) {
      console.log('Error getting session key:', error);
    }

    // console.log('REQUEST API:', config);
    return config;
  },
  error => {
    //console.log('Failed to make request with error:', error);
    return Promise.reject(error);
  },
);

// Custom middleware for responses (this one just logs the error).
HttpClient.interceptors.response.use(
  response => response,
  error => {
    //console.log('Request got response with error:', error);
    return Promise.reject(error);
  },
);

export default HttpClient;
