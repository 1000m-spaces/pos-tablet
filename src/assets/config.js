import Config from 'react-native-config';

const BASE_PATH_MENU = Config.BASE_PATH_MENU
const BASE_PATH_CAFE = Config.BASE_PATH_CAFE;
const BASE_PATH_1000M = Config.BASE_PATH_1000M;
const CODE_PUSH_KEY = {
  ios: Config.IOS_CODEPUSH_KEY,
  android: Config.ANDROID_CODEPUSH_KEY,
};
const PARTNER_ID = Config.PARTNER_ID;

export { BASE_PATH_MENU, BASE_PATH_CAFE, CODE_PUSH_KEY, PARTNER_ID, BASE_PATH_1000M };
