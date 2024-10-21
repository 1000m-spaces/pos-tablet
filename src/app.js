import RootNavigation from 'navigation/RootNavigation';
import React, {useEffect} from 'react';
import Orientation from 'react-native-orientation-locker';
import {LogBox, TextInput, StatusBar, Dimensions} from 'react-native';
import {setCustomText} from 'react-native-global-props';
import 'react-native-gesture-handler';
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

  return <RootNavigation />;
};

export default App;
