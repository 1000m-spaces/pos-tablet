import Icons from 'common/Icons/Icons';
import Svg from 'common/Svg/Svg';
import {TextNormal} from 'common/Text/TextFont';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getOnlineOrder} from 'store/actions';
import {asyncStorage} from 'store/index';
import { onlineOrderSelector } from 'store/selectors';
import Colors from 'theme/Colors';

const data = [
  {
    id: 1,
    partner: 'Grab',
    orderId: '#GF-249',
    time: '15-01-2025 12:33',
    total: '95.500',
    items: 3,
    status: 'Chưa in',
    type: 'Đơn mới',
  },
  {
    id: 2,
    partner: 'Grab',
    orderId: '#GF-249',
    time: '15-01-2025 12:05',
    total: '316.000',
    items: 5,
    status: 'Chưa in',
    type: 'Đơn mới',
  },
  {
    id: 3,
    partner: 'Shopee',
    orderId: '#8837',
    time: '15-01-2025 11:50',
    total: '187.000',
    items: 4,
    status: 'Chưa in',
    type: 'Đơn mới',
  },
];
const orderFilters = [
  {id: 1, name: 'Đơn mới'},
  {id: 2, name: 'Đơn đặt trước'},
  {id: 3, name: 'Lịch sử'},
];
const Orders = () => {
  const dispatch = useDispatch();
  const onlineOrder = useSelector(state => onlineOrderSelector(state));
  const [orderType, setOrderType] = useState(1);
  useEffect(() => {
    dispatch(getOnlineOrder({rest_id: '237'}));
  }, []);
  useEffect(() => {
    console.log('onlineOrder::', onlineOrder);
  }, [onlineOrder]);

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <TextNormal style={styles.text}>{item.partner}</TextNormal>
      <TextNormal style={styles.text}>{item.orderId}</TextNormal>
      <TextNormal style={styles.text}>{item.time}</TextNormal>
      <TextNormal style={styles.text}>{item.total}</TextNormal>
      <TextNormal style={styles.text}>{item.items}</TextNormal>
      <View style={[styles.badge, styles.badgeRed]}>
        <TextNormal style={styles.badgeText}>{item.status}</TextNormal>
      </View>
      <View style={[styles.badge, styles.badgeBlue]}>
        <TextNormal style={styles.badgeText}>{item.type}</TextNormal>
      </View>
    </View>
  );

  const renderFilter = ({item, index}) => {
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
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
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
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.searchInput}>
              <Svg name={'search'} size={20} color={'gray'} />
              <TextNormal style={{marginLeft: 10, borderLeftWidth: 1, borderColor: 'gray', paddingLeft: 10}}>
                {new Date().toLocaleDateString('en-GB')}
              </TextNormal>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchInput}>
              <Svg name={'search'} size={20} color={'gray'} />
              <TextNormal style={{marginLeft: 10, borderLeftWidth: 1, borderColor: 'gray', paddingLeft: 10}}>
                {'All'}
              </TextNormal>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.searchInput, {flex: 1}]}>
              <Svg name={'search'} size={20} />
              <TextNormal style={{color: Colors.secondary}}>
                {' Tìm kiếm món'}
              </TextNormal>
            </TouchableOpacity>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <FlatList
            data={data}
            ListHeaderComponent={() => {
              return (
                <View style={styles.row}>
                  <TextNormal style={styles.textHeader}>{'Đối tác'}</TextNormal>
                  <TextNormal style={styles.textHeader}>
                    {'Mã đơn hàng'}
                  </TextNormal>
                  <TextNormal style={styles.textHeader}>
                    {'Thời gian nhận đơn'}
                  </TextNormal>
                  <TextNormal style={styles.textHeader}>
                    {'Tổng tiền'}
                  </TextNormal>
                  <TextNormal style={styles.textHeader}>{'Số món'}</TextNormal>
                  <TextNormal style={styles.textHeader}>{'Tem'}</TextNormal>
                  <TextNormal style={styles.textHeader}>
                    {'Trạng thái đơn'}
                  </TextNormal>
                </View>
              );
            }}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
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
});

export default Orders;
