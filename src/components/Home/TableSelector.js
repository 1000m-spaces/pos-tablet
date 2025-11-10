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

const TableSelector = ({ isVisible, close, currentOrder, onSelectTable: onSelectTableProp }) => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => getTablesSelector(state));
  const [blockedTables, setBlockedTables] = useState({});
  const [serviceType, setServiceType] = useState(currentOrder?.orderType || "1"); // "1" for Tại quán, "2" for Mang đi
  const isTableSelectionRequired = currentOrder?.orderType === "1" || currentOrder?.orderType === 1;
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
    // If custom callback is provided (e.g., from order confirmation), use it
    if (onSelectTableProp) {
      onSelectTableProp(table);
    } else {
      // Default behavior: update Redux state and close modal
      close();
      dispatch(setOrderAction({
        ...currentOrder,
        orderType: serviceType,
        table: table.shoptablename,
        tableId: table.shoptableid
      }));
    }
  };

  const onSelectServiceType = (type) => {
    setServiceType(type);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={isTableSelectionRequired ? undefined : close}
      onBackdropPress={isTableSelectionRequired ? undefined : close}
      propagateSwipe
      style={styles.containerModal}>
      <View style={styles.containerView}>
        <TextNormal style={styles.title}>
          {isTableSelectionRequired ? 'Chọn thẻ (bắt buộc)' : 'Chọn thẻ'}
        </TextNormal>

        {/* Service Type Selection */}
        <View style={styles.serviceTypeContainer}>
          <TouchableOpacity
            style={[
              styles.serviceTypeButton,
              serviceType === "2" && styles.serviceTypeButtonActive
            ]}
            onPress={() => onSelectServiceType("2")}>
            <TextNormal style={[
              styles.serviceTypeText,
              serviceType === "2" && styles.serviceTypeTextActive
            ]}>
              Mang đi
            </TextNormal>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.serviceTypeButton,
              serviceType === "1" && styles.serviceTypeButtonActive
            ]}
            onPress={() => onSelectServiceType("1")}>
            <TextNormal style={[
              styles.serviceTypeText,
              serviceType === "1" && styles.serviceTypeTextActive
            ]}>
              Dùng tại quán
            </TextNormal>
          </TouchableOpacity>
        </View>

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
    width: 100,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 14,
    height: 50,
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
    fontSize: 16,
    fontWeight: '500',
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
    width: heightDevice * 0.85,
    maxHeight: widthDevice * 0.75,
    backgroundColor: 'white',
    borderRadius: 16,
    alignSelf: 'center',
    marginVertical: 100,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  serviceTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.btnDisabled,
  },
  serviceTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.inactiveText,
  },
  serviceTypeTextActive: {
    color: Colors.whiteColor,
    fontWeight: '600',
  },
  line: { height: 6, backgroundColor: '#F5F5F5' },
});
