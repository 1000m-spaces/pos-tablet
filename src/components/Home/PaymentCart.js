import { formatMoney, heightDevice, widthDevice } from 'assets/constans';
import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState, useRef } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  Dimensions,
  PixelRatio,
  Animated,
  BackHandler,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  currentOrderSelector,
  getTablesSelector,
  userInfo,
  getPaymentChannelsSelector,
  getPaymentChannelsLoadingSelector,
  getStatusCreateOrder
} from 'store/selectors';
import Colors from 'theme/Colors';
import Modal from 'react-native-modal';
import { getVoucherAction, setOrderAction, getPaymentChannelsAction, createOrder, resetCreateOrder } from 'store/actions';
import AsyncStorage from 'store/async_storage';
import NoteModal from './NoteModal';
import VoucherModal from './VoucherModal';
import PaymentMethodModal from './PaymentMethodModal';
import ConfirmationModal from 'common/ConfirmationModal/ConfirmationModal';
import Status from 'common/Status/Status';
import printingService from '../../services/PrintingService';
import printQueueService from '../../services/PrintQueueService';
import ViewShot from 'react-native-view-shot';
import PrintTemplate from '../Order/TemTemplate';
import BillTemplate from '../Order/BillTemplate';
import Toast from 'react-native-toast-message';

// Helper functions for printing dimensions
const { width, height } = Dimensions.get("window");

// Convert mm to pixels using device's actual DPI, optimized for tablets
const mmToPixels = (mm) => {
  const { width, height } = Dimensions.get('window');
  const screenWidth = Math.max(width, height); // Use the larger dimension for tablets
  const screenHeight = Math.min(width, height);

  // Get physical dimensions in inches (assuming standard tablet sizes)
  // Most tablets are around 10-12 inches diagonally
  const diagonalInches = Math.sqrt(Math.pow(screenWidth / PixelRatio.get(), 2) + Math.pow(screenHeight / PixelRatio.get(), 2)) / 160;

  // Calculate actual DPI based on physical screen size
  const actualDpi = Math.sqrt(Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)) / diagonalInches;

  return Math.round((mm * actualDpi) / 25.4); // 25.4mm = 1 inch
};

