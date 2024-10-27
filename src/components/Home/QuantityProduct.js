import {formatMoney} from 'assets/constans';
import Svg from 'common/Svg/Svg';
import {TextNormal} from 'common/Text/TextFont';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Colors from 'theme/Colors';

const QuantityProduct = ({
  quantity,
  detailProduct,
  updateQuantity,
  onAddingCart,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.wrapperQuantity}>
        <TouchableOpacity
          disabled={quantity === 1}
          onPress={() => updateQuantity(-1)}>
          <Svg name={'icon_minus_pos'} size={32} color={'white'} />
        </TouchableOpacity>
        <TextNormal style={styles.textQuantity}>{quantity}</TextNormal>
        <TouchableOpacity onPress={() => updateQuantity(1)}>
          <Svg name={'icon_plus_pos'} size={32} color={'white'} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onAddingCart} style={styles.cartBtn}>
        <TextNormal style={styles.textCartBtn}>
          {`Thêm vào giỏ hàng - ${formatMoney(
            quantity * detailProduct.prodprice,
          )}đ`}
        </TextNormal>
      </TouchableOpacity>
    </View>
  );
};

export default QuantityProduct;
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    // height: 96,
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.whiteColor,
    width: '100%',
    elevation: 10,
  },
  cartBtn: {
    borderRadius: 12,
    backgroundColor: Colors.primary,
    height: 48,
    width: '65%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCartBtn: {fontWeight: 'bold', color: Colors.whiteColor},
  textQuantity: {paddingHorizontal: 12, fontSize: 24, fontWeight: 'bold'},
  wrapperQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
