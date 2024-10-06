import {widthDevice} from 'assets/constans';
import SeparatorLine from 'common/SeparatorLine/SeparatorLine';
// import {TextNormalSemiBold} from 'common/Text/TextFont';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View, TouchableOpacity} from 'react-native';
import {TextNormal} from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import CheckBox from '@react-native-community/checkbox';
import {formatMoney} from 'assets/constans';
import strings from 'localization/Localization';

const Options = ({listOption, updateOptionChange}) => {
  const [checkedOption, setCheckedOption] = useState({0: false});
  const [checkedType1, setCheckedType1] = useState({0: false});
  const handleOptionsOnpress = (item, index) => {
    switch (item.group_type) {
      case -1:
        setCheckedOption({...item, [index]: true});
        break;
      case 1:
        setCheckedType1({...item, [index]: true});
        break;
      case 0:
        updateOptionChange({
          ...item,
          value: !item?.value,
        });
        break;
      case 2:
        updateOptionChange({
          ...item,
          value: !item?.value,
        });
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    if (listOption && listOption.length > 0) {
      setTimeout(() => {
        listOption.map((item, index) => {
          if (item?.group_type === -1 && item?.value === true) {
            setCheckedOption({[index]: true});
          }
          if (item?.group_type === 1 && item?.value === true) {
            setCheckedType1({[index]: true});
          }
        });
      }, 100);
    }
  }, [listOption]);
  useEffect(() => {
    updateOptionChange(checkedOption);
  }, [checkedOption]);
  useEffect(() => {
    updateOptionChange(checkedType1);
  }, [checkedType1]);
  const renderOptionItem = ({item, index}) => {
    return (
      <TouchableOpacity onPress={() => handleOptionsOnpress(item, index)}>
        <View style={styles.content}>
          <View style={styles.viewCheckBox}>
            <CheckBox
              boxType={'square'}
              lineWidth={2}
              disabled={false}
              style={styles.styleCheckbox}
              tintColors={{
                true: Colors.buttonTextColor,
                false: Colors.buttonTextColor,
              }}
              onTintColor={Colors.buttonTextColor}
              onFillColor={Colors.buttonTextColor}
              onCheckColor={Colors.whiteColor}
              width={17}
              value={
                item?.group_type === -1
                  ? checkedOption[index]
                  : item?.group_type === 1
                  ? checkedType1[index]
                  : item?.value
              }
              onChange={() => handleOptionsOnpress(item, index)}
            />
            <TextNormal style={styles.textNameOption}>
              {strings.getLanguage() === 'vi' ? item?.name_vn : item?.name_eng}
            </TextNormal>
          </View>
          <View style={styles.priceSection}>
            <TextNormal style={styles.textPrice}>
              {item?.price && item?.price > 0
                ? formatMoney(item?.price) + 'p'
                : ''}
            </TextNormal>
          </View>
        </View>
        {index !== listOption.length - 1 && (
          <SeparatorLine
            separatorLine={styles.separatorLine}
            pointSeparatorLine={styles.pointSeparator}
          />
        )}
      </TouchableOpacity>
    );
  };
  return (
    <View>
      <FlatList
        data={listOption}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderOptionItem}
      />
    </View>
  );
};

export default Options;
const styles = StyleSheet.create({
  priceSection: {
    paddingHorizontal: 10,
  },
  viewCheckboxTopping: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textPrice: {
    color: Colors.buttonTextColor,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  viewCheckBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  styleCheckbox: {
    marginRight: 20,
    marginLeft: 2,
    height: 17,
    width: 17,
  },
  textNameOption: {
    color: 'black',
  },
  separatorLine: {
    width: widthDevice - 35,
    backgroundColor: '#E9E9E9',
  },
  pointSeparator: {
    backgroundColor: '#E9E9E9',
  },
  money: {
    color: Colors.buttonTextColor,
  },
});
