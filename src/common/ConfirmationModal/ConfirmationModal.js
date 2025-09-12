import MyModal from 'common/MyModal/MyModal';
import { TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  TextMoneyBold,
  TextNormal,
  TextNormalSemiBold,
  TextSemiBold,
} from 'common/Text/TextFont';
import styles from './styles';
import strings from 'localization/Localization';
import { heightDevice, widthDevice } from 'assets/constans';

const ConfirmationModal = ({
  isOpen,
  onCancel,
  children,
  onConfirm,
  textContent,
  title,
  isWarning,
  isConfriming,
  isDisableConfirm,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const handleConfirmClick = () => {
    setIsClicked(true);
    onConfirm();
  };
  useEffect(() => {
    if (isClicked === true) {
      setTimeout(() => {
        setIsClicked(false);
      }, 2000);
    }
  }, [isClicked]);
  return (
    <MyModal visible={isOpen} onPressOutSide={() => { }}>
      <View style={styles.main}>
        <View
          style={
            children ? styles.containerModalWithChildren : styles.containerModal
          }>
          <View style={styles.headerModal}>
            <TextMoneyBold>{title || strings.common.notification}</TextMoneyBold>
          </View>

          {children ? (
            <View style={styles.containerChildren}>{children}</View>
          ) : (
            <View style={styles.wrapperContentConfirm}>
              <TextNormal style={styles.textContents}>{textContent}</TextNormal>
            </View>
          )}

          {isWarning === true && (
            <View style={styles.wrapperActionWarning}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={onCancel}>
                <TextSemiBold style={styles.modalButtonCancelText}>
                  {strings.common.back}
                </TextSemiBold>
              </TouchableOpacity>
            </View>
          )}
          {!isConfriming && !isWarning && (
            <View style={styles.wrapperButtonSection}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={onCancel}>
                <TextNormalSemiBold style={styles.modalButtonCancelText}>
                  {textContent === 'Bạn có muốn đánh giá đơn hàng?' ||
                    textContent === 'Would you like to rate your order?'
                    ? strings.common.skip
                    : strings.common.back}
                </TextNormalSemiBold>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isDisableConfirm === true || isClicked === true}
                style={styles.modalButtonOk}
                onPress={() => handleConfirmClick()}>
                <TextNormalSemiBold style={styles.modalButtonOkText}>
                  {strings.common.confirm}
                </TextNormalSemiBold>
              </TouchableOpacity>
            </View>
          )}
          {isConfriming && (
            <View style={styles.wrapperActionWarning}>
              <TouchableOpacity
                disabled={isDisableConfirm === true || isClicked === true}
                style={styles.modalButtonOk}
                onPress={() => handleConfirmClick()}>
                <TextNormalSemiBold style={styles.modalButtonOkText}>
                  {strings.common.confirm}
                </TextNormalSemiBold>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </MyModal>
  );
};

export default ConfirmationModal;
