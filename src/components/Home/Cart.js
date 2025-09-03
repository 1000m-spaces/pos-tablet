/* eslint-disable react-native/no-inline-styles */
import {
  formatMoney,
  heightDevice,
  IMAGE_URL,
  widthDevice,
  orderTypes,
} from 'assets/constans';
import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { currentOrderSelector } from 'store/selectors';
import { getOrderChannelsSelector } from 'store/payment/paymentSelector';
import { getOrderChannelsAction } from 'store/payment/paymentAction';
import Colors from 'theme/Colors';
import PaymentCart from './PaymentCart';
import FastImage from 'react-native-fast-image';
import { setOrderAction } from 'store/actions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Cart = ({ showTable }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const currentOrder = useSelector(state => currentOrderSelector(state));
  const orderChannels = useSelector(state => getOrderChannelsSelector(state));
  console.log('orderChannels::', orderChannels)
  // Use Redux state for orderType instead of local state
  const orderType = currentOrder.orderType || null;
  console.log('currentOrder::', currentOrder)

  // Use API data if available, otherwise fallback to static orderTypes
  const availableOrderTypes = orderChannels && orderChannels.length > 0 ? orderChannels : orderTypes;

  useEffect(() => {
    dispatch(getOrderChannelsAction());
  }, [dispatch]);

  const updateQuantity = (product, val) => {
    const tempProducts = JSON.parse(JSON.stringify(currentOrder.products));
    tempProducts.map((prod, i) => {
      if (
        product.prodid === prod.prodid &&
        product?.option_item?.id === prod?.option_item?.id &&
        JSON.stringify(product.extraIds) === JSON.stringify(prod.extraIds)
      ) {
        if (product.quantity >= 1) {
          if (val === -1 && prod.quantity === 1) {
            tempProducts.splice(i, 1);
          } else {
            prod.quantity = val === 1 ? prod.quantity + 1 : prod.quantity - 1;
          }
        }
      }
    });
    dispatch(
      setOrderAction({
        ...currentOrder,
        products: tempProducts,
        applied_products: tempProducts,
      }),
    );
  };
  const onSelectOrderType = i => {
    // Update Redux state instead of local state
    dispatch(setOrderAction({
      ...currentOrder,
      orderType: i.id,
      table: i.id === 1 || i.id === "1" ? currentOrder.table : '', // Reset table when orderType is not 1
    }));
    if (i.id === 1 || i.id === "1") {
      showTable();
    }
  };
  const renderProductCart = ({ item, _ }) => {
    return (
      <View style={styles.containerProduct}>
        <FastImage
          style={[styles.image]}
          source={{
            uri: item?.prodimg.includes('https')
              ? `${item?.prodimg}`
              : `${IMAGE_URL}${item?.prodimg}`,
            priority: FastImage.priority.high,
          }}
        />
        <View style={styles.wrapperProductInfo}>
          <TextNormal numberOfLines={1} style={styles.productName}>
            {item?.prodname}
          </TextNormal>
          <TextNormal style={styles.productTopping}>
            {`${item?.option_item.name_vn},`.replace('undefined,', '') +
              Array.from(
                item?.extra_items || [],
                val => ` ${val.name_vn}`,
              ).toString()}
          </TextNormal>
          <View style={styles.wrapperProduct}>
            <TextNormal style={styles.productPrice}>
              {formatMoney(item?.total_price) + 'đ'}
            </TextNormal>
            <View style={styles.wrapperQuantity}>
              <TouchableOpacity onPress={() => updateQuantity(item, -1)}>
                <Svg name={'icon_minus_pos'} size={28} color={'white'} />
              </TouchableOpacity>
              <TextNormal style={styles.textQuantity}>
                {item?.quantity}
              </TextNormal>
              <TouchableOpacity onPress={() => updateQuantity(item, 1)}>
                <Svg name={'icon_plus_pos'} size={28} color={'white'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  const renderOrderType = ({ item, index }) => {
    // Handle both API data (name_vn) and static data (name)
    const displayName = item.name_vn || item.name;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelectOrderType(item)}
        style={[
          styles.containerCateTab,
          orderType === item.id && {
            backgroundColor: Colors.primary,
            borderWidth: 0,
          },
        ]}>
        <TextNormal
          style={{
            fontWeight: orderType === item.id ? '500' : '400',
            color:
              orderType === item.id ? Colors.whiteColor : Colors.inactiveText,
          }}>
          {item.id === "1" || item.id === 1
            ? currentOrder.table && currentOrder.table !== ''
              ? `Bàn ${currentOrder.table}`
              : displayName
            : displayName}
        </TextNormal>
      </TouchableOpacity>
    );
  };

  // Render order type selection in middle when no order type is selected
  const renderOrderTypeSelection = ({ item, index }) => {
    const displayName = item.name_vn || item.name;
    const isLastItem = index === availableOrderTypes.length - 1;
    const isOddTotal = availableOrderTypes.length % 2 === 1;
    const shouldCenterSingle = isLastItem && isOddTotal;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelectOrderType(item)}
        style={[
          styles.centerOrderTypeButton,
          shouldCenterSingle && styles.singleItemCentered
        ]}>
        <TextNormal style={styles.centerOrderTypeText}>
          {displayName}
        </TextNormal>
      </TouchableOpacity>
    );
  };

  // If no order type is selected, show order type selection in the middle
  if (!orderType) {
    return (
      <View style={[styles.container, { borderTopLeftRadius: 12, marginBottom: insets.bottom }]}>
        <View style={styles.orderTypeSelectionContainer}>
          <FlatList
            key="order-type-selection"
            data={availableOrderTypes}
            keyExtractor={i => i.id.toString()}
            renderItem={({ item, index }) => renderOrderTypeSelection({ item, index })}
            contentContainerStyle={styles.centerOrderTypeList}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        </View>
      </View>
    );
  }

  // Normal layout when order type is selected
  return (
    <View style={[styles.container, { borderTopLeftRadius: 12, marginBottom: insets.bottom }]}>
      <View
        style={{
          borderBottomColor: Colors.btnDisabled,
          borderBottomWidth: 1,
          borderStyle: 'dashed',
        }}>
        <FlatList
          data={availableOrderTypes}
          keyExtractor={i => i.id}
          horizontal
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            alignSelf: 'flex-start',
          }}
          showsHorizontalScrollIndicator={false}
          renderItem={renderOrderType}
        />
      </View>
      {currentOrder && currentOrder?.table && currentOrder?.table !== '' && (
        <View style={styles.tableNumberContainer}>
          <Text style={styles.tableLabel}>Bàn:</Text>
          <Text style={styles.tableNumber}>{currentOrder?.table}</Text>
        </View>
      )}
      <FlatList
        data={currentOrder.products}
        keyExtractor={(i, idx) =>
          `${i?.prodid}_${i?.option_item.id}_${i?.extraIds.toString()}_${idx}`
        }
        renderItem={renderProductCart}
        scrollEnabled={true}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      />
      {currentOrder.products.length > 0 && <PaymentCart />}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  containerProduct: { flexDirection: 'row', flex: 1, marginBottom: 8 },
  wrapperProductInfo: { paddingLeft: 6, flex: 1 },
  container: {
    backgroundColor: Colors.whiteColor,
    width: widthDevice * 0.3299072,
    paddingTop: 14, // Add top padding to align with header
    borderLeftWidth: 1,
    borderLeftColor: Colors.btnDisabled,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // height: heightDevice,
  },
  image: {
    width: 57,
    height: 57,
    borderRadius: 8,
  },
  containerCateTab: {
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: Colors.btnDisabled,
  },
  wrapperQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapperProduct: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textQuantity: { paddingHorizontal: 12, fontSize: 14 },
  productTopping: { color: '#949494' },
  productName: { fontSize: 16, marginBottom: 4 },
  productPrice: { color: Colors.primary, fontWeight: 'bold' },
  tableNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tableLabel: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'bold',
    lineHeight: 22.4,
  },
  tableNumber: {
    color: 'black',
    fontStyle: 'bold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22.4,
  },
  orderTypeSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  centerOrderTypeList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  centerOrderTypeButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    width: '45%',
    minHeight: 60,
    justifyContent: 'center',
  },
  centerOrderTypeText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.whiteColor,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  singleItemCentered: {
    marginLeft: '27.5%',
  },
});
