import { formatMoney, heightDevice, widthDevice } from 'assets/constans';
import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { currentOrderSelector } from 'store/selectors';
import Colors from 'theme/Colors';
import Modal from 'react-native-modal';
import { getVoucherAction, setOrderAction } from 'store/actions';
import NoteModal from './NoteModal';
const PaymentCart = () => {
  const dispatch = useDispatch();
  const currentOrder = useSelector(state => currentOrderSelector(state));
  const [payment, setPayment] = useState(null);

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
      <TouchableOpacity style={styles.orderBtn}>
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
        ]}>
        {modal === 1 && (
          <NoteModal currentOrder={currentOrder} onCloseModal={onCloseModal} />
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
