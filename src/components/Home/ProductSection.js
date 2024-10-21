import FastImage from 'react-native-fast-image';
import {formatMoney, IMAGE_URL} from 'assets/constans';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TextNormal} from 'common/Text/TextFont';
import Colors from 'theme/Colors';

const ProductSection = ({detailProduct}) => {
  return (
    <View>
      <View style={styles.conatinerProductSection}>
        <FastImage
          style={[styles.image]}
          source={{
            uri: detailProduct.prodimg.includes('https')
              ? `${detailProduct.prodimg}`
              : `${IMAGE_URL}${detailProduct.prodimg}`,
            priority: FastImage.priority.high,
          }}
        />
        <View style={styles.infoSection}>
          <TextNormal style={styles.nameText}>
            {detailProduct.prodname}
          </TextNormal>
          <TextNormal style={styles.priceText}>
            {formatMoney(detailProduct.prodprice) + 'đ'}
          </TextNormal>
        </View>
      </View>
      <View style={styles.line} />
    </View>
  );
};

export default ProductSection;
const styles = StyleSheet.create({
  image: {
    width: 190,
    height: 142,
    borderRadius: 12,
  },
  conatinerProductSection: {
    flexDirection: 'row',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  priceText: {fontWeight: 'bold', color: Colors.primary},
  line: {height: 6, backgroundColor: '#F5F5F5'},
  nameText: {fontSize: 20, fontWeight: '500', paddingBottom: 8},
  infoSection: {paddingLeft: 16, flex: 1},
});
