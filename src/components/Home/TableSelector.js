import {heightDevice, widthDevice} from 'assets/constans';
import {TextNormal} from 'common/Text/TextFont';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch} from 'react-redux';
import {setOrderAction} from 'store/actions';
import Colors from 'theme/Colors';

const TableSelector = ({isVisible, close, currentOrder}) => {
  const dispatch = useDispatch();
  const onSelectTable = val => {
    close();
    dispatch(setOrderAction({...currentOrder, table: val}));
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
        <View style={styles.wrapperTable}>
          {[...new Array(20)].map((_, index) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  onSelectTable(index + 1 < 10 ? `0${index + 1}` : index + 1)
                }
                style={styles.tableBtn}>
                <TextNormal>
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </TextNormal>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

export default TableSelector;
const styles = StyleSheet.create({
  wrapperTable: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
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
    height: widthDevice * 0.1,
    backgroundColor: 'white',
    borderRadius: 16,
    // position: 'absolute',
    // top: 103,
    left: heightDevice * 0.2,
    marginVertical: 150,
  },
  line: {height: 6, backgroundColor: '#F5F5F5'},
});
