import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
} from 'react-native';

const heightDevice = Dimensions.get('window').height;
const widthDevice = Dimensions.get('window').width;
import {
  TextHighLightBold,
  TextNormal,
  TextNormalSemiBold,
  TextSemiBold,
} from 'common/Text/TextFont';
import {useDispatch, useSelector} from 'react-redux';
import {NAVIGATION_HOME, NAVIGATION_MAIN} from 'navigation/routes';

import {isErrorSendOtp, isStatusSendPhone} from 'store/selectors';

import Svg from 'common/Svg/Svg';
import Status from 'common/Status/Status';
import {background_login} from 'assets/constans';
import Colors from 'theme/Colors';
import {loginInternal} from 'store/actions';
import strings from 'localization/Localization';
import styles from './styles';

const Login = props => {
  const refInput = useRef(null);
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);

  const statusLogin = useSelector(state => isStatusSendPhone(state));

  const submitLogin = () => {
    if (username === '' || password === '') {
      return;
    }
    dispatch(loginInternal({username: username, password: password}));
  };

  useEffect(() => {
    if (statusLogin === Status.SUCCESS) {
      props.navigation.navigate(NAVIGATION_MAIN, {});
    } else if (statusLogin === Status.ERROR) {
      setShowError(true);
    }
    // console.log(widthDevice, heightDevice);
  }, [statusLogin]);

  return (
    <View style={styles.loginScreen}>
      <View style={{width: widthDevice * 0.55, height: heightDevice}}>
        <ImageBackground
          style={styles.imgBackground}
          source={background_login}
          resizeMode={'stretch'}>
          <View style={styles.logoTea}>
            <Svg name={'icon_login_logo'} size={108} style />
          </View>
          <Svg name={'icon_login_content'} size={350} />
        </ImageBackground>
      </View>

      <View style={styles.containerLogin}>
        <TextSemiBold style={styles.titleLogin}>{'Đăng nhập'}</TextSemiBold>
        <TextInput
          ref={refInput}
          placeholder="Tài khoản"
          placeholderTextColor={Colors.secondary}
          style={styles.styleTextInput}
          onChangeText={setUsername}
        />
        <TouchableOpacity>
          <TextInput
            ref={refInput}
            placeholder="Mật khẩu"
            placeholderTextColor={Colors.secondary}
            style={styles.styleTextInput}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
          {password && password.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowPassword(prev => (prev = !prev))}
              style={styles.hideText}>
              <TextNormal style={{color: Colors.gray}}>
                {showPassword ? 'ẨN' : 'HIỂN THỊ'}
              </TextNormal>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={submitLogin}
          disabled={statusLogin === Status.LOADING || !username || !password}
          style={[
            styles.buttonSubmitPhone,
            username && password && {backgroundColor: Colors.primary},
          ]}>
          <TextHighLightBold
            style={[
              styles.textConfirm,
              username && password && {color: Colors.whiteColor},
            ]}>
            {'Đăng nhập'}
          </TextHighLightBold>
        </TouchableOpacity>
        {showError === true && (
          <TextNormal style={styles.textError}>
            {'Tài khoản hoặc mật khẩu không đúng'}
          </TextNormal>
        )}
      </View>
    </View>
  );
};

export default Login;
