import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import Images from 'common/Images/Images';
import {
  TextNormal,
  TextNormalSemiBold,
  TextSemiBold,
  TextSmallEleven,
  TextSmallTwelve,
} from 'common/Text/TextFont';
import SeparatorLine from 'common/SeparatorLine/SeparatorLine';
import ShopAccountItems from 'common/ShopAccountItems/ShopAccountItems';
import {useDispatch, useSelector} from 'react-redux';
import {
  getCurrentShop,
  isListShopShowMoney,
  listShop,
  getCurrentLocation,
  getMyPackages,
  getStatusMyPackages,
  isStatusGetListShopShowMoney,
  getCurrentLanguage,
} from 'store/selectors';
import {asyncStorage} from 'store/index';
import Colors from 'theme/Colors';
import MyModal from 'common/MyModal/MyModal';
import {getListShopShowMoney, getMyShipmentPackages} from 'store/actions';
import Svg from 'common/Svg/Svg';

import {
  heightDevice,
  logo,
  widthDevice,
  icon_fire,
  formatMoney,
} from 'assets/constans';
import Icons from 'common/Icons/Icons';
import {NAVIGATION_FREE_SHIP} from 'navigation/routes';
import Status from 'common/Status/Status';
import strings from 'localization/Localization';
// import {icon_wallet, icon_prime} from 'assets/constans';
const Avata = ({
  nameIcon,
  onPressIconAvata,
  inAccountInfo,
  navigation,
  freeShip,
}) => {
  const currentUser = React.useRef({custid: -1});
  const currentLocation = useSelector(state => getCurrentLocation(state));
  const listShopsShowMoney = useSelector(state => isListShopShowMoney(state));
  const currentShop = useSelector(state => getCurrentShop(state));
  const statusMyPackages = useSelector(state => getStatusMyPackages(state));
  const statusGetListShopShowMoney = useSelector(state =>
    isStatusGetListShopShowMoney(state),
  );
  // console.log('list Shop: ', listShops, currentShop);
  const [openModalListShop, setOpenModalListShop] = useState(false);
  const [userCurrent, setUserCurrent] = useState({custid: ''});
  const [isIndexSelect, setIndexSelect] = useState(0);
  const myPackages = useSelector(state => getMyPackages(state));
  const [statusOfPackage, setStatusPackage] = useState('');
  const dispatch = useDispatch();
  const [currentBalance, setCurrentBalance] = useState({
    balance1: -1,
    balance2: -1,
  });
  const currentUserLanguage = useSelector(state => getCurrentLanguage(state));
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // console.log('CHANGE LANGUAGE:::::', currentUserLanguage);
    setRefreshing(true);
  }, [currentUserLanguage]);
  useEffect(() => {
    if (refreshing) {
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, [refreshing]);
  const onPressOpenListShop = () => {
    setOpenModalListShop(true);
  };
  const onPressOutSide = () => {
    setOpenModalListShop(false);
  };
  useEffect(() => {
    if (listShopsShowMoney && listShopsShowMoney.length > 0) {
      listShopsShowMoney.map(shop => {
        if (shop.restid === currentShop.restid) {
          setCurrentBalance({
            balance1: shop.balance1,
            balance2: shop.balance2,
          });
          return;
        }
      });
    }
  }, [listShopsShowMoney]);

  // const onPressSelectShop = () => {};

  React.useEffect(() => {
    initUser();
  }, []);
  useEffect(() => {
    if (myPackages && myPackages.length > 0) {
      if (myPackages[0].state === 1) {
        setStatusPackage({
          title: strings.accountScreen.registered,
          colorText: Colors.buttonTextColor,
        });
      } else if (myPackages[0].state === 0) {
        setStatusPackage({
          title: strings.accountScreen.unregistered,
          colorText: 'grey',
        });
      } else if (myPackages[0].state === 3) {
        setStatusPackage({
          title: strings.accountScreen.unsubscribe,
          colorText: 'red',
        });
      }
    }
  }, [myPackages]);
  const initUser = async () => {
    const user = await asyncStorage.getUser();
    // user.acctbal = parseInt(user.acctbal, 10);
    // user.acctbal2 = parseInt(user.acctbal2, 10);
    if (user && user.custid) {
      currentUser.current = user || {custid: -1};
      setUserCurrent(user);
    }
  };
  const handleNavigation = () => {
    if (myPackages && myPackages.length > 0) {
      navigation.navigate(NAVIGATION_FREE_SHIP, {fromAvatar: true});
    } else {
      navigation.navigate(NAVIGATION_FREE_SHIP);
    }
  };
  

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (currentUser?.current && currentUser?.current?.custid) {
      const bodyListShop = {
        lat: currentLocation.latitude,
        long: currentLocation.longitude,
        custid: currentUser.current?.custid,
      };
      dispatch(getListShopShowMoney(bodyListShop));
      const query = {
        userId: parseInt(currentUser.current?.custid, 10),
        // brandId: 100,
        // merchantId: parseInt(currentShop?.shopownerid, 10),
        // branchId: parseInt(currentShop.restid, 10),
      };
      dispatch(getMyShipmentPackages(query));
    }
    // setTimeout(() => {
    //   setRefreshing(false);
    // }, 1000);
  }, []);

  useEffect(() => {
    if (
      refreshing &&
      statusMyPackages !== Status.LOADING &&
      statusGetListShopShowMoney !== Status.LOADING
    ) {
      setRefreshing(false);
    }
  }, [statusMyPackages, statusGetListShopShowMoney]);

  return (
    <View>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* <View style={styles.container}> */}
        <View style={styles.content}>
          <Images source={logo} style={styles.image} />
          {nameIcon ? (
            <TouchableOpacity onPress={onPressIconAvata} style={styles.button}>
              <Svg
                name={nameIcon === 'icon_edit1' ? 'icon_edit1' : 'icon_camera1'}
                size={32}
                color={Colors.textGrayColor}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.textBalance}>
          <TextNormalSemiBold style={{color: Colors.buttonTextColor}}>
            ID: {userCurrent.custid}
          </TextNormalSemiBold>
        </View>
        {!inAccountInfo && currentUser.current?.custid !== -1 && (
          <View
            style={{
              width: widthDevice - 40,
              justifyContent: 'space-around',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              onPress={() => onPressOpenListShop(true)}
              style={styles.containerInfo}>
              <Svg
                name={'icon_wallet'}
                size={36}
                color={Colors.textGrayColor}
              />
              <TextSmallTwelve>{strings.accountScreen.balance}</TextSmallTwelve>
              <View style={styles.voucherSection}>
                <TextSmallTwelve>E-Voucher 1: </TextSmallTwelve>
                <TextNormalSemiBold style={styles.textVoucher}>
                  {formatMoney(currentBalance.balance1) + 'p'}
                </TextNormalSemiBold>
              </View>
              <View style={styles.voucherSection}>
                <TextSmallTwelve>E-Voucher 2: </TextSmallTwelve>
                <TextNormalSemiBold style={styles.textVoucher}>
                  {formatMoney(currentBalance.balance2) + 'p'}
                </TextNormalSemiBold>
              </View>
            </TouchableOpacity>
            <SeparatorLine
              separatorLine={styles.separatorLine}
              containerSeparatorLine={styles.containerSeparatorLine}
            />
            <TouchableOpacity
              onPress={handleNavigation}
              disabled={freeShip}
              style={[
                styles.containerInfo,
                {opacity: currentShop.restid === '218' ? 0.6 : 1},
              ]}>
              <Svg name={'icon_prime'} size={36} color={Colors.textGrayColor} />
              <TextSmallTwelve>Free Ship</TextSmallTwelve>
              <TextNormalSemiBold
                style={{
                  fontSize: 15,
                  paddingTop: 7,
                  color:
                    !myPackages || myPackages?.length === 0
                      ? 'grey'
                      : statusOfPackage.colorText,
                }}>
                {!myPackages || myPackages?.length <= 0
                  ? strings.accountScreen.unregistered
                  : statusOfPackage.title}
              </TextNormalSemiBold>
            </TouchableOpacity>
            {/* {freeShip && (
            <View style={styles.freeship}>
              <TouchableOpacity
                onPress={onPressFreeship}
                style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Images source={icon_fire} style={styles.iconFire} />
                <Text style={styles.freeshipText}>Freeship</Text>
              </TouchableOpacity>
            </View>
          )} */}
          </View>
        )}
        <MyModal visible={openModalListShop} onPressOutSide={onPressOutSide}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.containerModalListShop}>
            <View style={styles.headerModal}>
              <TextSemiBold style={styles.textListShop}>
                {strings.accountScreen.listShop}
              </TextSemiBold>
              <TouchableOpacity
                onPress={onPressOutSide}
                style={styles.buttonClose}>
                <Icons
                  type={'AntDesign'}
                  name={'close'}
                  color={'black'}
                  size={25}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={listShopsShowMoney}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.restid.toString()}
              renderItem={({item, index}) => {
                return (
                  <ShopAccountItems
                    data={item}
                    onPress={() => {}}
                    index={index}
                    isModal={false}
                    indexSelect={isIndexSelect}
                    currentShop={currentShop}
                  />
                );
              }}
            />
          </TouchableOpacity>
        </MyModal>
        {/* </View> */}
      </ScrollView>
      {nameIcon === 'icon_edit1' ? (
        <View style={styles.viewIconRefresh}>
          <TouchableOpacity
            onPress={() => onRefresh()}
            style={styles.buttonIconRefresh}>
            <Icons
              style={styles.iconRefresh}
              type={'SimpleLineIcons'}
              name={'refresh'}
              size={25}
              color={Colors.blackColor}
            />
          </TouchableOpacity>
          <TextNormal onPress={() => onRefresh()} style={{fontSize: 12}}>
            Refresh
          </TextNormal>
        </View>
      ) : null}
    </View>
  );
};

