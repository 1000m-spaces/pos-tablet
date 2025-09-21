/**
 * @format
 */
import 'text-encoding-polyfill'

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store/index';
import App from './src/app';
import { name as appName } from './app.json';
import { PrinterProvider } from './src/services/PrinterService';
import TestAppSelector from './src/components/Test/TestAppSelector';
import Toast from 'react-native-toast-message';

// Wrap the test components with PrinterProvider
const PrinterTestApp = () => (
    <Provider store={store}>
        <PrinterProvider>
            <TestAppSelector />
            <Toast />
        </PrinterProvider>
    </Provider>
);

AppRegistry.registerComponent(appName, () => App);
