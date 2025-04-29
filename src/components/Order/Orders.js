import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState } from 'react';
import { heightDevice, widthDevice } from 'assets/constans';
import Toast from 'react-native-toast-message'

import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView, TextInput, Pressable, Text
} from 'react-native';
import orderController from 'store/order/orderController';
import Colors from 'theme/Colors';
import OrderTable from './OrderTable';
import Modal from 'react-native-modal';
import AsyncStorage from 'store/async_storage/index'

const orderFilters = [
  { id: 1, name: 'Đơn mới' },
  // { id: 2, name: 'Đơn đặt trước' },
  { id: 3, name: 'Lịch sử' },
];
const Orders = () => {
  // const [data, setData] = useState(
  //   [
  //     {
  //       doiTac: "Grab",
  //       displayID: "#GF-249",
  //       thoiGianNhanDon: "15-01-2025 12:33",
  //       orderValue: "95.500",
  //       soMon: 3,
  //       tem: "Chưa in",
  //       state: "Delivered"
  //     },
  //     {
  //       doiTac: "Grab",
  //       displayID: "#GF-249",
  //       thoiGianNhanDon: "15-01-2025 12:05",
  //       orderValue: "316.000",
  //       soMon: 5,
  //       tem: "Chưa in",
  //       state: "Confirmed"
  //     },
  //     {
  //       doiTac: "Shopee",
  //       displayID: "#8837",
  //       thoiGianNhanDon: "15-01-2025 11:50",
  //       orderValue: "187.000",
  //       soMon: 4,
  //       tem: "Chưa in",
  //       state: "Confirmed"
  //     },
  //     {
  //       doiTac: "Shopee",
  //       displayID: "#3456",
  //       thoiGianNhanDon: "15-01-2025 11:45",
  //       orderValue: "95.500",
  //       itemInfoDetail: [{id: 1}, {id: 2}],
  //       soMon: 3,
  //       tem: "Đã in",
  //       state: "Cancelled"
  //     },
  //     {
  //       doiTac: "Grab",
  //       displayID: "#GF-546",
  //       thoiGianNhanDon: "15-01-2025 11:40",
  //       orderValue: "134.500",
  //       soMon: 6,
  //       tem: "Đã in",
  //       itemInfoDetail: [{id: 1}, {id: 2}],
  //       state: "Cancelled"
  //     },
  //     {
  //       doiTac: "Shopee",
  //       displayID: "#7678",
  //       thoiGianNhanDon: "15-01-2025 11:38",
  //       orderValue: "47.000",
  //       soMon: 1,
  //       tem: "Đã in",
  //       itemInfoDetail: [{id: 1}, {id: 2}],
  //       state: "Confirmed"
  //     },
  //     {
  //       doiTac: "Shopee",
  //       displayID: "#7678",
  //       thoiGianNhanDon: "15-01-2025 11:38",
  //       orderValue: "47.000",
  //       soMon: 1,
  //       tem: "Đã in",
  //       itemInfoDetail: [{id: 1}, {id: 2}],
  //       state: "Delivered"
  //     }
  //   ]
  // )
  const [data, setData] = useState([]);
  const [orderType, setOrderType] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [ip, setIP] = useState("")

  useEffect(() => {
    AsyncStorage.getPrinterInfo().then((printerInfo) => {
      if (printerInfo) {
        setIP(printerInfo.IP)
      }
    })
    orderController.fetchOrder({
      branch_id: 249,
      brand_id: 110,
      merchant_id: 133,
      service: "GRAB"
    }).then((res) => {
      console.log('res', res)
      if (res.success) {
        setData(res.data.orders ? res.data.orders : []);
      }
    })
  }, [])

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
                <TouchableOpacity style={{
                  paddingVertical: 12,
                  marginRight: 20
                }} onPress={() => {
                  setModalVisible(true)
                }}>
                  <Svg name={'printer'} size={40} color={'transparent'} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.searchInput}>
                  <Svg name={'clock'} size={20} color={'gray'} />
                  <TextNormal style={{ marginLeft: 10, borderLeftWidth: 1, borderColor: 'gray', paddingLeft: 10 }}>
                    {new Date().toLocaleDateString('en-GB')}
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
            </View>
            <OrderTable orders={data} showSettingPrinter={() => setModalVisible(true)} />
            <Modal
              onBackdropPress={() => setModalVisible(false)}
              isVisible={modalVisible}
              onBackButtonPress={() => setModalVisible(false)}
              propagateSwipe
              style={[
                {
                  width: heightDevice > widthDevice ? heightDevice * 0.25 : widthDevice * 0.25,
                  height:
                    heightDevice > widthDevice ? widthDevice * 0.25 : heightDevice * 0.25,
                  backgroundColor: Colors.bgInput,
                  position: 'absolute',
                  borderRadius: 16,
                  left: heightDevice > widthDevice ? heightDevice * 0.375 : widthDevice * 0.375,
                  top: heightDevice > widthDevice ? widthDevice * 0.25 : heightDevice * 0.25,
                  margin: 0,
                },
                modalVisible && { marginBottom: 3, marginLeft: 50 },
              ]}
            >
              <View style={styles.modalContainer}>
                <TextNormal style={styles.modalTitle}>{"Thiết lập máy in"}</TextNormal>
                <View>
                  <TextNormal style={styles.lable}>{"Địa chỉ ip của máy"}</TextNormal>
                  <View style={styles.dialogInput}>
                    <TextInput
                      placeholder="Printer IP"
                      value={ip}
                      onChangeText={(text) => setIP(text)}
                      style={{
                        width: 200,
                        height: 50,
                        color: 'black',
                        backgroundColor: Colors.whiteColor,
                      }}
                      autoFocus
                      placeholderTextColor={"gray"}
                    />
                  </View>
                </View>
                <Pressable style={{
                  marginTop: 15,
                  backgroundColor: "#FF9800",
                  padding: 10,
                  borderRadius: 5,
                }} onPress={() => {
                  AsyncStorage.setPrinterInfo({ IP: ip }).then(() => {
                    setModalVisible(false)
                  })
                }}>
                  <Text style={styles.printButtonText}>Save</Text>
                </Pressable>
              </View>
              <Toast />
            </Modal>
          </View>
        </View>
      </SafeAreaView >
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundColor,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  lable: {
    fontSize: 14,
    marginBottom: 10,
  },
});

export default Orders;