export default Avata;

const styles = StyleSheet.create({
  voucherSection: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 1,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
  },
  textVoucher: {
    color: Colors.redColor,
    fontSize: 14,
    textAlign: 'right',
    paddingRight: 5,
  },
  containerSeparatorLine: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  separatorLine: {
    height: 100,
    width: 1,
  },
  containerInfo: {
    width: '50%',
    alignItems: 'center',
    marginRight: 10,
  },
  buttonClose: {
    position: 'absolute',
    top: 5,
    right: 0,
    paddingRight: 5,
    paddingTop: 5,
  },
  iconFire: {
    width: 30,
    height: 30,
  },
  freeshipText: {
    fontWeight: 'bold',
    marginTop: 7,
    color: '#B71C1C',
  },
  listShopText: {
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#255D54',
  },
  freeship: {
    justifyContent: 'space-between',
    borderStyle: 'solid',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#B71C1C',
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    width: 100,
    height: 35,
    marginTop: 3,
    marginHorizontal: 5,
  },
  textListShop: {
    textAlign: 'center',
  },
  headerModal: {
    // height: 50,
    // backgroundColor: '#255D54',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 5,
    // paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bodyModal: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listShop: {
    justifyContent: 'space-between',
    borderStyle: 'solid',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#255D54',
    borderRadius: 10,
    backgroundColor: '#bce8e1',
    width: 100,
    height: 35,
    marginTop: 3,
  },
  containerModalListShop: {
    // paddingTop: 20,
    backgroundColor: Colors.backgroundColor,
    width: widthDevice - 24,
    borderRadius: 20,
    maxHeight: heightDevice * 0.63,
    paddingBottom: 10,
  },
  container: {
    paddingVertical: 10,
    width: widthDevice,
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  content: {
    borderWidth: 1,
    borderColor: Colors.button2Color,
    width: 92,
    height: 92,
    borderRadius: 92,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 88,
  },
  button: {
    position: 'absolute',
    top: -5,
    right: -25,
  },
  icon: {
    height: 32,
    width: 32,
  },
  textAccount: {
    color: Colors.buttonTextColor,
  },
  textBalance: {
    // height: 69,
    marginTop: 5,
    marginBottom: 5,
  },
  textBal1: {
    color: 'black',
  },
  viewIconRefresh: {
    position: 'absolute',
    top: 10,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconRefresh: {
    backgroundColor: 'white',
    padding: 2,
    borderRadius: 25,
  },
  iconRefresh: {
    // position: 'absolute',
    // top: 10,
    // right: 10,
  },
});
