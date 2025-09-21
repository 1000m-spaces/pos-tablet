import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import CryptoJS from 'crypto-js';

import {
  TextHighLightBold,
  TextNormal,
  TextNormalSemiBold,
  TextSemiBold,
} from 'common/Text/TextFont';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION_HOME, NAVIGATION_MAIN } from 'navigation/routes';

import { isErrorSendOtp, isStatusSendPhone } from 'store/selectors';

import Svg from 'common/Svg/Svg';
import Status from 'common/Status/Status';
import { background_login, heightDevice, widthDevice } from 'assets/constans';
import Colors from 'theme/Colors';
import { loginInternal, setScreenAction } from 'store/actions';
import strings from 'localization/Localization';
import styles from './styles';

const Login = props => {
  const refInput = useRef(null);
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const statusLogin = useSelector(state => isStatusSendPhone(state));
  const errorMessage = useSelector(state => isErrorSendOtp(state));

  const submitLogin = () => {
    if (username === '' || password === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    // Hash password using MD5
    // const hashedPassword = CryptoJS.MD5(password).toString();

    dispatch(loginInternal({
      username: username.trim(),
      password: password
    }));
  };

  useEffect(() => {
    if (statusLogin === Status.SUCCESS) {
      dispatch(setScreenAction(NAVIGATION_HOME));
      props.navigation.navigate(NAVIGATION_MAIN, {});
    }
  }, [statusLogin]);

  return (
    <View style={styles.loginScreen}>
      <View style={{ width: widthDevice * 0.55, height: heightDevice }}>
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
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity>
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor={Colors.secondary}
            style={styles.styleTextInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          {password && password.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.hideText}>
              <TextNormal style={{ color: Colors.gray }}>
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
            username && password && { backgroundColor: Colors.primary },
          ]}>
          <TextHighLightBold
            style={[
              styles.textConfirm,
              username && password && { color: Colors.whiteColor },
            ]}>
            {statusLogin === Status.LOADING ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </TextHighLightBold>
        </TouchableOpacity>
        {statusLogin === Status.ERROR && errorMessage && (
          <TextNormal style={styles.textError}>
            {errorMessage}
          </TextNormal>
        )}
      </View>
    </View>
  );
};

export default Login;
