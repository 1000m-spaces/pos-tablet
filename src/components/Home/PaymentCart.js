import { formatMoney, heightDevice, widthDevice } from 'assets/constans';
import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  currentOrderSelector,
  getTablesSelector,
  userInfo
} from 'store/selectors';
import Colors from 'theme/Colors';
import Modal from 'react-native-modal';
import { getVoucherAction, setOrderAction, getPaymentChannelsAction } from 'store/actions';
import AsyncStorage from 'store/async_storage';
import NoteModal from './NoteModal';
import VoucherModal from './VoucherModal';
import PaymentMethodModal from './PaymentMethodModal';

const PaymentCart = () => {
  const dispatch = useDispatch();
  const currentOrder = useSelector(state => currentOrderSelector(state));
  const tables = useSelector(state => getTablesSelector(state));
  const user = useSelector(state => userInfo(state));
  const [payment, setPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({ id: 'cash', name: 'Tiền mặt', icon: 'cash' });

  const [modal, setModal] = useState(false);

  useEffect(() => {
    let numOfProduct = 0;
    let initTotal = 0;
    let commitedTotal = 0;
    currentOrder.products.map(p => {
      numOfProduct += p?.quantity;
      initTotal += (p?.total_price || p?.prodprice) * p?.quantity;
    });
    commitedTotal = initTotal;
    setPayment({
      length: numOfProduct,
      initTotal,
      commitedTotal,
    });
    fetchVoucher();
  }, [currentOrder]);

  useEffect(() => {
    // Fetch payment channels when component mounts
    dispatch(getPaymentChannelsAction());
  }, [dispatch]);

  const fetchVoucher = () => {
    const items = Array.from(currentOrder.products, val => {
      return {
        amount: val.total_price,
        initial_total_amount: val.prodprice,
        paid_price: val.prodprice,
        price_discount: 0,
        product_id: val.prodid,
        product_name: val.prodname,
        quantity: val.quantity,
      };
    });
    const body = {
      items,
      items_limit: 2,
      order_limit: 99000,
      shopowner_id: 124,
      partner_id: 110,
      rest_id: 248,
      used_for: 2,
    };
    console.log('body voucher::', body);
    dispatch(getVoucherAction(body));
  };

  const onCloseModal = () => {
    Keyboard.dismiss();
    setModal(-1);
  };

  const onApplyVoucher = (voucher) => {
    console.log('Applied voucher:', voucher);
    // Handle voucher application logic here
    onCloseModal();
  };

  const processPayment = async () => {
    try {
      // Validate that there are products in the cart
      if (!currentOrder.products || currentOrder.products.length === 0) {
        Alert.alert('Thông báo', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán');
        return;
      }

      // Filter products with quantity > 0
      const validProducts = currentOrder.products.filter(product => product.quantity > 0);

      if (validProducts.length === 0) {
        Alert.alert('Thông báo', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán');
        return;
      }

      // Get selected table info
      const selectedTableName = currentOrder.table && currentOrder.table !== '' ? currentOrder.table : "Mang về";

      // Transform products to API format
      const transformedProducts = validProducts.map(product => {
        // Calculate extra price
        const extraPrice = product.extra_items ?
          product.extra_items.reduce((sum, extra) => sum + (extra.price || 0), 0) : 0;

        const productPrice = product.prodprice || 0;
        const totalProductPrice = (productPrice + extraPrice) * product.quantity;

        // Transform options
        const option = [
          {
            optdetailid: product.option_item ? product.option_item.id : null,
            optdetailname: product.option_item ? product.option_item.name_vn : null,
            stat: product.option_item ? 1 : 0
          },
          { optdetailid: null },
          { optdetailid: null }
        ];

        // Transform extras
        const extras = product.extra_items ? product.extra_items.map(extra => ({
          id: extra.id,
          quantity: 1,
          name: extra.name_vn || extra.display_name,
          idcha: 0,
          isExtra: 1,
          price: extra.price || 0,
          amount: extra.price || 0,
          group_extra_id: extra.group_extra_id,
          group_extra_name: extra.group_extra_name,
          group_type: extra.group_type
        })) : [];

        return {
          prodid: product.prodid,
          prodprice: productPrice,
          rate_discount: 0,
          opt1: product.option_item ? product.option_item.id : null,
          opt2: null,
          opt3: null,
          option: option,
          extras: extras,
          name: product.prodname,
          amount: totalProductPrice,
          note: product.note || "",
          typeOrder: "Tại quầy",
          quanlity: product.quantity
        };
      });

      // Calculate totals
      const subPrice = transformedProducts.reduce((sum, product) => sum + product.amount, 0);

      // Generate 6-character sorted order ID for offline orders
      const generateOfflineOrderId = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Create base from time: HHMMSS
        const timeBase = hours + minutes + seconds;

        // Alternative: Use date + sequence for better sorting
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const dayStr = String(dayOfYear).padStart(3, '0'); // Day of year (001-366)
        const hourMinute = String(now.getHours() * 60 + now.getMinutes()).padStart(4, '0'); // Minutes since midnight

        // Option 1: Time-based 6 chars (HHMMSS)
        const timeOrderId = timeBase;

        // Option 2: Day + time-based 6 chars (DDDHHH where DDD=day of year, HHH=hour*10+minute/6)
        const dayTimeOrderId = dayStr.slice(-3) + String(Math.floor((now.getHours() * 60 + now.getMinutes()) / 100)).padStart(3, '0');

        // Option 3: Sequential with date prefix (use last 2 digits of day + 4 digit sequence)
        const datePrefix = String(now.getDate()).padStart(2, '0');
        const timeSequence = String(now.getHours() * 100 + now.getMinutes()).slice(-4);
        const sequentialOrderId = datePrefix + timeSequence;

        // Return time-based ID for better chronological sorting
        return timeOrderId;
      };

      const offlineOrderId = generateOfflineOrderId();
      const session = `OFF-${offlineOrderId}`;

      // Create order object
      const orderData = {
        subPrice: subPrice,
        svFee: "0",
        svFee_amount: 0,
        shopTableid: currentOrder.tableId || "0",
        shopTableName: selectedTableName,
        orderNote: currentOrder.note || "",
        products: transformedProducts,
        cust_id: 0,
        transType: selectedPaymentMethod ? selectedPaymentMethod.id : "41", // Default to cash
        chanel_type_id: selectedPaymentMethod ? selectedPaymentMethod.chanel_type_id : "1",
        phuthu: 0,
        total_amount: subPrice,
        fix_discount: 0,
        perDiscount: 0,
        session: session,
        offlineOrderId: offlineOrderId, // 6-character sorted order ID
        shopid: user?.shop_id || "246", // Default shop ID
        userid: user?.id || "1752", // Default user ID
        roleid: user?.role_id || "4", // Default role ID
        timestamp: new Date().toISOString(),
        status: "pending",
        orderStatus: "Paymented", // Default to Paymented for cash orders
        tableId: currentOrder.tableId || null, // Store tableId for blocking
        created_at: new Date().toISOString()
      };

      // Save to local storage as last order and add to pending orders queue
      await AsyncStorage.setLastOrder(orderData);
      await AsyncStorage.addPendingOrder(orderData);

      console.log('Order saved to local storage:', orderData);

      // Show success message
      Alert.alert(
        'Thành công',
        'Đơn hàng hoàn tất',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset cart after successful payment
              dispatch(setOrderAction({
                take_away: false,
                products: [],
                applied_products: [],
                table: currentOrder.table,
                note: '',
                delivery: null,
              }));
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
    }
  };

  const onSelectPaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    console.log('Selected payment method:', method);
    onCloseModal();
    // Process payment after payment method is selected
    setTimeout(() => {
      processPayment();
    }, 300); // Small delay to allow modal to close smoothly
  };

  const handlePaymentClick = () => {
    // Validate that there are products in the cart before showing payment modal
    if (!currentOrder.products || currentOrder.products.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán');
      return;
    }

    const validProducts = currentOrder.products.filter(product => product.quantity > 0);
    if (validProducts.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán');
      return;
    }

    // Show payment method modal
    setModal(3);
  };

  return (
    <View style={styles.wrapperContent}>
      <TouchableOpacity onPress={() => setModal(2)} style={styles.rowBetween}>
        <View style={styles.row}>
          <Svg name={'voucher_cart'} size={18} color={'red'} />
          <TextNormal style={styles.textLabel}>{'Thêm voucher'}</TextNormal>
        </View>
        <View style={styles.row}>
          <TextNormal style={styles.textSecondary}>{'Chọn voucher'}</TextNormal>
          <Svg name={'arrow_right'} size={16} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setModal(1)} style={styles.rowBetween}>
        <View style={styles.row}>
          <Svg name={'note_cart'} size={18} color={'red'} />
          <TextNormal style={styles.textLabel}>{'Ghi chú'}</TextNormal>
        </View>
        <View style={styles.row}>
          <TextNormal numsOfLine={1} style={styles.textSecondary}>
            {currentOrder.note.length > 0
              ? `${currentOrder.note}`
              : 'Thêm ghi chú'}
          </TextNormal>
          <Svg name={'arrow_right'} size={16} />
        </View>
      </TouchableOpacity>

      <View style={styles.line} />

      <View style={styles.rowBetween}>
        <TextNormal style={styles.totalText}>
          {`Thành tiền (${payment?.length} món)`}
        </TextNormal>
        <TextNormal style={{ fontSize: 16 }}>
          {payment !== null && `${formatMoney(payment?.initTotal)}đ`}
        </TextNormal>
      </View>
      <View style={styles.rowBetween}>
        <TextNormal style={styles.totalText}>{'Tổng'}</TextNormal>
        <TextNormal style={styles.textPayment}>
          {payment !== null && `${formatMoney(payment?.commitedTotal)}đ`}
        </TextNormal>
      </View>
      <TouchableOpacity style={styles.orderBtn} onPress={handlePaymentClick}>
        <TextNormal style={styles.orderBtnText}>{'Thanh toán'}</TextNormal>
      </TouchableOpacity>
      <Modal
        isVisible={modal > 0}
        onBackButtonPress={() => console.log('back hardware')}
        onBackdropPress={onCloseModal}
        propagateSwipe
        style={[
          styles.containerModal,
          modal === 1 && { marginBottom: 3, marginLeft: 50 },
          modal === 2 && { marginBottom: 3, marginLeft: 50 },
          modal === 3 && { marginBottom: 3, marginLeft: 50 },
        ]}>
        {modal === 1 && (
          <NoteModal currentOrder={currentOrder} onCloseModal={onCloseModal} />
        )}
        {modal === 2 && (
          <VoucherModal
            onCloseModal={onCloseModal}
            onApplyVoucher={onApplyVoucher}
          />
        )}
        {modal === 3 && (
          <PaymentMethodModal
            paymentMethods={[{ id: 'cash', name: 'Tiền mặt', icon: 'cash' }]}
            loading={false}
            onCloseModal={onCloseModal}
            onSelectPayment={onSelectPaymentMethod}
          />
        )}
      </Modal>
    </View>
  );
};

export default PaymentCart;

const styles = StyleSheet.create({
  containerModal: {
    width: heightDevice > widthDevice ? heightDevice * 0.5 : widthDevice * 0.5,
    height:
      heightDevice > widthDevice ? widthDevice * 0.45 : heightDevice * 0.45,
    backgroundColor: 'white',
    position: 'absolute',
    borderRadius: 16,
    left: heightDevice > widthDevice ? heightDevice * 0.25 : widthDevice * 0.25,
    margin: 0,
  },
  orderBtnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Colors.whiteColor,
  },
  orderBtn: {
    width: '90%',
    height: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginHorizontal: 18,
    alignSelf: 'center',
    marginVertical: 5,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 6,
  },
  totalText: {
    fontSize: 16,
    color: '#757575',
  },
  textPayment: { fontSize: 20, color: Colors.primary, fontWeight: 'bold' },
  wrapperContent: {
    // position: 'absolute',
    // bottom: 0,
    backgroundColor: Colors.whiteColor,
    elevation: 5,
    width: '100%',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textSecondary: {
    color: Colors.placeholder,
    fontSize: 16,
    paddingRight: 4,
  },
  textLabel: {
    color: Colors.blackColor,
    fontSize: 16,
    paddingLeft: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

});
