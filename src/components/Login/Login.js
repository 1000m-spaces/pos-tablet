import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';

// import {View} from 'react-native';
import {
  TextNormal,
  TextNormalSemiBold,
  TextSemiBold,
} from 'common/Text/TextFont';
import SeparatorLine from 'common/SeparatorLine/SeparatorLine';
import {useDispatch, useSelector} from 'react-redux';
import {NAVIGATION_HOME} from 'navigation/routes';

import {isErrorSendOtp, isStatusSendPhone} from 'store/selectors';

import Svg from 'common/Svg/Svg';
import Status from 'common/Status/Status';
import {heightDevice} from 'assets/constans';
import Colors from 'theme/Colors';
import {loginInternal} from 'store/actions';
import strings from 'localization/Localization';
import styles from './styles';

const Login = props => {
  const refInput = useRef(null);
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      props.navigation.navigate(NAVIGATION_HOME, {});
    } else if (statusLogin === Status.ERROR) {
      setShowError(true);
    }
  }, [statusLogin]);

  return (
    <SafeAreaView style={styles.safeView}>
      <Pressable style={{flex: 1}} onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={{marginTop: 20}}>
            <TextNormal style={styles.textHello}>
              {strings.loginScreen.greeting}
            </TextNormal>
            {/* <TextSemiBold>aa:{BASE_PATH_CAFE}</TextSemiBold> */}
            <TextNormal style={[styles.textIntro, {paddingVertical: 20}]}>
              {'Vui lòng đăng nhập'}
            </TextNormal>
          </View>
          <View style={[styles.separatorLine, {marginTop: 40}]}>
            <SeparatorLine />
          </View>
          <View style={{paddingTop: 0.16 * heightDevice}}>
            <TouchableOpacity
              onPress={() => refInput.current.focus()}
              style={styles.containerButtonInputPhone}>
              <TextNormal style={styles.codeCountry} />
              <TextInput
                ref={refInput}
                placeholder="Tên tk"
                placeholderTextColor={Colors.textGrayColor}
                style={styles.styleTextInput}
                onChangeText={text => setUsername(text)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => refInput.current.focus()}
              style={styles.containerButtonInputPhone2}>
              <TextNormal style={styles.codeCountry} />
              <TextInput
                ref={refInput}
                placeholder="Mật khẩu"
                placeholderTextColor={Colors.textGrayColor}
                style={styles.styleTextInput}
                secureTextEntry={true}
                onChangeText={text => setPassword(text)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => submitLogin()}
              disabled={statusLogin === Status.LOADING}
              style={[
                styles.buttonSubmitPhone,
                statusLogin === Status.LOADING && {opacity: 0.5},
              ]}>
              {/* <Icons
                type={'MaterialIcons'}
                name={'navigate-next'}
                size={40}
                color={'white'}
              /> */}
              <TextSemiBold style={styles.textConfirm}>
                {'Đăng nhập'}
              </TextSemiBold>
            </TouchableOpacity>
            {showError === true && (
              <TextNormal style={styles.textError}>
                {'Đăng nhập thất bại'}
              </TextNormal>
            )}
          </View>
        </View>
      </Pressable>
    </SafeAreaView>
    // <View style={{flex: 1}}>
    //   <View style={{flex: 1, backgroundColor: 'white'}} />
    // </View>
  );
};

export default Login;
