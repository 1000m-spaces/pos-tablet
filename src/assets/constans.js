import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
// import {heightDevices, widthDevices} from '../app';
export const heightDevice = Dimensions.get('window').height;
export const widthDevice = Dimensions.get('window').width;

export const versionSystem = DeviceInfo.getSystemVersion();
export const versionNameApp = DeviceInfo.getVersion();
export const deviceId = DeviceInfo.getUniqueId();
export const isAndroid = Platform.OS === 'ios' ? false : true;
export const KEY_ONE_SIGNAL = 'c107840b-bc7d-416f-8567-fdc22d2f3719';
export const KEY_GOONG_API = 'VphPkfidhRekSJM2Ff9TPIZSFtwDtgIWoXJ0wHUN';
// export const GOOGLE_MAP_KEY = 'AIzaSyAAO8W-KytYgmE4BzIXP_dLGZ7ABdO2z54';
export const GOOGLE_MAP_KEY = 'AIzaSyDy_5NNS-DwcZkcIYMar-wcspaL9fWJbQ0';

export const IMAGE_URL = 'https://helio.assets.ciaolink.net';

export function formatMoney(x) {
  return x && x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// POS APPLICATION
export const background_login = require('./background/background_login.png');
export const orderTypes = [
  { id: 1, name: 'Dùng tại quán' },
  { id: 2, name: 'Mang đi' },
  { id: 3, name: 'Grab Food' },
  { id: 4, name: 'Shopee Food' },
];
