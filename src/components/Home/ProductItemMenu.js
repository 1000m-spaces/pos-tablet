import {TextNormalSemiBold, TextSmallMedium} from 'common/Text/TextFont';
import {IMAGE_URL} from 'assets/constans';
import React, {memo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {formatMoney} from 'assets/constans';
import FastImage from 'react-native-fast-image';

import {StyleSheet} from 'react-native';
import Colors from 'theme/Colors';
const ProductItemMenu = ({onPressDetail, product}) => {
  if (!product) {
    console.log('product is undefined');
    return;
  }
  return (
    <TouchableOpacity
      onPress={() => onPressDetail(product)}
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
        <View style={{padding: 16, alignItems: 'center'}}>
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
    marginRight: 16,
    height: 248,
    marginBottom: 24,
    // flex: 1,
    width: '30%',
  },
  content: {
    // justifyContent: 'space-between',
    flex: 1,
    paddingBottom: 8,
  },
  image: {
    height: 142,
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
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 8,
  },
});
