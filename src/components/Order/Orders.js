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

const orderFilters = [
  { id: 1, name: 'Đơn mới' },
  { id: 2, name: 'Lịch sử' },
];

const Orders = () => {
  const [data, setData] = useState([]);
  const [orderType, setOrderType] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  // Label printer settings
  const [ip, setIP] = useState("");
  const [sWidth, setSWidth] = useState(50);
  const [sHeight, setSHeight] = useState(30);
  const [autoPrint, setAutoPrint] = useState(false);

  // Bill printer settings
  const [billIP, setBillIP] = useState("");
  const [billWidth, setBillWidth] = useState(80);

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [userShop, setUserShop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [printerType, setPrinterType] = useState('label'); // 'label' or 'bill'

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('-');
  };

  const fetchOrders = useCallback(async () => {
    if (!userShop) {
      console.log('No user shop data available');
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setData([]); // Clear data while loading

    try {
      if (orderType === 1) {
        const res = await orderController.fetchOrder({
          branch_id: userShop.id,
          brand_id: userShop.partnerid,
          merchant_id: userShop.partnerid,
          service: "GRAB",
        });

        if (res.success) {
          setData(res?.data?.orders || []);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi khi tải đơn hàng mới',
            position: 'bottom',
          });
        }
      } else {
        const formattedDate = formatDate(selectedDate);
        const res = await orderController.fetchOrderHistory({
          branch_id: userShop.id,
          brand_id: userShop.partnerid,
          merchant_id: userShop.partnerid,
          from_at: formattedDate,
          to_at: formattedDate,
          page: 1,
          service: "GRAB",
          size: 1000,
        });

        if (res.success) {
          const statements = res.data.statements || [];
          try {
            const orderDetailsPromises = statements.map(statement =>
              orderController.getOrderDetail({
                order_id: statement.ID,
                branch_id: userShop.id,
                brand_id: userShop.partnerid,
                service: "GRAB",
                merchant_id: userShop.partnerid,
              })
            );
            const orderDetailsResults = await Promise.all(orderDetailsPromises);
            const orders = orderDetailsResults.map((result, index) => ({
              ...result?.data?.order,
              ...statements[index]
            }));
            setData(orders);
          } catch (error) {
            console.error('Error fetching order details:', error);
            Toast.show({
              type: 'error',
              text1: 'Lỗi khi tải chi tiết đơn hàng',
              position: 'bottom',
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi khi tải lịch sử đơn hàng',
            position: 'bottom',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tải đơn hàng',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userShop, orderType, selectedDate, isLoading]);

  const loadUserShop = async () => {
    const user = await AsyncStorage.getUser();
    if (user && user.shops) {
      setUserShop(user.shops);
      console.log('Orders: User shop loaded:', user.shops);
    } else {
      console.log('Orders: No user shop data found');
    }
  };

  useEffect(() => {
    loadUserShop();
  }, []);

  useEffect(() => {
    if (userShop) {
      // Initial fetch
      fetchOrders();
      if (orderType !== 1) {
        return;
      }
      // Set up interval for fetching orders every 30 seconds
      const intervalId = setInterval(() => {
        if (!isLoading) {
          fetchOrders();
        }
      }, 30000);
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [userShop, orderType, selectedDate]);

  useEffect(() => {
    AsyncStorage.getPrinterInfo().then((printerInfo) => {
      if (printerInfo) {
        // Label printer settings
        setIP(printerInfo.IP || "")
        setSWidth(printerInfo.sWidth || 50)
        setSHeight(printerInfo.sHeight || 30)
        setAutoPrint(printerInfo.autoPrint || false)

        // Bill printer settings
        setBillIP(printerInfo.billIP || printerInfo.IP || "")
        setBillWidth(printerInfo.billWidth || 80)
      }
    })
  }, [])

  const renderFilter = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          if (!isLoading) {
            setOrderType(item.id)
          }
        }}
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

    // Validate label printer settings
    if (!ip) {
      newErrors.ip = 'Vui lòng nhập địa chỉ IP máy in tem';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      newErrors.ip = 'Định dạng địa chỉ IP không hợp lệ';
    }
    if (!sWidth || isNaN(sWidth) || sWidth <= 0) {
      newErrors.sWidth = 'Chiều rộng tem phải là số dương';
    }
    if (!sHeight || isNaN(sHeight) || sHeight <= 0) {
      newErrors.sHeight = 'Chiều cao tem phải là số dương';
    }

    // Validate bill printer settings
    if (!billIP) {
      newErrors.billIP = 'Vui lòng nhập địa chỉ IP máy in bill';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(billIP)) {
      newErrors.billIP = 'Định dạng địa chỉ IP không hợp lệ';
    }
    if (!billWidth || isNaN(billWidth) || billWidth <= 0) {
      newErrors.billWidth = 'Chiều rộng bill phải là số dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await AsyncStorage.setPrinterInfo({
        // Label printer settings
        IP: ip,
        sWidth: parseInt(sWidth),
        sHeight: parseInt(sHeight),
        autoPrint: autoPrint,

        // Bill printer settings
        billIP: billIP,
        billWidth: parseInt(billWidth)
      });
      Toast.show({
        type: 'success',
        text1: 'Lưu cài đặt máy in thành công',
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
              <View style={styles.headerContainer}>
                <View style={styles.filtersContainer}>
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
                </View>
                <View style={styles.actionContainer}>
                  <View style={styles.actionButton}>
                    <TextNormal style={styles.actionButtonText}>
                      {userShop ? userShop.name_vn : 'Loading...'}
                    </TextNormal>
                  </View>
                  <TouchableOpacity
                    style={[styles.actionButton, { opacity: isLoading ? 0.5 : 1 }]}
                    onPress={() => {
                      if (!isLoading) {
                        setPrinterType('label');
                        setModalVisible(true);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Svg name={'printer'} size={40} color={'transparent'} />
                    <TextNormal style={styles.actionButtonText}>In tem</TextNormal>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { opacity: isLoading ? 0.5 : 1 }]}
                    onPress={() => {
                      if (!isLoading) {
                        setPrinterType('bill');
                        setModalVisible(true);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Svg name={'printer'} size={40} color={'transparent'} />
                    <TextNormal style={styles.actionButtonText}>In bill</TextNormal>
                  </TouchableOpacity>
                </View>
              </View>
              {orderType === 2 && (
                <View style={styles.searchContainer}>
                  <TouchableOpacity
                    style={[styles.searchInput, isLoading && styles.disabledInput]}
                    onPress={() => !isLoading && setShowDatePicker(true)}
                    disabled={isLoading}
                  >
                    <Svg name={'clock'} size={20} color={'gray'} />
                    <TextNormal style={styles.searchInputText}>
                      {selectedDate.toLocaleDateString('en-GB')}
                    </TextNormal>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.searchInput, isLoading && styles.disabledInput]}
                    disabled={isLoading}
                  >
                    <Svg name={'search'} size={20} color={'gray'} />
                    <TextNormal style={styles.searchInputText}>
                      {'All'}
                    </TextNormal>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.searchInput, { flex: 2 }, isLoading && styles.disabledInput]}
                    disabled={isLoading}
                  >
                    <Svg name={'search'} size={20} />
                    <TextNormal style={styles.searchInputText}>
                      {' Tìm kiếm theo mã đơn hàng'}
                    </TextNormal>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <TextNormal style={styles.loadingText}>
                  {orderType === 1 ? 'Đang tải đơn hàng mới...' : 'Đang tải lịch sử đơn hàng...'}
                </TextNormal>
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
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tabButton, printerType === 'label' && styles.activeTab]}
                      onPress={() => setPrinterType('label')}
                    >
                      <TextNormal style={[styles.tabText, printerType === 'label' && styles.activeTabText]}>
                        {"In tem"}
                      </TextNormal>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabButton, printerType === 'bill' && styles.activeTab]}
                      onPress={() => setPrinterType('bill')}
                    >
                      <TextNormal style={[styles.tabText, printerType === 'bill' && styles.activeTabText]}>
                        {"In bill"}
                      </TextNormal>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalContent}>
                  {printerType === 'label' ? (
                    // Label Printer Settings
                    <>
                      <View style={styles.inputGroup}>
                        <TextNormal style={styles.label}>{"Địa chỉ IP máy in tem"}</TextNormal>
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
                        <TextNormal style={styles.label}>{"Chiều rộng tem (mm)"}</TextNormal>
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
                        <TextNormal style={styles.label}>{"Chiều cao tem (mm)"}</TextNormal>
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
                          <TextNormal style={styles.label}>{"Tự động in tem"}</TextNormal>
                          <Text style={styles.toggleDescription}>
                            {"Tự động in tem khi có đơn hàng mới"}
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
                    </>
                  ) : (
                    // Bill Printer Settings
                    <>
                      <View style={styles.inputGroup}>
                        <TextNormal style={styles.label}>{"Địa chỉ IP máy in bill"}</TextNormal>
                        <View style={[styles.inputContainer, errors.billIP && styles.inputError]}>
                          <TextInput
                            placeholder="Ví dụ: 192.168.1.101"
                            value={billIP}
                            onChangeText={(text) => {
                              setBillIP(text);
                              setErrors(prev => ({ ...prev, billIP: null }));
                            }}
                            style={styles.input}
                            keyboardType="numeric"
                            placeholderTextColor={Colors.textSecondary}
                          />
                        </View>
                        {errors.billIP && <Text style={styles.errorText}>{errors.billIP}</Text>}
                      </View>

                      <View style={styles.inputGroup}>
                        <TextNormal style={styles.label}>{"Chiều rộng bill (mm)"}</TextNormal>
                        <View style={[styles.inputContainer, errors.billWidth && styles.inputError]}>
                          <TextInput
                            placeholder="Ví dụ: 80"
                            value={billWidth.toString()}
                            onChangeText={(text) => {
                              setBillWidth(text);
                              setErrors(prev => ({ ...prev, billWidth: null }));
                            }}
                            style={styles.input}
                            keyboardType="numeric"
                            placeholderTextColor={Colors.textSecondary}
                          />
                        </View>
                        {errors.billWidth && <Text style={styles.errorText}>{errors.billWidth}</Text>}
                      </View>


                    </>
                  )}
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
    width: '90%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 16,
    alignSelf: 'center',
    margin: 20,
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
    minWidth: 120,
    flex: 1,
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
    minWidth: 120,
    flex: 1,
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
    width: '95%',
    maxWidth: 500,
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
  disabledInput: {
    opacity: 0.5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersContainer: {
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
  },
  actionButtonText: {
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputText: {
    marginLeft: 10,
    borderLeftWidth: 1,
    borderColor: 'gray',
    paddingLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgInput,
    borderRadius: 8,
    padding: 4,
    maxWidth: 200,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.whiteColor,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.textPrimary,
  },
});

export default Orders;
