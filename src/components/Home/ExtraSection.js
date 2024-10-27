import {formatMoney} from 'assets/constans';
import Svg from 'common/Svg/Svg';
import {TextNormal} from 'common/Text/TextFont';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from 'theme/Colors';

const ExtraSection = ({topping, onSelectTopping}) => {
  const renderTopping = ({item, _}) => {
    return (
      <View style={{paddingBottom: 24}}>
        <TextNormal style={styles.typeText}>
          {item.id === 0 ? 'Topping' : 'Nhiệt độ'}
        </TextNormal>
        {item.data.map((tpp, idx) => {
          return (
            <TouchableOpacity
              onPress={() => onSelectTopping(item.id, tpp)}
              style={[
                styles.warpperOptionItem,
                idx === item.data.length - 1 && {borderBottomWidth: 0},
              ]}>
              <View style={styles.row}>
                <Svg
                  name={tpp?.value ? 'selected_circle' : 'circle'}
                  size={20}
                  color={'white'}
                />
                <TextNormal style={styles.nameText}>
                  {tpp?.display_name}
                </TextNormal>
              </View>
              {tpp?.def_price > 0 && (
                <TextNormal style={{color: Colors.topping}}>
                  {formatMoney(tpp?.def_price) + 'đ'}
                </TextNormal>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={styles.line} />
      </View>
    );
  };
  return (
    <View style={styles.wrapperSection}>
      <FlatList
        data={topping}
        scrollEnabled={false}
        keyExtractor={(op, _) => op?.id}
        renderItem={renderTopping}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ExtraSection;
const styles = StyleSheet.create({
  warpperOptionItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#F2F1F1',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  nameText: {paddingLeft: 10, fontSize: 16, color: Colors.topping},
  wrapperSection: {backgroundColor: 'white', paddingVertical: 24},
  wrapperTitle: {flexDirection: 'row', alignItems: 'center'},
  titleText: {fontSize: 16, fontWeight: 'bold'},
  row: {flexDirection: 'row', alignItems: 'center'},
  typeText: {
    paddingBottom: 4,
    fontWeight: 'bold',
    fontSize: 16,
    paddingLeft: 24,
  },
  line: {height: 6, backgroundColor: '#F5F5F5', marginTop: 24},
});
