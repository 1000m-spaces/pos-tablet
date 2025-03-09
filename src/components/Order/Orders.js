import Icons from 'common/Icons/Icons';
import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import orderController from 'store/order/orderController';
import Colors from 'theme/Colors';
import OrderTable from './OrderTable';

const dumy = {
  "orders": [{
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  }, {
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  }, {
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  }, {
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  }, {
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  }, {
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  }, {
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  },
  {
    "orderID": "ORD12345",
    "displayID": "D12345",
    "itemInfo": {
      "count": 2,
      "items": [
        {
          "itemID": "ITEM001",
          "name": "Burger",
          "quantity": 1
        },
        {
          "itemID": "ITEM002",
          "name": "Fries",
          "quantity": 2
        }
      ]
    },
    "state": "Confirmed",
    "deliveryTaskpoolStatus": "Pending",
    "preparationTaskpoolStatus": "In Progress",
    "orderValue": "15.99"
  },
  {
    "orderID": "ORD67890",
    "displayID": "D67890",
    "itemInfo": {
      "count": 3,
      "items": [
        {
          "itemID": "ITEM003",
          "name": "Pizza",
          "quantity": 1
        },
        {
          "itemID": "ITEM004",
          "name": "Soda",
          "quantity": 2
        },
        {
          "itemID": "ITEM005",
          "name": "Ice Cream",
          "quantity": 1
        }
      ]
    },
    "state": "Delivered",
    "deliveryTaskpoolStatus": "Completed",
    "preparationTaskpoolStatus": "Done",
    "orderValue": "25.50"
  },
  {
    "orderID": "ORD54321",
    "displayID": "D54321",
    "itemInfo": {
      "count": 1,
      "items": [
        {
          "itemID": "ITEM006",
          "name": "Salad",
          "quantity": 1
        }
      ]
    },
    "state": "Cancelled",
    "deliveryTaskpoolStatus": "N/A",
    "preparationTaskpoolStatus": "Not Started",
    "orderValue": "10.00"
  }
  ]
}


const orderFilters = [
  { id: 1, name: 'Đơn mới' },
  { id: 2, name: 'Đơn đặt trước' },
  { id: 3, name: 'Lịch sử' },
];
const Orders = () => {
  const [data, setData] = useState([])
  const [orderType, setOrderType] = useState(1);
  useEffect(() => {
    orderController.fetchOrder({
      branch_id: 249,
      brand_id: 110,
      merchant_id: 133,
      service: "GRAB"
    }).then((res) => {
      console.log('res', res)
      if (res.success) {
        setData(dumy.orders)
      }
    })
  }, [])


  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <TextNormal style={styles.text}>{'GRAB'}</TextNormal>
      <TextNormal style={styles.text}>{item.displayID}</TextNormal>
      {/* <TextNormal style={styles.text}>{item.time}</TextNormal> */}
      <TextNormal style={styles.text}>{item.orderValue}</TextNormal>
      <TextNormal style={styles.text}>{item.itemInfo.count}</TextNormal>
      <View style={[styles.badge, styles.badgeRed]}>
        <TextNormal style={styles.badgeText}>{'Chưa in'}</TextNormal>
      </View>
      <View style={[styles.badge, styles.badgeBlue]}>
        <TextNormal style={styles.badgeText}>{item.state}</TextNormal>
      </View>
    </View>
  );

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
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.searchInput}>
              <Svg name={'search'} size={20} color={'gray'} />
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
              <TextNormal style={{ color: Colors.secondary }}>
                {' Tìm kiếm món'}
              </TextNormal>
            </TouchableOpacity>
          </View>
        </View>

        {/* Table */}
        <OrderTable orders={data} />
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
