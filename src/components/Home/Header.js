import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, View, TextInput } from 'react-native';
import styles from './styles';
import {
  TextNormal,
  TextSemiBold,
} from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import Svg from 'common/Svg/Svg';
import AsyncStorage from 'store/async_storage/index';

const Header = ({ navigation, productMenu, currentCate, setCurrentCate, onSearchResults }) => {
  const [userShop, setUserShop] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadUserShop = async () => {
      const user = await AsyncStorage.getUser();
      if (user && user.shops) {
        setUserShop(user.shops);
      }
    };
    loadUserShop();
  }, []);

  // Filter products based on search text
  const filteredProductMenu = useMemo(() => {
    if (!searchText.trim()) {
      return productMenu;
    }

    const searchLower = searchText.toLowerCase();

    // Filter products across all categories
    const filteredCategories = productMenu?.map(category => {
      const filteredProducts = category.products?.filter(product =>
        product.prodname?.toLowerCase().includes(searchLower)
      ) || [];

      return {
        ...category,
        products: filteredProducts
      };
    }).filter(category => category.products.length > 0);

    return filteredCategories || [];
  }, [productMenu, searchText]);

  // Pass filtered results to parent component
  useEffect(() => {
    if (onSearchResults) {
      onSearchResults(filteredProductMenu, searchText.trim() !== '');
    }
  }, [filteredProductMenu, searchText, onSearchResults]);

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

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
        <View style={{ width: 246 }}>
          <TextSemiBold style={styles.storeText}>
            {userShop ? userShop.name_vn : 'Loading...'}
          </TextSemiBold>
          <TextNormal style={styles.timeText}>
            {new Date().toLocaleDateString('vi-VN')}
          </TextNormal>
        </View>
        <View style={styles.searchHeader}>
          <Svg name={'search'} size={24} />
          <TextInput
            style={{
              color: Colors.secondary,
              fontSize: 14,
              flex: 1,
              marginLeft: 8,
              paddingVertical: 0,
              paddingHorizontal: 4,
              height: '100%'
            }}
            placeholder="Tìm kiếm món"
            placeholderTextColor={Colors.secondary}
            value={searchText}
            onChangeText={handleSearchChange}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>
      <FlatList
        nestedScrollEnabled={true}
        data={filteredProductMenu || []}
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
