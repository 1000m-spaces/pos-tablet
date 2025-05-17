import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState, useCallback } from 'react';
import { heightDevice, widthDevice } from 'assets/constans';
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView, TextInput, Text, Switch, ActivityIndicator, Platform
} from 'react-native';
import orderController from 'store/order/orderController';
import Colors from 'theme/Colors';
import OrderTable from './OrderTable';
import Modal from 'react-native-modal';
import AsyncStorage from 'store/async_storage/index'
import StoreSelectionDialog from './StoreSelectionDialog';

const orderFilters = [
  { id: 1, name: 'Đơn mới' },
  { id: 2, name: 'Lịch sử' },
];

const Orders = () => {
  const [data, setData] = useState([]);
  const [orderType, setOrderType] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [storeDialogVisible, setStoreDialogVisible] = useState(false);
  const [ip, setIP] = useState("");
  const [sWidth, setSWidth] = useState(50);
  const [sHeight, setSHeight] = useState(30);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('-');
  };

  const fetchOrders = useCallback(async () => {
    if (!selectedStore) {
      setStoreDialogVisible(true);
      return;
    }
    console.log('fetchOrders', orderType);
    if (orderType === 1) {
      orderController.fetchOrder({
        branch_id: selectedStore.branch_id,
        brand_id: selectedStore.brand_id,
        merchant_id: selectedStore.merchant_id,
        service: "GRAB",
      }).then((res) => {
        if (res.success) {
          setData(res.data.orders ? res.data.orders : []);
        }
      })
    } else {
      setIsLoadingHistory(true);
      const formattedDate = formatDate(selectedDate);
      orderController.fetchOrderHistory({
        branch_id: selectedStore.branch_id,
        brand_id: selectedStore.brand_id,
        merchant_id: selectedStore.merchant_id,
        from_at: formattedDate,
        to_at: formattedDate,
        page: 1,
        service: "GRAB",
        size: 1000,
      }).then(async (res) => {
        if (res.success) {
          const statements = res.data.statements ? res.data.statements : [];
          try {
            // Fetch all order details concurrently
            const orderDetailsPromises = statements.map(statement =>
              orderController.getOrderDetail({
                order_id: statement.ID,
                branch_id: selectedStore.branch_id,
                brand_id: selectedStore.brand_id,
                service: "GRAB",
                merchant_id: selectedStore.merchant_id,
              })
            );
            const orderDetailsResults = await Promise.all(orderDetailsPromises);
            const orders = orderDetailsResults.map((result, index) => {
              return {
                ...result?.data?.order,
                ...statements[index]
              }
            });
            setData(orders);
          } catch (error) {
            console.error('Error fetching order details:', error);
            Toast.show({
              type: 'error',
              text1: 'Lỗi khi tải chi tiết đơn hàng',
              position: 'bottom',
            });
          }
        }
        setIsLoadingHistory(false);
      }).catch(error => {
        console.error('Error fetching order history:', error);
        setIsLoadingHistory(false);
        Toast.show({
          type: 'error',
          text1: 'Lỗi khi tải lịch sử đơn hàng',
          position: 'bottom',
        });
      });
    }
  }, [selectedStore, orderType, selectedDate]);

  const loadSelectedStore = async () => {
    const storeInfo = await AsyncStorage.getSelectedStore();
    if (storeInfo) {
      setSelectedStore(storeInfo);
      console.log('storeInfo', storeInfo);
    } else {
      setStoreDialogVisible(true);
    }
  };

  useEffect(() => {
    loadSelectedStore();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      // Initial fetch
      fetchOrders();
      if (orderType != 1) {
        return;
      }
      // Set up interval for fetching orders every 30 seconds
      const intervalId = setInterval(fetchOrders, 30000);
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    } else {
      loadSelectedStore();
    }
  }, [selectedStore, orderType, selectedDate]);

  useEffect(() => {
    AsyncStorage.getPrinterInfo().then((printerInfo) => {
      if (printerInfo) {
        setIP(printerInfo.IP)
        setSWidth(printerInfo.sWidth)
        setSHeight(printerInfo.sHeight)
        setAutoPrint(printerInfo.autoPrint || false)
      }
    })
  }, [])

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
  };

  const renderFilter = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => setOrderType(item.id)}
        style={[
          styles.wrapperOrderType,
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
          {item.name}
        </TextNormal>
      </TouchableOpacity>
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!ip) {
      newErrors.ip = 'Vui lòng nhập địa chỉ IP';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      newErrors.ip = 'Định dạng địa chỉ IP không hợp lệ';
    }
    if (!sWidth || isNaN(sWidth) || sWidth <= 0) {
      newErrors.sWidth = 'Chiều rộng phải là số dương';
    }
    if (!sHeight || isNaN(sHeight) || sHeight <= 0) {
      newErrors.sHeight = 'Chiều cao phải là số dương';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await AsyncStorage.setPrinterInfo({
        IP: ip,
        sWidth: parseInt(sWidth),
        sHeight: parseInt(sHeight),
        autoPrint: autoPrint
      });
      Toast.show({
        type: 'success',
        text1: 'Lưu cài đặt thành công',
        position: 'bottom',
      });
      setModalVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lưu cài đặt thất bại',
        text2: error.message,
        position: 'bottom',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.bgInput,
          flexDirection: 'row',
        }}>
        <View style={styles.container}>
          {/* Content */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <FlatList
                  data={orderFilters}
                  keyExtractor={i => i.id}
                  horizontal
                  contentContainerStyle={{
                    paddingVertical: 12,
                    alignSelf: 'flex-start',
                  }}
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderFilter}
                />
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      marginRight: 20
                    }}
                    onPress={() => setStoreDialogVisible(true)}
                  >
                    <TextNormal style={{ marginRight: 10 }}>
                      {selectedStore ? selectedStore.name : 'Select Store'}
                    </TextNormal>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      marginRight: 20
                    }}
                    onPress={() => setModalVisible(true)}
                  >
                    <Svg name={'printer'} size={40} color={'transparent'} />
                  </TouchableOpacity>
                </View>
              </View>
              {
                orderType !== 1 && (
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={styles.searchInput}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Svg name={'clock'} size={20} color={'gray'} />
                      <TextNormal style={{ marginLeft: 10, borderLeftWidth: 1, borderColor: 'gray', paddingLeft: 10 }}>
                        {selectedDate.toLocaleDateString('en-GB')}
                      </TextNormal>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.searchInput}>
                      <Svg name={'search'} size={20} color={'gray'} />
                      <TextNormal style={{ marginLeft: 10, borderLeftWidth: 1, borderColor: 'gray', paddingLeft: 10 }}>
                        {'All'}
                      </TextNormal>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.searchInput, { flex: 1 }]}>
                      <Svg name={'search'} size={20} />
                      <TextNormal style={{ marginLeft: 10, borderLeftWidth: 1, borderColor: 'gray', paddingLeft: 10 }}>
                        {' Tìm kiếm theo mã đơn hàng'}
                      </TextNormal>
                    </TouchableOpacity>
                  </View>
                )
              }
            </View>
            {isLoadingHistory && orderType === 2 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <TextNormal style={styles.loadingText}>Đang tải lịch sử đơn hàng...</TextNormal>
              </View>
            ) : (
              <OrderTable orderType={orderType} orders={data} showSettingPrinter={() => setModalVisible(true)} />
            )}
            <Modal
              onBackdropPress={() => setModalVisible(false)}
              isVisible={modalVisible}
              onBackButtonPress={() => setModalVisible(false)}
              propagateSwipe
              style={styles.modal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TextNormal style={styles.modalTitle}>{"Thiết lập máy in"}</TextNormal>
                </View>

                <View style={styles.modalContent}>
                  <View style={styles.inputGroup}>
                    <TextNormal style={styles.label}>{"Địa chỉ IP máy in"}</TextNormal>
                    <View style={[styles.inputContainer, errors.ip && styles.inputError]}>
                      <TextInput
                        placeholder="Ví dụ: 192.168.1.100"
                        value={ip}
                        onChangeText={(text) => {
                          setIP(text);
                          setErrors(prev => ({ ...prev, ip: null }));
                        }}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                    {errors.ip && <Text style={styles.errorText}>{errors.ip}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <TextNormal style={styles.label}>{"Chiều rộng giấy (mm)"}</TextNormal>
                    <View style={[styles.inputContainer, errors.sWidth && styles.inputError]}>
                      <TextInput
                        placeholder="Ví dụ: 50"
                        value={sWidth.toString()}
                        onChangeText={(text) => {
                          setSWidth(text);
                          setErrors(prev => ({ ...prev, sWidth: null }));
                        }}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                    {errors.sWidth && <Text style={styles.errorText}>{errors.sWidth}</Text>}
                  </View>
                  <View style={styles.inputGroup}>
                    <TextNormal style={styles.label}>{"Chiều cao giấy (mm)"}</TextNormal>
                    <View style={[styles.inputContainer, errors.sHeight && styles.inputError]}>
                      <TextInput
                        placeholder="Ví dụ: 30"
                        value={sHeight.toString()}
                        onChangeText={(text) => {
                          setSHeight(text);
                          setErrors(prev => ({ ...prev, sHeight: null }));
                        }}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                    {errors.sHeight && <Text style={styles.errorText}>{errors.sHeight}</Text>}
                  </View>

                  <View style={styles.toggleGroup}>
                    <View style={styles.toggleLabelContainer}>
                      <TextNormal style={styles.label}>{"Tự động in đơn mới"}</TextNormal>
                      <Text style={styles.toggleDescription}>
                        {"Tự động in hóa đơn khi có đơn hàng mới"}
                      </Text>
                    </View>
                    <Switch
                      value={autoPrint}
                      onValueChange={setAutoPrint}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={Colors.whiteColor}
                      ios_backgroundColor={Colors.border}
                    />
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>{"Hủy"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    <Text style={styles.buttonText}>
                      {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
      <StoreSelectionDialog
        visible={storeDialogVisible}
        onClose={() => setStoreDialogVisible(false)}
        onStoreSelect={handleStoreSelect}
      />
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
  },
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
  wrapperOrderType: {
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
  textHeader: {
    color: Colors.secondary,
  },
  sidebar: {
    width: 80,
    backgroundColor: '#001f3f',
    paddingTop: 20,
    alignItems: 'center',
  },
  menuItem: {
    marginVertical: 15,
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  header: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    height: 40,
    alignItems: 'center',
    marginRight: 10,
    width: 200,
  },
  dialogInput: {
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
    height: 50,
    alignItems: 'center',
    marginRight: 10,
    width: 202,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  badgeRed: {
    backgroundColor: '#ffcccc',
  },
  badgeBlue: {
    backgroundColor: '#cce5ff',
  },
  badgeText: {
    fontSize: 12,
    color: '#000',
  },
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.whiteColor,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    height: 45,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.bgInput,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.whiteColor,
    fontSize: 16,
    fontWeight: '500',
  },
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  toggleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    borderRadius: 10,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
  },
});

export default Orders;
