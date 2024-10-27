import Svg from 'common/Svg/Svg';
import {TextNormal} from 'common/Text/TextFont';
import React, {useRef, useState} from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {setOrderAction} from 'store/actions';
import Colors from 'theme/Colors';

const NoteModal = ({onCloseModal, currentOrder}) => {
  const dispatch = useDispatch();
  const refInput = useRef(null);
  const [note, setNote] = useState('');
  const closeModal = () => {
    note &&
      note.length > 0 &&
      dispatch(setOrderAction({...currentOrder, note: note.trim()}));
    onCloseModal();
  };
  return (
    <View
      onLayout={() => setTimeout(() => refInput.current.focus(), 500)}
      style={styles.container}>
      <TextNormal style={styles.title}>{'Ghi chú'}</TextNormal>
      <TouchableOpacity style={styles.closeBtn}>
        <Svg name={'icon_close'} size={24} color={'black'} />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Thêm ghi chú đơn"
        value={note}
        ref={refInput}
        onChangeText={setNote}
        onSubmitEditing={Keyboard.dismiss}
        textAlignVertical={'top'}
        placeholderTextColor={Colors.placeholder}
      />
      <TouchableOpacity
        onPress={closeModal}
        disabled={!note || note.length <= 0}
        style={[
          styles.saveNoteBtn,
          note.trim().length > 0 && {backgroundColor: Colors.primary},
        ]}>
        <TextNormal
          style={{
            fontSize: 18,
            color: !note ? Colors.textDisabled : Colors.whiteColor,
            fontWeight: 'bold',
          }}>
          {'Lưu'}
        </TextNormal>
      </TouchableOpacity>
    </View>
  );
};

export default NoteModal;
const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: 24, paddingVertical: 14},
  saveNoteBtn: {
    height: 48,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: Colors.btnDisabled,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgInputNote,
    borderRadius: 16,
    marginTop: 14,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    paddingBottom: 14,
    fontSize: 19,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: Colors.btnDisabled,
  },
  closeBtn: {position: 'absolute', top: 16, right: 24},
});
