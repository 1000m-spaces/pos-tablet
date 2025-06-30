import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import {
  TextNormal,
  TextSemiBold,
} from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import Svg from 'common/Svg/Svg';
import AsyncStorage from 'store/async_storage/index';

const Header = ({ navigation, productMenu, currentCate, setCurrentCate }) => {
  const [userShop, setUserShop] = useState(null);

  useEffect(() => {
    const loadUserShop = async () => {
      const user = await AsyncStorage.getUser();
      if (user && user.shops) {
        setUserShop(user.shops);
      }
    };
    loadUserShop();
  }, []);

  const renderTabCate = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => setCurrentCate(index)}
        style={[
          styles.containerCateTab,
          currentCate === index && {
            backgroundColor: Colors.primary,
            borderWidth: 0,
          },
        ]}>
        <TextNormal
          style={{
            fontWeight: currentCate === index ? '500' : '400',
            textTransform: 'capitalize',
            fontSize: 14,
            color:
              currentCate === index ? Colors.whiteColor : Colors.inactiveText,
          }}>
          {item.catename.replaceAll('\t', '')}
        </TextNormal>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.containerHeader}>
      <View style={styles.wrapperHeader}>
        <View>
          <TextSemiBold style={styles.storeText}>
            {userShop ? userShop.name_vn : 'Loading...'}
          </TextSemiBold>
          <TextNormal style={styles.timeText}>
            {new Date().toLocaleDateString('vi-VN')}
          </TextNormal>
        </View>
        <TouchableOpacity style={styles.searchHeader}>
          <Svg name={'search'} size={18} />
          <TextNormal style={{ color: Colors.secondary, fontSize: 14 }}>
            {' Tìm kiếm món'}
          </TextNormal>
        </TouchableOpacity>
      </View>
      <FlatList
        data={productMenu || []}
        keyExtractor={(_, idx) => idx}
        renderItem={renderTabCate}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 12,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Header;
