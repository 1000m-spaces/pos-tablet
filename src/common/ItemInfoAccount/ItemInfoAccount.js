import {widthDevice} from 'assets/constans';
import SeparatorLine from 'common/SeparatorLine/SeparatorLine';
import {TextNormal} from 'common/Text/TextFont';
import React, {useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Keyboard,
} from 'react-native';
import Colors from 'theme/Colors';
import Svg from 'common/Svg/Svg';
import moment from 'moment';
import strings from 'localization/Localization';

const ItemInfoAccount = ({
  infor,
  onChangeValue,
  setPickerShow,
  gender,
  myBirthday,
  infoBirthday,
}) => {
  const [info, setInfo] = React.useState({});
  const handleUpdateValue = (item, value) => {
    setInfo({[item.field]: value, field: item.field});
  };
  useEffect(() => {
    onChangeValue(infor, info);
  }, [info]);
  useEffect(() => {
    if (infor?.field === 'cust_birthday') {
      onChangeValue(infor, infoBirthday);
    }
  }, [infoBirthday]);
  const handleFocusDatePicker = () => {
    Keyboard.dismiss();
    setPickerShow(true, infor);
  };
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.content}>
        <Svg name={infor.icon} size={36} color={'white'} />
        <View style={styles.column} />
        {infor?.field !== 'cust_birthday' &&
          infor?.field !== 'gender' &&
          infor?.field !== 'custphone' && (
            <TextInput
              underlineColorAndroid="transparent"
              returnKeyLabel={strings.common.finish}
              returnKeyType={'done'}
              style={styles.styleTextInput}
              placeholder={infor?.name}
              value={info[infor?.field]}
              defaultValue={infor?.name}
              keyboardType={infor?.type ? infor.type : 'default'}
              onChangeText={value => handleUpdateValue(infor, value)}
            />
          )}
        {infor?.field === 'cust_birthday' && (
          <TextInput
            underlineColorAndroid="transparent"
            style={[
              styles.styleTextInput,
              {color: myBirthday || infor?.name ? 'black' : 'grey'},
            ]}
            value={
              myBirthday || infor?.name
                ? myBirthday ||
                  moment(infor?.name, 'YYYY-MM-DD hh:mm:ss').format(
                    'DD/MM/YYYY',
                  )
                : strings.accountScreen.dateofBirth
            }
            onFocus={handleFocusDatePicker}
          />
        )}
        {infor?.field === 'gender' && (
          <TextNormal
            style={
              gender[4] === true ? styles.textName : styles.textNameGender
            }>
            {gender[4] !== true
              ? gender[0] === true
                ? strings.accountScreen.male
                : gender[1] === true
                ? strings.accountScreen.female
                : strings.accountScreen.other
              : strings.accountScreen.selectGender}
          </TextNormal>
        )}
        {infor?.field === 'custphone' && (
          <TextNormal style={styles.textPhone}>{infor?.name}</TextNormal>
        )}
        {/* {isPickerShow === true && (
          <DateTimePicker
            value={birthday.current}
            mode={'date'}
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={onChangeDate}
            // style={styles.datePicker}
          />
        )} */}
      </View>

      <SeparatorLine
        separatorLine={styles.separator}
        pointSeparatorLine={styles.pointSeparator}
      />
    </TouchableOpacity>
  );
};

export default ItemInfoAccount;

const styles = StyleSheet.create({
  containerModalPicker: {
    paddingVertical: 20,
    backgroundColor: Colors.backgroundColor,
    width: widthDevice - 24,
    // height: heightDevice * 0.634,
    borderRadius: 17,
  },
  styleTextInput: {
    height: 40,
    width: '80%',
    color: 'black',
    marginLeft: 20,
  },
  container: {
    backgroundColor: Colors.whiteColor,
    width: widthDevice - 30,
    height: 60,
    paddingHorizontal: 15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    height: 50,
  },
  imageContainer: {},
  column: {
    width: 1,
    height: 22,
    backgroundColor: Colors.textGrayColor,
    marginLeft: 15,
  },
  image: {
    height: 25,
    width: 25,
  },
  textName: {
    marginLeft: 20,
    fontStyle: 'italic',
    color: 'grey',
    paddingHorizontal: 2,
  },
  textNameGender: {
    marginLeft: 20,
    paddingHorizontal: 3,
  },
  separator: {
    width: '100%',
    backgroundColor: '#BCBCBC',
  },
  pointSeparator: {
    backgroundColor: '#BCBCBC',
  },
  textPhone: {
    marginLeft: 25,
    fontSize: 15,
  },
});
