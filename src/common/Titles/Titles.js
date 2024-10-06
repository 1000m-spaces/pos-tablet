import {icon_english} from 'assets/constans';
import Icons from 'common/Icons/Icons';
import Images from 'common/Images/Images';
import {TextSemiBold} from 'common/Text/TextFont';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles';
import Svg from 'common/Svg/Svg';
import strings from 'localization/Localization';

const Titles = ({
  iconLanguage,
  iconBack,
  // pressSetLanguage,
  // currentLanguage,
  onPressBack,
  title,
}) => {
  const styl = styles({iconLanguage, iconBack});
  return (
    <View style={styl.container}>
      {iconBack ? (
        <TouchableOpacity onPress={onPressBack} style={styl.buttonBack}>
          <Icons
            type={'Ionicons'}
            name={'chevron-back'}
            size={23}
            color={'#3C3C3C'}
          />
        </TouchableOpacity>
      ) : null}
      <View style={styl.viewTextTitle}>
        <TextSemiBold style={styl.textTitle}>
          {' '}
          {title ? title : strings.common.user}
        </TextSemiBold>
      </View>
      {/* {iconLanguage ? (
        <TouchableOpacity
          onPress={pressSetLanguage}
          style={styl.buttonLanguage}>
          {currentLanguage === 'vi' ? (
            <Svg name={'viet'} size={22} style={styl.imageVietNam} />
          ) : (
            <Images
              style={styl.iconEnglish}
              // styleContainer={styles.containerImage}
              source={icon_english}
            />
          )}
          <Svg name={'icon_language1'} size={34} style={styl.imageTranslate} />
        </TouchableOpacity>
      ) : null} */}
    </View>
  );
};

export default Titles;
