import {React, useState, useRef, useEffect} from 'react';
import {View, Text, TextInput, Pressable} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import styles from './style';

const CodeInput = ({setPinReady, code, setCode, maxLength, navigation}) => {
  const codeDigitsArray = new Array(maxLength).fill(0);
  const textInputRef = useRef(null);
  const [inputContainerFocus, setInputContainerFocus] = useState(false);
  const handleOnBlur = () => {
    setInputContainerFocus(false);
  };
  const handleOnPress = () => {
    setInputContainerFocus(true);
    textInputRef?.current?.focus();
  };
  // useEffect(() => {
  //   const unsubscribes = navigation.addListener('focus', () => {
  //     setTimeout(() => {
  //       textInputRef?.current?.focus();
  //     }, 500);
  //   });

  //   return () => unsubscribes;
  // }, [navigation]);
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('blur', () => {
  //     textInputRef?.current?.blur();
  //   });

  //   return () => unsubscribe;
  // }, [navigation]);
  useEffect(() => {
    setPinReady(code.length === maxLength);
    return () => setPinReady(false);
  }, [code]);
  useEffect(() => {
    setTimeout(() => {
      handleOnPress();
    }, 600);
  }, []);
  const toCodeDigitInput = (value, index) => {
    const emptyInputChar = '';
    const digit = code[index] || emptyInputChar;
    const isCurrentDigit = index <= code.length - 1;
    const isLastDigit = index === maxLength - 1;
    const isCodeFull = code.length === maxLength;
    const isDigitFocused = isCurrentDigit || (isLastDigit && isCodeFull);
    const styleOTPInput = inputContainerFocus && isDigitFocused ? true : false;
    return (
      <View
        key={index}
        style={styleOTPInput ? styles.otpInputViewActive : styles.otpInputView}>
        <Text style={styles.otpInputText}>{digit}</Text>
      </View>
    );
  };

  return (
    <View style={styles.inputSection}>
      <Pressable style={styles.inputContainerPressable} onPress={handleOnPress}>
        {codeDigitsArray.map(toCodeDigitInput)}
      </Pressable>

      <TextInput
        value={code}
        onChangeText={setCode}
        maxLength={maxLength}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType="oneTimeCode"
        ref={textInputRef}
        onBlur={handleOnBlur}
        style={styles.hiddenTextInput}
        // autoFocus={true}
      />
    </View>
  );
};

export default CodeInput;
