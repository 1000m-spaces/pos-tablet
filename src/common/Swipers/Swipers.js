import Images from 'common/Images/Images';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import Colors from 'theme/Colors';

const Swipers = ({data}) => {
  return (
    <View style={styles.container}>
      <SwiperFlatList
        autoplayLoop={true}
        index={0}
        showsButtons={false}
        autoplay={true}
        autoplayDelay={4}
        // containerStyle={styles.containerStyle}
        // contentContainerStyle={styles.contentContainerStyle}
        showPagination={true}
        // dot={<View style={styles.dot} />}
        // activeDot={<View style={styles.active_dot} />}
        paginationStyleItemActive={{
          backgroundColor: Colors.buttonTextColor,
          width: 7,
          height: 7,
          marginTop: 20,
        }}
        paginationStyleItemInactive={{
          backgroundColor: '#D9D9D9',
          width: 7,
          height: 7,
          marginTop: 20,
        }}>
        {data &&
          data.map((banner, index) => {
            return (
              <View key={banner.id}>
                <TouchableOpacity
                  activeOpacity={1}
                  key={index}
                  style={styles.slide}>
                  <Images
                    resizeMode="contain"
                    style={styles.image}
                    source={{uri: banner?.image}}
                    // source={banner.image}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
      </SwiperFlatList>
    </View>
  );
};

export default Swipers;
