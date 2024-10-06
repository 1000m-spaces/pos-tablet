import {TextNormal, TextSemiBold} from 'common/Text/TextFont';
import React, {useEffect} from 'react';
import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import Colors from 'theme/Colors';
import Svg from 'common/Svg/Svg';
const ItemNotify = ({
  onPressDetail,
  data,
  index,
  indexSelect,
  isModal,
  currentShop,
}) => {
  const handlePressDetail = () => {
    onPressDetail(data, index);
  };
  return (
    <TouchableOpacity style={[styles.container]} onPress={handlePressDetail}>
      {isModal === false && (
        <Svg name={'icon_mail1'} size={32} style={styles.styleLogoShop} />
      )}
      {data.msg_status === 0 && index !== indexSelect && (
        <View style={styles.dot} />
      )}
      <View style={styles.content}>
        <TextSemiBold
          style={{fontSize: 15, fontWeight: 'bold', color: '#004D40'}}>
          {data.restname}
        </TextSemiBold>
        {isModal === true && (
          <TextNormal style={{fontSize: 14}}>{data.restaddr}</TextNormal>
        )}
        {isModal === false && (
          <View style={styles.contentNotify}>
            <TextSemiBold style={styles.titleMessage}>
              CSKH <TextNormal>({data.create_date})</TextNormal>
            </TextSemiBold>
            <TextNormal
              numberOfLines={index === indexSelect ? 0 : 2}
              style={styles.voucherContent}>
              {data.msg}
            </TextNormal>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ItemNotify;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    paddingVertical: 12,
    // marginBottom: 5,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 10,
    marginTop: 5,
    // backgroundColor: '#abd9d1',
  },
  styleCheckbox: {
    //checkbox bên android khoảng cách margin đang hơi lỗi nên cần chỉnh lại
    marginLeft: Platform.OS === 'ios' ? 10 : 3, //checkbox tự cách left 7px ở android
    marginRight: Platform.OS === 'ios' ? 10 : 16, //checkbox tự cách right -6px ở android
    height: 18,
    width: 18,
    // backgroundColor: Colors.buttonTextColor,
  },
  styleLogoShop: {
    height: 55,
    width: 55,
    marginLeft: 5,
  },
  content: {
    marginLeft: 10,
    width: '80%',
    marginRight: 10,
  },
  containerHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: Colors.whiteColor,
    paddingVertical: 12,
    // marginBottom: 5,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: '#abd9d1',
    marginTop: 5,
  },
  voucherContent: {
    marginTop: 3,
  },
  voucherContentSelected: {
    marginTop: 3,
    backgroundColor: 'red',
  },
  titleMessage: {
    marginTop: 0,
  },
  contentNotify: {
    marginTop: -15,
  },
  dot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#26C6DA',
  },
});
