import { TextNormalSemiBold, TextSmallMedium } from 'common/Text/TextFont';
import { IMAGE_URL, widthDevice } from 'assets/constans';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { formatMoney } from 'assets/constans';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { currentOrderSelector } from 'store/selectors';
import Toast from 'react-native-toast-message';

import { StyleSheet } from 'react-native';
import Colors from 'theme/Colors';
const ProductItemMenu = ({ onPressDetail, product }) => {
  const currentOrder = useSelector(state => currentOrderSelector(state));

  if (!product) {
    console.log('product is undefined');
    return;
  }

  const handleProductPress = () => {
    // Check if order type is selected
    if (!currentOrder.orderType) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng chọn loại đơn hàng',
        text2: 'Bạn cần chọn loại đơn hàng trước khi thêm sản phẩm',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    // If order type is selected, proceed with product detail
    onPressDetail(product);
  };

  return (
    <TouchableOpacity
      onPress={handleProductPress}
      style={[styles.container]}>
      <View style={styles.content}>
        <FastImage
          style={[styles.image]}
          source={{
            uri: product.prodimg.includes('https')
              ? `${product.prodimg}`
              : `${IMAGE_URL}${product.prodimg}`,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={{ padding: 16, alignItems: 'center' }}>
          <TextSmallMedium numberOfLines={2} style={styles.textName}>
            {product.prodname}
          </TextSmallMedium>
          <TextNormalSemiBold style={styles.priceText}>
            {formatMoney(product.prodprice) + 'đ'}
          </TextNormalSemiBold>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductItemMenu;

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: widthDevice * 0.02,
    height: widthDevice * 0.2378,
    marginBottom: 24,
    // flex: 1,
    width: widthDevice * 0.16136,
  },
  content: {
    // justifyContent: 'space-between',
    flex: 1,
    paddingBottom: 8,
  },
  image: {
    height: widthDevice * 0.16136,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  wrapperProductName: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  textName: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    // backgroundColor: 'red',
  },
  quantityNumber: {
    position: 'absolute',
    opacity: 0.9,
    height: 32,
    width: 32,
    backgroundColor: Colors.primary,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    top: 4,
    left: 4,
  },
  priceText: {
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 8,
  },
});
