import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';

import Options from './Options';
import { useDispatch, useSelector } from 'react-redux';
import { productSelector } from 'store/selectors';
import { addProductCart, setProductAction } from 'store/actions';
import ProductSection from './ProductSection';
import ExtraSection from './ExtraSection';
import QuantityProduct from './QuantityProduct';
import { heightDevice, widthDevice } from 'assets/constans';
import { TextNormal } from 'common/Text/TextFont';
import Colors from 'theme/Colors';
const DetailProduct = ({ isVisiable, close }) => {
  const dispatch = useDispatch();
  const detailProduct = useSelector(state => productSelector(state));
  const [options, setOptions] = useState([]);
  const [topping, setTopping] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const setupOption = () => {
    if (detailProduct?.options === false) {
      return;
    }
    const listOption = Array.from(detailProduct.options[0], (item, index) => ({
      ...item,
      value: detailProduct?.option_item.id === item.id ? true : false,
    }));
    setOptions(listOption);
  };
  const setupExtra = () => {
    if (detailProduct?.extras === false) {
      return;
    }
    const mapSubTypes = new Map(
      detailProduct.extras[0].map(item => {
        return [
          item?.group_type,
          {
            id: item?.group_type,
            data: [],
          },
        ];
      }),
    );
    const tempMapExtra = new Map();
    detailProduct?.extras[0].map(item => {
      tempMapExtra.set(item?.id, { ...item, value: false });
      if (mapSubTypes.has(item?.group_type)) {
        mapSubTypes.get(item?.group_type)?.data.push({
          ...item,
          value: detailProduct.extraIds.includes(item.id),
        });
      }
    });
    setTopping(Array.from(mapSubTypes, ([_, val]) => val));
  };
  useEffect(() => {
    isVisiable && StatusBar.setHidden(true);
    if (detailProduct) {
      setupOption();
      setupExtra();
    }
  }, [isVisiable]);
  const updateOptionProduct = () => {
    if (!options || options.length === 0) {
      return;
    }
    let opt = -1;
    options.map(o => {
      if (o.value === true) {
        opt = o;
      }
    });
    opt !== -1 &&
      dispatch(setProductAction({ ...detailProduct, option_item: opt }));
  };
  useEffect(() => {
    updateOptionProduct();
  }, [options]);
  // useEffect(() => {
  //   console.log('detail product:::', JSON.stringify(detailProduct));
  // }, [detailProduct]);
  const onSelectOption = option => {
    const list = JSON.parse(JSON.stringify(options));
    list.map(o => {
      if (o.id === option.id) {
        o.value = true;
      } else {
        o.value = false;
      }
    });
    setOptions(list);
  };
  const onSelectTopping = (type, tp) => {
    const listItem = JSON.parse(JSON.stringify(topping));
    listItem.map(item => {
      if (type === 0 && item.id === type) {
        item?.data.map(t => {
          if (t.id === tp.id) {
            t.value = !t.value;
          }
        });
      }
      if (type === 1 && item.id === type) {
        item?.data.map(t => {
          if (t.id === tp.id) {
            t.value = true;
          } else {
            t.value = false;
          }
        });
      }
    });
    setTopping(listItem);
  };
  const updateExtraProduct = () => {
    if (!topping || topping.length === 0) {
      return;
    }
    const listSelected = [];
    topping.map(item => {
      item?.data.map(t => {
        if (t.value === true) {
          listSelected.push(t);
        }
      });
    });
    dispatch(
      setProductAction({
        ...detailProduct,
        extra_items: listSelected,
        extraIds: Array.from(listSelected, val => val.id),
      }),
    );
  };
  useEffect(() => {
    updateExtraProduct();
  }, [topping]);
  const onAddingCart = () => {
    let total_price = detailProduct.prodprice || 0;
    detailProduct.extra_items.map(e => {
      if (e.def_price && e.def_price > 0) {
        total_price += e.def_price;
      }
    });
    dispatch(
      addProductCart({
        ...detailProduct,
        quantity,
        total_price,
        note: note.trim(),
      }),
    );
    close();
  };
  return (
    <Modal
      isVisible={isVisiable}
      onBackButtonPress={() => console.log('back hardware')}
      onBackdropPress={close}
      propagateSwipe
      style={styles.containerModal}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.containerView}>
        <ProductSection detailProduct={detailProduct} />
        {/* OPTION PRODUCT */}
        {options && options.length > 0 && (
          <View>
            <Options options={options} onSelectOption={onSelectOption} />
            <View style={styles.line} />
          </View>
        )}

        <ExtraSection topping={topping} onSelectTopping={onSelectTopping} />

        {/* NOTE SECTION */}
        <View style={styles.noteSection}>
          <TextNormal style={styles.noteLabel}>Ghi chú cho món này</TextNormal>
          <TextInput
            style={styles.noteInput}
            placeholder="Thêm ghi chú (ví dụ: ít đá, nhiều đường...)"
            value={note}
            onChangeText={setNote}
            multiline={true}
            numberOfLines={3}
            textAlignVertical={'top'}
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>
      <QuantityProduct
        detailProduct={detailProduct}
        quantity={quantity}
        onAddingCart={onAddingCart}
        updateQuantity={val => setQuantity(prev => (prev += val))}
      />
    </Modal>
  );
};

export default DetailProduct;

const styles = StyleSheet.create({
  containerView: { borderRadius: 16, paddingVertical: 24 },
  containerModal: {
    width: heightDevice > widthDevice ? heightDevice * 0.5 : widthDevice * 0.5,
    height: heightDevice > widthDevice ? widthDevice * 0.75 : heightDevice * 0.75,
    backgroundColor: 'white',
    borderRadius: 16,
    // position: 'absolute',
    // top: 103,
    left: heightDevice > widthDevice ? heightDevice * 0.25 : widthDevice * 0.25,
    margin: 10,
  },
  line: { height: 6, backgroundColor: '#F5F5F5' },
  noteSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textColor,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: Colors.textColor,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
