import Svg from 'common/Svg/Svg';
import {TextNormal} from 'common/Text/TextFont';
import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import Colors from 'theme/Colors';

const Options = ({options, onSelectOption}) => {
  const optionHeader = () => {
    return (
      <View style={styles.wrapperTitle}>
        <TextNormal style={styles.titleText}>{'Option'}</TextNormal>
        <TextNormal style={{color: Colors.inactiveText}}>
          {'  (chọn ít nhất 1 mục)'}
        </TextNormal>
      </View>
    );
  };
  const renderOption = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => onSelectOption(item)}
        style={[
          styles.warpperOptionItem,
          index === options.length - 1 && {borderBottomWidth: 0},
        ]}>
        <Svg
          name={item?.value ? 'selected_circle' : 'circle'}
          size={20}
          color={'white'}
        />
        <TextNormal style={styles.nameText}>{item?.name_vn}</TextNormal>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.wrapperSection}>
      <FlatList
        data={options}
        ListHeaderComponent={options.length > 0 ? optionHeader : null}
        keyExtractor={(op, _) => op?.id}
        renderItem={renderOption}
      />
    </View>
  );
};

export default Options;
const styles = StyleSheet.create({
  warpperOptionItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#F2F1F1',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },

  nameText: {paddingLeft: 10, fontSize: 16},

  wrapperSection: {backgroundColor: 'white', padding: 24},
  wrapperTitle: {flexDirection: 'row', alignItems: 'center', paddingBottom: 4},
  titleText: {fontSize: 16, fontWeight: 'bold'},
});
