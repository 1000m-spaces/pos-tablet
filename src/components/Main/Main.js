import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as Screens from 'components';
import {NAVIGATION_HOME, NAVIGATION_MENU} from 'navigation/routes';
// import Images from 'common/Images/Images';
// import {
//   heightDevice,
//   icon_account,
//   icon_home,
//   icon_menu,
//   icon_shop,
//   widthDevice,
// } from 'assets/constans';
import {Platform, StyleSheet, View} from 'react-native';
import Colors from 'theme/Colors';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg from 'common/Svg/Svg';
import {TextSmallEleven} from 'common/Text/TextFont';
import {widthDevice} from 'assets/constans';
import strings from 'localization/Localization';
import {useSelector} from 'react-redux';
import {getCurrentLanguage} from 'store/selectors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// const StackAccount = () => {
//   return (
//     <Stack.Navigator
//       screenOptions={{header: () => null}}
//       initialRouteName={NAVIGATION_ACCOUNT}>
//       <Stack.Screen name={NAVIGATION_ACCOUNT} component={Screens.Account} />
//       <Stack.Screen
//         name={NAVIGATION_ACCOUNT_INFO}
//         component={Screens.AccountInfo}
//       />
//       <Stack.Screen
//         name={NAVIGATION_ACCOUNT_ORDER_HISTORY}
//         component={Screens && Screens.HistoryOrder ? Screens.HistoryOrder : ''}
//       />
//     </Stack.Navigator>
//   );
// };

// icon_giohang1
const Main = () => {
  const insets = useSafeAreaInsets();
  const currentUserLanguage = useSelector(state => getCurrentLanguage(state));

  useEffect(() => {
    console.log('CHANGE LANGUAGE:::::', currentUserLanguage);
  }, [currentUserLanguage]);

  return (
    <Tab.Navigator
      initialRouteName={NAVIGATION_HOME}
      screenOptions={({route}) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({color, size, focused}) => {
          const icons = {
            [NAVIGATION_HOME]: 'icon_svg_home',
            // [NAVIGATION_SHOP]: 'icon_svg_shop',
            // [NAVIGATION_MENU]: 'icon_svg_menu',
            // [NAVIGATION_REVIEW]: 'icon_rating',
            // [NAVIGATION_ACCOUNT]: 'icon_svg_account',
          };
          const title = router => {
            switch (router) {
              case NAVIGATION_HOME:
                return strings.common.home;
              // case NAVIGATION_MENU:
              //   return 'Menu';
              // case NAVIGATION_SHOP:
              //   return strings.common.store;
              // case NAVIGATION_REVIEW:
              //   return strings.common.reviews;
              // case NAVIGATION_ACCOUNT:
              //   return strings.common.user;
              default:
            }
          };
          return (
            // <Images
            //   resizeMode="contain"
            //   style={styles.icon}
            //   styleContainer={styles.styleContainerIcon}
            //   source={icons[route.name]}
            //   tintColor={
            //     focused ? Colors.buttonTextColor : Colors.textGrayColor
            //   }
            // />
            <View
              style={{
                alignItems: 'center',
                width: widthDevice / 5,
              }}>
              <Svg
                name={icons[route.name]}
                size={35}
                color={focused ? Colors.buttonTextColor : Colors.textGrayColor}
                style={{
                  marginTop: 10,
                }}
              />
              <TextSmallEleven
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  fontSize: 11,
                  fontWeight:
                    Platform.OS === 'ios'
                      ? focused
                        ? 'bold'
                        : 'normal'
                      : 'normal',
                  fontFamily: focused
                    ? 'SVN-Poppins-SemiBold'
                    : 'SVN-Poppins-Regular',
                  marginBottom: insets.bottom > 0 ? 0 : 13,
                  color: focused
                    ? Colors.buttonTextColor
                    : Colors.textGrayColor,
                }}>
                {title(route.name)}
              </TextSmallEleven>
            </View>
          );
        },
        tabBarActiveTintColor: Colors.buttonTextColor,
        tabBarInactiveTintColor: Colors.textGrayColor,
        // tabBarLabelStyle: {
        //   fontSize: 11,
        //   fontFamily: 'SVN-Poppins-Regular',
        //   marginBottom: insets.bottom > 0 ? 0 : 13,
        // },
        headerShown: false,
        tabBarStyle: {height: 75 + insets.bottom / 2},
      })}>
      <Tab.Screen
        name={NAVIGATION_HOME}
        component={Screens.Home}
        options={{title: () => null}}
      />
    </Tab.Navigator>
  );
};

export default Main;

const styles = StyleSheet.create({
  icon: {
    height: 27,
    width: 27,
  },
  styleContainerIcon: {
    marginTop: 5,
  },
});
