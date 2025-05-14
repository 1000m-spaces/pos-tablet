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
import StoreSelectionDialog from '../Order/StoreSelectionDialog';

const Header = ({ navigation, productMenu, currentCate, setCurrentCate }) => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [showStoreDialog, setShowStoreDialog] = useState(false);

  useEffect(() => {
    const loadSelectedStore = async () => {
      const storeInfo = await AsyncStorage.getSelectedStore();
      if (storeInfo) {
        setSelectedStore(storeInfo);
      }
    };
    loadSelectedStore();
  }, []);

  const handleStoreSelect = async (store) => {
    setSelectedStore(store);
    await AsyncStorage.setSelectedStore(store);
    setShowStoreDialog(false);
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
        <TouchableOpacity onPress={() => setShowStoreDialog(true)}>
          <TextSemiBold style={styles.storeText}>
            {selectedStore ? selectedStore.name : 'Select Store'}
          </TextSemiBold>
          <TextNormal style={styles.timeText}>
            {new Date().toLocaleDateString('vi-VN')}
          </TextNormal>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchHeader}>
          <Svg name={'search'} size={20} />
          <TextNormal style={{ color: Colors.secondary }}>
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
          paddingTop: 18,
        }}
        showsVerticalScrollIndicator={false}
      />
      <StoreSelectionDialog
        visible={showStoreDialog}
        onClose={() => setShowStoreDialog(false)}
        onStoreSelect={handleStoreSelect}
      />
    </View>
  );
};

export default Header;
