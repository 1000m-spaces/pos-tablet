/**
 * @format
 */
import 'text-encoding-polyfill'

import { AppRegistry } from 'react-native';
import App from './src/app';
import { name as appName } from './app.json';
// import XPrinterNetworkExample from './src/print/print'


AppRegistry.registerComponent(appName, () => App);
