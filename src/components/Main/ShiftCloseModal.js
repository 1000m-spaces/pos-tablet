import React, { useRef, useState, useEffect } from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getRevenueCashier, closeShift, closeShiftReset, logout, sendPhoneReset } from 'store/actions';
import AsyncStorage from 'store/async_storage/index';
import Svg from 'common/Svg/Svg';
import { TextNormal, TextSemiBold, TextHighLightBold } from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import Toast from 'react-native-toast-message';
import Status from 'common/Status/Status';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SPLASH, NAVIGATION_LOGIN } from 'navigation/routes';
import Modal from 'react-native-modal';

const DEFAULT_REVENUE = '0';

const ShiftCloseModal = ({ onCloseModal }) => {
  const dispatch = useDispatch();
  const refInput = useRef(null);
  const navigation = useNavigation();
  const [actualRevenue, setActualRevenue] = useState('');
  const [beginBalance, setBeginBalance] = useState('0');
  const [remainingAdvance, setRemainingAdvance] = useState(DEFAULT_REVENUE);
  const [user, setUser] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successRevenue, setSuccessRevenue] = useState('0');

  const cashierRevenue = useSelector(state => state.auth.cashierRevenue);
  const statusCloseShift = useSelector(state => state.auth.statusCloseShift);
  const errorCloseShift = useSelector(state => state.auth.errorCloseShift);

  useEffect(() => {
    const loadUserAndFetch = async () => {
      const userData = await AsyncStorage.getUser();
      setUser(userData);
      if (userData && userData.userid && userData.shops?.id) {
        dispatch(getRevenueCashier({
          user_id: userData.userid,
          shop_id: userData.shops.id
        }));
      }
    };
    loadUserAndFetch();
  }, [dispatch]);

  useEffect(() => {
    console.log('cashierRevenue updated::', cashierRevenue);
    if (cashierRevenue && cashierRevenue.begin_balance !== undefined && cashierRevenue.begin_balance !== null) {
      const val = cashierRevenue.begin_balance;
      const cleanVal = String(val).replace(/[^0-9]/g, '');
      setBeginBalance(cleanVal || '0');
    }
  }, [cashierRevenue]);

  useEffect(() => {
    if (statusCloseShift === Status.SUCCESS) {
      // Show success popup instead of navigating immediately
      const total = (Number(beginBalance) || 0) + (Number(remainingAdvance) || 0) + (Number(actualRevenue) || 0);
      setSuccessRevenue(String(total));
      setIsSuccessModalVisible(true);
      dispatch(closeShiftReset());
      dispatch(logout());
      dispatch(sendPhoneReset());
    } else if (statusCloseShift === Status.ERROR) {
      Toast.show({
        type: 'error',
        text1: 'Chốt ca thất bại',
        text2: errorCloseShift || 'Đã có lỗi xảy ra',
        position: 'top',
      });
      dispatch(closeShiftReset());
    }
  }, [statusCloseShift]);

  const handleTextChange = (text) => {
    // Keep only numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    
    // Manage leading zeros
    if (cleanText === '') {
      setActualRevenue('');
    } else if (cleanText.startsWith('0') && cleanText.length > 1) {
      setActualRevenue(cleanText.replace(/^0+/, ''));
    } else {
      setActualRevenue(cleanText);
    }
  };

  const handleBeginBalanceChange = (text) => {
    // Keep only numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    
    // Manage leading zeros
    if (cleanText === '') {
      setBeginBalance('');
    } else if (cleanText.startsWith('0') && cleanText.length > 1) {
      setBeginBalance(cleanText.replace(/^0+/, ''));
    } else {
      setBeginBalance(cleanText);
    }
  };

  const handleRemainingAdvanceChange = (text) => {
    // Keep only numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    
    // Manage leading zeros
    if (cleanText === '') {
      setRemainingAdvance('0');
    } else if (cleanText.startsWith('0') && cleanText.length > 1) {
      setRemainingAdvance(cleanText.replace(/^0+/, ''));
    } else {
      setRemainingAdvance(cleanText);
    }
  };

  const handleConfirm = () => {
    if (actualRevenue === '') return;
    if (!user) return;

    const shopId = user.shops?.id || user.shopid || 0;

    dispatch(closeShift({
      begin_balance: Number(beginBalance) || 0,
      net_revenue: Number(actualRevenue) || 0,
      remaining_advance: Number(remainingAdvance) || 0,
      user_id: user.userid,
      shop_id: shopId
    }));
  };

  const isSubmitDisabled = actualRevenue === '' || statusCloseShift === Status.LOADING;

  const handleSuccessConfirm = () => {
    setIsSuccessModalVisible(false);
    onCloseModal(); // Close outer modal
    navigation.reset({
      index: 0,
      routes: [{ name: NAVIGATION_LOGIN }],
    });
  };

  // Calculations
  const openTime = cashierRevenue?.open_time || 'N/A';
  const totalCash = (Number(beginBalance) || 0) + (Number(remainingAdvance) || 0) + (Number(actualRevenue) || 0);
  const totalCashFormatted = Number(totalCash).toLocaleString('vi-VN') + 'đ';

  return (
    <View style={styles.container}>
      {/* Circle Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Svg name={'success'} size={34} color={'#0D1F3C'} />
        </View>
      </View>

      {/* Header Info */}
      <TextHighLightBold style={styles.title}>{'Xác nhận chốt ca'}</TextHighLightBold>
      <TextNormal style={styles.subtitle}>{'Vui lòng kiểm tra và xác nhận lại tiền thực thu'}</TextNormal>

      {/* Grey Card Container */}
      <View style={styles.cardContainer}>
        {/* Row 1: Thời gian bắt đầu */}
        <View style={styles.infoRow}>
          <TextNormal style={styles.infoLabel}>{'Thời gian bắt đầu'}</TextNormal>
          <TextSemiBold style={styles.infoValue}>{openTime}</TextSemiBold>
        </View>

        {/* Input: Tiền tồn đầu ca */}
        <View style={styles.inputGroup}>
          <TextNormal style={styles.inputLabel}>{'TIỀN TỒN ĐẦU CA'}</TextNormal>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={beginBalance}
              onChangeText={handleBeginBalanceChange}
              keyboardType={'numeric'}
              onSubmitEditing={Keyboard.dismiss}
              placeholderTextColor={Colors.placeholder}
            />
            <TextHighLightBold style={styles.suffix}>{'đ'}</TextHighLightBold>
          </View>
        </View>

        {/* Input: Tiền tạm ứng còn lại */}
        <View style={styles.inputGroup}>
          <TextNormal style={styles.inputLabel}>{'TIỀN TẠM ỨNG CÒN LẠI'}</TextNormal>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={remainingAdvance}
              onChangeText={handleRemainingAdvanceChange}
              keyboardType={'numeric'}
              onSubmitEditing={Keyboard.dismiss}
              placeholderTextColor={Colors.placeholder}
            />
            <TextHighLightBold style={styles.suffix}>{'đ'}</TextHighLightBold>
          </View>
        </View>

        {/* Input: Tiền mặt thực thu */}
        <View style={styles.inputGroup}>
          <TextNormal style={styles.inputLabel}>{'TIỀN MẶT THỰC THU'}</TextNormal>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={actualRevenue}
              ref={refInput}
              onChangeText={handleTextChange}
              keyboardType={'numeric'}
              onSubmitEditing={Keyboard.dismiss}
              placeholderTextColor={Colors.placeholder}
            />
            <TextHighLightBold style={styles.suffix}>{'đ'}</TextHighLightBold>
          </View>
        </View>

        {/* Separator line */}
        <View style={styles.separator} />

        {/* Row 3: Tổng tiền mặt cuối ca */}
        <View style={styles.totalRow}>
          <TextHighLightBold style={styles.totalLabel}>{'TỔNG TIỀN MẶT CUỐI CA'}</TextHighLightBold>
          <TextHighLightBold style={styles.totalValue}>{totalCashFormatted}</TextHighLightBold>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity onPress={onCloseModal} style={styles.cancelBtn}>
          <TextSemiBold style={styles.cancelBtnText}>{'Hủy'}</TextSemiBold>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isSubmitDisabled}
          style={[
            styles.confirmBtn,
            isSubmitDisabled && { backgroundColor: Colors.btnDisabled }
          ]}>
          <TextSemiBold
            style={[
              styles.confirmBtnText,
              isSubmitDisabled && { color: Colors.textDisabled }
            ]}>
            {'XÁC NHẬN'}
          </TextSemiBold>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        isVisible={isSuccessModalVisible}
        onBackButtonPress={() => {}} // Prevent back button
        onBackdropPress={() => {}} // Prevent backdrop press - non-dismissible
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.7}>
        <View style={styles.successModalContent}>
          <View style={styles.successIconContainer}>
            <Svg name={'success'} size={50} color={Colors.primary} />
          </View>
          <TextHighLightBold style={styles.successTitle}>
            {'Chốt ca thành công!'}
          </TextHighLightBold>
          <TextNormal style={styles.successSubtitle}>
            {`Tổng tiền mặt cuối ca:\n${Number(successRevenue).toLocaleString('vi-VN')} đ`}
          </TextNormal>
          <TouchableOpacity
            onPress={handleSuccessConfirm}
            style={styles.successConfirmBtn}>
            <TextSemiBold style={styles.successConfirmBtnText}>
              {'XÁC NHẬN'}
            </TextSemiBold>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ShiftCloseModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 24,
  },
  iconContainer: {
    marginTop: 10,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FAF3EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D1F3C',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1F3C',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8E9AA0',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E4EC',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1F3C',
    padding: 0,
  },
  suffix: {
    fontSize: 14,
    color: '#A0A0A0',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 14,
    width: '100%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D1F3C',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D1F3C',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cancelBtnText: {
    color: '#0D1F3C',
    fontSize: 15,
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#F2522E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF3EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1F3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  successConfirmBtn: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successConfirmBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