const PaymentCart = () => {
  const dispatch = useDispatch();
  const currentOrder = useSelector(state => currentOrderSelector(state));
  // const user = useSelector(state => userInfo(state));
  const paymentChannels = useSelector(state => getPaymentChannelsSelector(state));
  const paymentChannelsLoading = useSelector(state => getPaymentChannelsLoadingSelector(state));
  const isStatusCreateOrder = useSelector(state => getStatusCreateOrder(state));

  const [payment, setPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isModalOrderStatus, setIsModalOrderStatus] = useState(false);
  const [isOrderDataSaved, setIsOrderDataSaved] = useState(null);

  const [modal, setModal] = useState(false);

  // Printing related state and refs
  const [printingOrder, setPrintingOrder] = useState(null);
  const [printerInfo, setPrinterInfo] = useState(null);
  const [isAutoPrinting, setIsAutoPrinting] = useState(false);
  const [autoPrintStatus, setAutoPrintStatus] = useState('');
  const spinValue = useRef(new Animated.Value(0)).current;

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

  // Prevent back navigation during auto print
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isAutoPrinting) {
        // Show a gentle reminder instead of allowing navigation
        Alert.alert(
          'Đang in đơn hàng',
          'Vui lòng đợi quá trình in hoàn tất trước khi thoát',
          [{ text: 'OK', style: 'default' }]
        );
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    });

    return () => backHandler.remove();
  }, [isAutoPrinting]);

  useEffect(() => {
    // Set default payment method when payment channels are loaded
    if (paymentChannels && paymentChannels.length > 0 && !selectedPaymentMethod) {
      // Try to find cash payment method (trans_name === '41') as default
      const cashMethod = paymentChannels.find(method => method.trans_name === '41');
      const defaultMethod = cashMethod || paymentChannels[0];
      setSelectedPaymentMethod(defaultMethod);
    }
  }, [paymentChannels, selectedPaymentMethod]);

  // Initialize printing service and load printer info
  useEffect(() => {
    const initializePrinting = async () => {
      try {
        printingService.initialize();
        const info = await AsyncStorage.getLabelPrinterInfo();
        setPrinterInfo(info);
      } catch (error) {
        console.error('Error initializing printing service:', error);
      }
    };

    initializePrinting();

    // Cleanup on unmount
    return () => {
      printingService.dispose();
    };
  }, []);

  const fetchVoucher = async () => {
    const user = await AsyncStorage.getUser();
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
      shopowner_id: user?.shopownerid || "130",
      partner_id: user?.partnerid || "110",
      rest_id: user?.shops?.id || user?.shifts?.rest_id || "246",
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
    const user = await AsyncStorage.getUser();
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
          price: productPrice,
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
      const price_paid = transformedProducts.reduce((sum, product) => sum + product.amount, 0);

      // Generate auto-increment order ID by date (format: 4-digit counter only)
      const generateOfflineOrderId = async () => {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const currentDateKey = `${year}${month}${day}`;

        try {
          // Get stored counter data
          const counterData = await AsyncStorage.getOfflineOrderCounter();
          let counter = 1;

          if (counterData) {
            const { lastDate, lastCounter } = counterData;

            // If same date, increment counter; if different date, reset to 1
            if (lastDate === currentDateKey) {
              counter = lastCounter + 1;
            } else {
              counter = 1; // Reset counter for new date
            }
          }

          // Store updated counter
          await AsyncStorage.setOfflineOrderCounter({
            lastDate: currentDateKey,
            lastCounter: counter
          });

          // Format: 4-digit counter only (e.g., 0001, 0002, 0003...)
          const paddedCounter = String(counter).padStart(4, '0');

          return paddedCounter;

        } catch (error) {
          console.error('Error generating auto-increment order ID:', error);
          // Fallback to 4-digit random number if AsyncStorage fails
          const fallbackId = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
          return fallbackId;
        }
      };

      const offlineOrderId = await generateOfflineOrderId();
      const session = `M-${offlineOrderId}`;

      // Create order object
      console.log('Selected payment method for order:', selectedPaymentMethod);
      console.log(' User info payment cart:', user);

      const orderData = {
        price_paid: price_paid,
        svFee: "0",
        svFee_amount: 0,
        shopTableid: currentOrder.tableId || "0",
        shoptablename: selectedTableName,
        orderNote: currentOrder.note || "",
        products: transformedProducts,
        cust_id: 0,
        transType: selectedPaymentMethod ? selectedPaymentMethod.trans_name : "41", // Use trans_name as transaction type
        chanel_type_id: currentOrder ? currentOrder.orderType : "1",
        phuthu: 0,
        total_amount: price_paid,
        fix_discount: 0,
        perDiscount: 0,
        session: session,
        offlineOrderId: session,
        offline_code: session,
        shopid: user?.shops?.id || user?.shopid || "246",
        userid: user?.userid || "1752",
        roleid: user?.roleid || "4",
        timestamp: new Date().toISOString(),
        status: "pending",
        orderStatus: "Paymented", // Default to Paymented for cash orders
        tableId: currentOrder.tableId || null, // Store tableId for blocking
        created_at: new Date().toISOString(),
        syncStatus: 'pending' // Initially pending, will be updated to 'synced' in saga if API succeeds
      };
      console.log('Final order data to create:', orderData);
      setIsOrderDataSaved(orderData); // Save order data to state for retry if needed
      dispatch(createOrder(orderData));
      console.log('Order dispatched for processing:', orderData);
      // setIsModalOrderStatus(true);
      Toast.show({
        type: 'success',
        text1: 'Đơn hàng hoàn tất',
        position: 'bottom',
      });
      dispatch(setOrderAction({
        take_away: false,
        products: [],
        applied_products: [],
        table: '',
        tableId: '',
        note: '',
        delivery: null,
        orderType: null,
      }));
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    (async () => {
      if (isStatusCreateOrder === Status.SUCCESS && isOrderDataSaved) {
        // Order is already saved in orderSaga for successful API calls
        console.log('Order successfully processed and saved via API');

        // Trigger auto-print after successful order creation
        await triggerAutoPrint(isOrderDataSaved);

        dispatch(resetCreateOrder());
      } else if (isStatusCreateOrder === Status.ERROR && isOrderDataSaved) {
        // Failed orders are now saved directly in orderSaga for better consistency
        // Just reset the order state here
        console.log('Order failed - error handling and storage completed in saga');
        dispatch(resetCreateOrder());
      }
    })();
  }, [isStatusCreateOrder]);

  // Trigger auto-print functionality
  const triggerAutoPrint = async (orderData) => {
    try {
      // Check if auto-print is enabled
      const printerInfo = await AsyncStorage.getLabelPrinterInfo();
      console.log('Triggering auto-print for order:', orderData.session);

      // Use the new queueMultipleLabels function to handle multiple products and quantities
      if (global.queueMultipleLabels && orderData.products && orderData.products.length > 0) {
        // Queue multiple labels for all products and quantities
        const labelTaskIds = await global.queueMultipleLabels(orderData, printerInfo);
        console.log(`Auto-print: Queued ${labelTaskIds.length} label tasks:`, labelTaskIds);

        // Also add bill printing task
        const billTaskId = printQueueService.addPrintTask({
          type: 'bill',
          order: orderData,
          priority: 'high'
        });

        console.log('Auto-print: Queued bill task:', billTaskId);
        console.log(`Auto-print completed - ${labelTaskIds.length} labels + 1 bill queued`);
      } else {
        // Fallback to old method if queueMultipleLabels not available
        console.log('Auto-print: Using fallback method (queueMultipleLabels not available)');
        const taskId = printQueueService.addPrintTask({
          type: 'both', // Print both label and bill
          order: orderData,
          printerInfo: printerInfo,
          priority: 'high'
        });

        console.log('Auto-print task added to queue with ID:', taskId);
      }

    } catch (error) {
      console.error('Error triggering auto-print:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi tự động in',
        text2: 'Không thể tự động in đơn hàng. Vui lòng in thủ công.',
        position: 'top',
      });
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
      <TouchableOpacity
        style={[
          styles.orderBtn,
          isAutoPrinting && styles.orderBtnDisabled
        ]}
        onPress={handlePaymentClick}
        disabled={isAutoPrinting}
      >
        <TextNormal style={[
          styles.orderBtnText,
          isAutoPrinting && styles.orderBtnTextDisabled
        ]}>
          {isAutoPrinting ? 'Đang xử lý...' : 'Thanh toán'}
        </TextNormal>
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
            paymentMethods={paymentChannels}
            loading={paymentChannelsLoading}
            onCloseModal={onCloseModal}
            onSelectPayment={onSelectPaymentMethod}
            currentOrder={currentOrder}
          />
        )}
      </Modal>

      {/* Auto Print Loading Modal */}
      <Modal
        isVisible={isAutoPrinting}
        animationType="fade"
        backdropColor="rgba(0,0,0,0.7)"
        backdropOpacity={0.7}
        hasBackdrop={true}
        onBackButtonPress={() => { }} // Prevent back button press during auto print
        onBackdropPress={() => { }} // Prevent backdrop press during auto print
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
        }}
      >
        <View style={styles.autoPrintModal}>
          <View style={styles.autoPrintContent}>
            {/* Loading Spinner */}
            <View style={styles.loadingSpinner}>
              <Animated.View
                style={[
                  styles.spinner,
                  {
                    transform: [{
                      rotate: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}
              />
            </View>

            {/* Status Text */}
            <TextNormal style={styles.autoPrintTitle}>
              {autoPrintStatus || 'Đang tự động in...'}
            </TextNormal>

            {/* Progress Description */}
            <TextNormal style={styles.autoPrintDescription}>
              Vui lòng đợi trong giây lát, đừng chuyển màn hình
            </TextNormal>
          </View>
        </View>
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
    top: heightDevice > widthDevice ? widthDevice * 0.25 : heightDevice * 0.25,
    margin: 0,
  },
  orderBtnText: {
    fontWeight: '600',
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
  orderBtnDisabled: {
    backgroundColor: Colors.placeholder,
    opacity: 0.7,
  },
  orderBtnTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.8,
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
  // Auto Print Modal Styles
  autoPrintModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 30,
    minWidth: 300,
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  autoPrintContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
  },
  autoPrintTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 25,
  },
  autoPrintDescription: {
    fontSize: 14,
    color: Colors.placeholder,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

});
