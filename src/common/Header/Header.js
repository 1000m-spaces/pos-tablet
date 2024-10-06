import {
  TextNormal,
  TextSemiBold,
  TextNormalSemiBold,
  TextSmallTwelve,
  TextSmallEleven,
} from 'common/Text/TextFont';
import React, {useEffect, useState} from 'react';
import {FlatList, View, TouchableOpacity} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {
  getClickNotification,
  getCurrentOrder,
  statusUpdatingMessage,
} from 'store/selectors';
import styles from './styles';
import {
  NAVIGATION_SHOP,
  NAVIGATION_ACCOUNT,
  // NAVIGATION_MY_FAVORITE,
  NAVIGATION_CART_DETAIL,
} from 'navigation/routes';
import Icons from 'common/Icons/Icons';
import Svg from 'common/Svg/Svg';
import MyModal from 'common/MyModal/MyModal';
import ItemNotify from 'common/ItemNotify/ItemNotify';
import {asyncStorage} from 'store/index';
import {updateMessage, getMessage, clickNotification} from 'store/actions';
import strings from 'localization/Localization';
import {getIdMessageNoti} from '../../store/shop/shopSelector';
// import Status from 'common/Status/Status';
// import Colors from 'theme/Colors';

const Header = ({
  icon,
  title,
  isMyFavorite,
  content,
  handleScroll,
  hidenIconNoti,
  navigation,
  listMessage,
  updateListMessage,
}) => {
  const [openModalNotify, setOpenModalNotify] = useState(false);
  const [isIndexSelect, setIndexSelect] = useState(-1);
  console.log('list Message: ', listMessage);
  const currentUser = React.useRef(null);
  const currentOrder = useSelector(state => getCurrentOrder(state));
  const dispatch = useDispatch();
  const [totalProductOfOrder, setTotalProductOfOrder] = useState(0);
  const statusUpdateMessage = useSelector(state =>
    statusUpdatingMessage(state),
  );
  const isClickNotification = useSelector(state => getClickNotification(state));
  const idMessageNoti = useSelector(state => getIdMessageNoti(state));
  const lengthMessageYetRead = listMessage
    ? listMessage.filter(message => message?.msg_status === 0)
    : [];
  // HANDLE MODAL STATE
  useEffect(() => {
    initializeUser();
    console.log('hidenIconNoti', hidenIconNoti);
  }, []);
  const initializeUser = async () => {
    const user = await asyncStorage.getUser();
    currentUser.current = user;
  };
  const onPressOpenNotify = () => {
    setOpenModalNotify(true);
  };
  const onPressOutSide = () => {
    setOpenModalNotify(false);
    dispatch(clickNotification(false, ''));
  };

  const onPressSelectMess = (mess, index) => {
    setIndexSelect(index);
    if (mess.msg_status === 0) {
      const query = {
        msg_id: mess.id,
        session_key: currentUser.current?.session_key,
        cust_id: currentUser.current?.custid,
        is_delete: 0,
        msg_status: 1,
      };
      dispatch(updateMessage(query));
      updateListMessage();
    }
  };

  useEffect(() => {
    if (idMessageNoti && listMessage) {
      var index = listMessage.findIndex(item => item.id === idMessageNoti);
      if (index !== -1) {
        onPressSelectMess(listMessage[index], index);
        dispatch(clickNotification(false, ''));
      }
    }
  }, [idMessageNoti, listMessage]);

  useEffect(() => {
    if (
      currentOrder &&
      currentOrder.products &&
      currentOrder.products.length > 0
    ) {
      let total = 0;
      currentOrder.products.map(product => {
        total += product.quantity;
      });
      setTotalProductOfOrder(total);
    } else {
      setTotalProductOfOrder(0);
    }
  }, [currentOrder]);
  useEffect(() => {
    getListMessage();
    if (!openModalNotify) {
      setIndexSelect(-1);
    }
  }, [openModalNotify]);
  const getListMessage = () => {
    if (currentUser.current?.custid && currentUser.current.session_key) {
      const body = {
        custid: currentUser?.current?.custid,
        sesskey: currentUser?.current?.session_key,
        typemsg: 0,
        typeget: 'ALL',
        partnerid: 100,
      };
      dispatch(getMessage(body));
    }
  };
  const renderMessageItem = ({item, index}) => {
    return (
      <ItemNotify
        data={item}
        onPressDetail={onPressSelectMess}
        index={index}
        isModal={false}
        indexSelect={isIndexSelect}
      />
    );
  };

  const handleClickShop = () => {
    if (navigation && title === 'NEO CAFE') {
      // navigation.navigate(NAVIGATION_MY_FAVORITE);
      navigation.navigate(NAVIGATION_SHOP);
    } else {
      navigation.navigate(NAVIGATION_ACCOUNT);
    }
  };

  // OPEN NOTIFICATION
  useEffect(() => {
    if (isClickNotification && icon === 'account') {
      setTimeout(() => {
        onPressOpenNotify();
      }, 1000);
    }
  }, [isClickNotification]);

  return (
    <View
      style={
        icon !== 'account' && isMyFavorite !== true
          ? styles.container
          : styles.containerHome
      }>
      <View style={styles.content}>
        <View style={styles.containerInfo}>
          {icon === 'account' ? (
            // <Images
            //   resizeMode={'contain'}
            //   source={icon_account}
            //   style={styles.imageAccount}
            // />
            <Svg
              name={'icon_svg_account'}
              size={32}
              style={styles.imageAccount}
            />
          ) : (
            // <Images
            //   resizeMode={'contain'}
            //   source={icon_location}
            //   style={styles.imageAccount}
            // />
            <Svg name={'icon_diachi1'} size={38} style={{marginBottom: 5}} />
          )}
          <View style={styles.contentInfo}>
            <TouchableOpacity
              style={{width: '50%'}}
              onPress={() => handleClickShop()}>
              <TextSmallTwelve style={styles.textHello}>
                {title}
              </TextSmallTwelve>
              {content && content.length > 0 && (
                <TextNormalSemiBold style={styles.textName}>
                  {icon !== 'account' && content
                    ? content.toString().split('-')[1].trim()
                    : content}
                </TextNormalSemiBold>
              )}
            </TouchableOpacity>
            {icon !== 'account' && isMyFavorite !== true && (
              <View
                style={[
                  styles.iconSection,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {paddingRight: totalProductOfOrder > 0 ? 5 : 0},
                ]}>
                <TouchableOpacity onPress={() => handleScroll(1)}>
                  <Svg
                    name={'icon_drink'}
                    size={30}
                    style={styles.imageLocation}
                  />
                  <TextSmallEleven>Healthy</TextSmallEleven>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleScroll(2)}>
                  <Svg
                    name={'icon_daubep'}
                    size={30}
                    style={styles.imageLocation}
                  />
                  <TextSmallEleven>Gourmet</TextSmallEleven>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{paddingHorizontal: 5, alignItems: 'center'}}
                  disabled={totalProductOfOrder <= 0}
                  onPress={() => navigation.navigate(NAVIGATION_CART_DETAIL)}>
                  <Svg
                    name={'icon_shop2'}
                    size={30}
                    style={styles.imageLocation}
                  />
                  <TextSmallEleven>Cart</TextSmallEleven>
                  {totalProductOfOrder > 0 && (
                    <View style={styles.cartSection}>
                      <TextNormalSemiBold
                        style={{color: 'yellow', fontSize: 12}}>
                        {totalProductOfOrder}
                      </TextNormalSemiBold>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
            {hidenIconNoti === false ? (
              // <Images source={icon_bell} style={styles.imageBell} />
              <TouchableOpacity
                onPress={() => onPressOpenNotify()}
                style={styles.messageSection}>
                <Svg name={'icon_notify1'} size={25} style={styles.imageBell} />
                {lengthMessageYetRead?.length > 0 ? (
                  <View style={styles.quantity}>
                    <TextNormal style={styles.textQuantity}>
                      {lengthMessageYetRead?.length || 0}
                    </TextNormal>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <MyModal visible={openModalNotify} onPressOutSide={onPressOutSide}>
          {listMessage?.length > 0 ? (
            <View style={styles.containerModalNotify}>
              <View style={styles.headerModal}>
                <TextSemiBold style={styles.textModal}>
                  {strings.common.notification}
                </TextSemiBold>
                <TouchableOpacity
                  onPress={onPressOutSide}
                  style={styles.buttonClose}>
                  <Icons
                    type={'AntDesign'}
                    name={'close'}
                    color={'white'}
                    size={30}
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={listMessage}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                initialNumToRender={5}
                renderItem={renderMessageItem}
              />
            </View>
          ) : (
            <View style={styles.containerModalNotify}>
              <View style={styles.headerModal}>
                <TextSemiBold style={styles.textModal}>
                  {strings.common.notification}
                </TextSemiBold>
              </View>
              <View style={styles.errorContainer}>
                <TextSemiBold style={{textAlign: 'center'}}>
                  {strings.homeScreen.emptyNotifications}
                </TextSemiBold>
              </View>
            </View>
          )}
        </MyModal>
      </View>
    </View>
  );
};

export default Header;
