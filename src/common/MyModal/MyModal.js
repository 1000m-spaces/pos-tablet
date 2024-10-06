import React from 'react';
import {Modal, TouchableOpacity, View} from 'react-native';
import styles from './styles';

const MyModal = ({children, onPressOutSide, visible}) => {
  return (
    <Modal transparent={true} visible={visible} style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPressOutSide()}
        style={styles.content}>
        <View style={styles.viewBackground} />
        <View style={styles.viewContent}>{children}</View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MyModal;
