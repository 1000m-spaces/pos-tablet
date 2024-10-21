import React from 'react';
import {FlatList, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import {TextNormal, TextSemiBold} from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import Svg from 'common/Svg/Svg';

const Header = ({productMenu, currentCate, setCurrentCate}) => {
  const renderTabCate = ({item, index}) => {
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
            {'45 Nguyễn Thị Định'}
          </TextSemiBold>
          <TextNormal style={styles.timeText}>
            {new Date().toLocaleDateString('vi-VN')}
          </TextNormal>
        </View>
        <TouchableOpacity style={styles.searchHeader}>
          <Svg name={'search'} size={20} />
          <TextNormal style={{color: Colors.secondary}}>
            {' Tìm kiếm món'}
          </TextNormal>
        </TouchableOpacity>
      </View>
      <FlatList
        data={productMenu || []}
        keyExtractor={(cate, idx) => `${cate.name}_${cate.id}_${idx}`}
        renderItem={renderTabCate}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 18,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Header;
