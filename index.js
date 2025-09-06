/**
 * @format
 */
import 'text-encoding-polyfill'

import React from 'react';
import { AppRegistry } from 'react-native';
import App from './src/app';
import { name as appName } from './app.json';
import XPrinterOrderExample from './src/print/print';
import { PrinterProvider } from './src/services/PrinterService';
import Toast from 'react-native-toast-message';

// Wrap the printer test component with PrinterProvider
const PrinterTestApp = () => (
    <PrinterProvider>
        <XPrinterOrderExample />
        <Toast />
    </PrinterProvider>
);

AppRegistry.registerComponent(appName, () => App);
