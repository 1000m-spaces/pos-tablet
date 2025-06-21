import { heightDevice, widthDevice } from 'assets/constans';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import { setOrderAction } from 'store/actions';
import { getTablesSelector } from 'store/tables/tableSelector';
import AsyncStorage from 'store/async_storage/index';
import Colors from 'theme/Colors';

const TableSelector = ({ isVisible, close, currentOrder }) => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => getTablesSelector(state));
  const [blockedTables, setBlockedTables] = useState({});
  console.log('tables::', tables)

  useEffect(() => {
    const loadBlockedTables = async () => {
      if (isVisible) {
        const blocked = await AsyncStorage.getBlockedTables();
        setBlockedTables(blocked);
      }
    };
    loadBlockedTables();
  }, [isVisible]);

  const onSelectTable = (table) => {
    close();
    dispatch(setOrderAction({
      ...currentOrder,
      table: table.shoptablename,
      tableId: table.shoptableid
    }));
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={() => console.log('back hardware')}
      onBackdropPress={close}
      propagateSwipe
      style={styles.containerModal}>
      <View style={styles.containerView}>
        <TextNormal style={styles.title}>{'Số thẻ'}</TextNormal>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.wrapperTable}
          showsVerticalScrollIndicator={true}>
          {tables?.map((table, index) => {
            const isOccupiedBySystem = table.state === "true" || table.orderId !== "0";
            const isBlockedByOfflineOrder = blockedTables.hasOwnProperty(table.shoptableid);
            const isOccupied = isOccupiedBySystem || isBlockedByOfflineOrder;

            return (
              <TouchableOpacity
                key={table.shoptableid}
                onPress={() => onSelectTable(table)}
                style={[
                  styles.tableBtn,
                  isOccupied && styles.tableBtnOccupied,
                  isBlockedByOfflineOrder && styles.tableBtnOfflineOccupied
                ]}
                disabled={isOccupied}>
                <TextNormal style={[
                  styles.tableBtnText,
                  isOccupied && styles.tableBtnTextOccupied
                ]}>
                  {table.shoptablename}
                  {isBlockedByOfflineOrder && (
                    <TextNormal style={styles.offlineIndicator}> (Offline)</TextNormal>
                  )}
                </TextNormal>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default TableSelector;
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  wrapperTable: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tableBtn: {
    width: 68,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.btnDisabled,
    backgroundColor: 'white',
  },
  tableBtnOccupied: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
  },
  tableBtnText: {
    fontSize: 12,
    color: 'black',
  },
  tableBtnTextOccupied: {
    color: '#888',
  },
  tableBtnOfflineOccupied: {
    backgroundColor: '#FF9800', // Orange for offline occupied tables
    borderColor: '#F57C00',
  },
  offlineIndicator: {
    fontSize: 10,
    fontStyle: 'italic',
    color: Colors.whiteColor,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 16,
  },
  containerView: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
  containerModal: {
    width: heightDevice * 0.6,
    maxHeight: widthDevice * 0.7,
    backgroundColor: 'white',
    borderRadius: 16,
    // position: 'absolute',
    // top: 103,
    left: heightDevice * 0.2,
    marginVertical: 150,
  },
  line: { height: 6, backgroundColor: '#F5F5F5' },
});
