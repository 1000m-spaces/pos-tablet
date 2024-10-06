import RootNavigation from 'navigation/RootNavigation';
import React, {useEffect} from 'react';

import {LogBox, TextInput} from 'react-native';
import {setCustomText} from 'react-native-global-props';

const customTextProps = {
  allowFontScaling: false,
};

const App = () => {
  useEffect(() => {
    setCustomText(customTextProps);
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
    console.disableYellowBox = true;
    LogBox.ignoreAllLogs();
  }, []);

  return <RootNavigation />;
};

export default App;
