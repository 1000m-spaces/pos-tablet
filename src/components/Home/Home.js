import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { getMenuAction, setProductAction, getShopTablesAction } from 'store/actions';
import { currentOrderSelector, productMenuSelector } from 'store/selectors';
import ProductItemMenu from './ProductItemMenu';
import Colors from 'theme/Colors';
import { asyncStorage } from 'store/index';
import Header from './Header';
import DetailProduct from './DetailProduct';
import Cart from './Cart';
import TableSelector from './TableSelector';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const productMenu = useSelector(state => productMenuSelector(state));
  const [showModal, setShowModal] = useState(-1);
  const [currentCate, setCurrentCate] = useState(0);
  const [filteredProductMenu, setFilteredProductMenu] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const currentOrder = useSelector(state => currentOrderSelector(state));

  useEffect(() => {
    // Orientation.lockToLandscape();
    const initData = async () => {
      let user = await asyncStorage.getUser();
      const body = {
        roleid: user?.roleid,
        userid: user?.userid,
        restid: user?.shifts.rest_id,
      };
      dispatch(getMenuAction(body));
      dispatch(getShopTablesAction({
        rest_id: user?.shifts.rest_id,
      }));
    };
    initData();
  }, []);

  console.log('productMenu', productMenu)

  // Handle search results from Header component
  const handleSearchResults = (filteredResults, searching) => {
    setFilteredProductMenu(filteredResults);
    setIsSearching(searching);
  };

  // Get products to display based on search state
  const getProductsToDisplay = () => {
    if (isSearching) {
      // When searching, flatten all products from all categories
      const allProducts = [];
      filteredProductMenu.forEach(category => {
        if (category.products) {
          allProducts.push(...category.products);
        }
      });
      return allProducts;
    } else {
      // Normal view - show products from current category
      return productMenu[currentCate]?.products || [];
    }
  };

  const renderProductItems = ({ item, _ }) => {
    return (
      <ProductItemMenu product={item} onPressDetail={handlePressProduct} />
    );
  };

  const handlePressProduct = async item => {
    console.log(item);
    dispatch(setProductAction(item));
    item && setShowModal(1);
  };

  const onClose = () => {
    setShowModal(-1);
  };

  const onShowTable = () => setShowModal(2);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.bgInput,
        flexDirection: 'row',
      }}>
      <View style={{ flex: 1 }}>
        <Header
          currentCate={currentCate}
          productMenu={productMenu}
          setCurrentCate={setCurrentCate}
          onSearchResults={handleSearchResults}
        />

        <FlatList
          data={getProductsToDisplay()}
          keyExtractor={(cate, _) => `${cate.prodname}`}
          extraData={[currentCate, isSearching, filteredProductMenu]}
          renderItem={renderProductItems}
          numColumns={3}
          contentContainerStyle={{
            paddingLeft: 14,
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Cart showTable={onShowTable} />
      {showModal === 1 && (
        <DetailProduct close={onClose} isVisiable={showModal === 1} />
      )}
      {showModal === 2 && (
        <TableSelector
          close={onClose}
          isVisible={showModal === 2}
          currentOrder={currentOrder}
        />
      )}
    </SafeAreaView>
  );
};

export default Home;
