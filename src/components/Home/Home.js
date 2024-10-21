import React, {useEffect, useState} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import {getMenuAction, setProductAction} from 'store/actions';
import {productMenuSelector} from 'store/selectors';
import ProductItem from './ProductItem';
import Colors from 'theme/Colors';
import {asyncStorage} from 'store/index';
import Header from './Header';
import DetailProduct from './DetailProduct';
const Home = ({navigation}) => {
  const dispatch = useDispatch();
  const productMenu = useSelector(state => productMenuSelector(state));
  const [showDetail, setShowDetail] = useState(false);
  const [currentCate, setCurrentCate] = useState(0);
  useEffect(() => {
    // Orientation.lockToLandscape();
    const initData = async () => {
      let user = await asyncStorage.getUser();
      const body = {
        roleid: user?.roleid || '4',
        userid: user?.userid || '444',
        restid: user?.shifts.rest_id || '248',
      };
      dispatch(getMenuAction(body));
    };
    initData();
  }, []);
  const renderProductItems = ({item, index}) => {
    return (
      <ProductItem
        product={item}
        index={index}
        onPressDetail={handlePressProduct}
      />
    );
  };
  const handlePressProduct = async item => {
    console.log(item);
    dispatch(setProductAction(item));
    item && setShowDetail(true);
  };
  const onClose = () => {
    setShowDetail(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.bgInput,
        flexDirection: 'row',
      }}>
      <View style={{flex: 1}}>
        <Header
          currentCate={currentCate}
          productMenu={productMenu}
          setCurrentCate={setCurrentCate}
        />

        <FlatList
          data={productMenu[currentCate]?.products || []}
          keyExtractor={(cate, idx) => `${cate.name}_${cate.id}_${idx}`}
          renderItem={renderProductItems}
          numColumns={3}
          contentContainerStyle={{
            paddingLeft: 14,
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={{width: '30%', backgroundColor: 'green'}} />
      {showDetail && <DetailProduct close={onClose} isVisiable={showDetail} />}
    </SafeAreaView>
  );
};

export default Home;
