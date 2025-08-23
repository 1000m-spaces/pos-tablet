import RootNavigation from 'navigation/RootNavigation';
import React, { useEffect } from 'react';
import Orientation from 'react-native-orientation-locker';
import { LogBox, TextInput, StatusBar, Dimensions } from 'react-native';
import { setCustomText } from 'react-native-global-props';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { PrinterProvider } from './services/PrinterService';


const customTextProps = {
  allowFontScaling: false,
};

export const heightDevices = Dimensions.get('window').height;
export const widthDevices = Dimensions.get('window').width;
const App = () => {
  useEffect(() => {
    Orientation.lockToLandscape();
    setCustomText(customTextProps);
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
    console.disableYellowBox = true;
    LogBox.ignoreAllLogs();
    StatusBar.setHidden(true);
    return () => {
      // Bỏ khóa khi component bị unmount
      Orientation.unlockAllOrientations();
    };
  }, []);

  return (
    <PrinterProvider>
      <RootNavigation />
      <Toast
        position="top"
        topOffset={50}
        visibilityTime={4000}
      />
    </PrinterProvider>
  );
};

export default App;
