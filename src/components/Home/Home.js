import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, TouchableOpacity, View } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { getMenuAction, setProductAction, getShopTablesAction, getPaymentChannelsAction } from 'store/actions';
import { currentOrderSelector, productMenuSelector } from 'store/selectors';
import ProductItemMenu from './ProductItemMenu';
import Colors from 'theme/Colors';
import { asyncStorage } from 'store/index';
import Header from './Header';
import DetailProduct from './DetailProduct';
import Cart from './Cart';
import TableSelector from './TableSelector';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthDevice } from 'assets/constans';
import { TextSmallTwelve } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import PrinterSettingsModal from 'common/PrinterSettingsModal';
import { usePrinter } from '../../services/PrinterService';

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const productMenu = useSelector(state => productMenuSelector(state));
  const [showModal, setShowModal] = useState(-1);
  const [currentCate, setCurrentCate] = useState(0);
  const [filteredProductMenu, setFilteredProductMenu] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const currentOrder = useSelector(state => currentOrderSelector(state));

  // Printer service
  const { labelPrinterStatus, billPrinterStatus } = usePrinter();

  // Printer settings state
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [printerType, setPrinterType] = useState('label'); // 'label' or 'bill'

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

  useEffect(() => {
    dispatch(getPaymentChannelsAction());
  }, [])

  // Handle printer settings saved
  const handlePrinterSettingsSaved = (printerSettings) => {
    // Optional: Handle any additional logic when printer settings are saved
    console.log('Printer settings saved:', printerSettings);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.bgInput,
      }}>
      <View style={{ height: 42, flexDirection: 'row', width: widthDevice * 0.91, justifyContent: 'flex-end', alignItems: 'center', paddingRight: 24 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', marginRight: 16 }}
          onPress={() => {
            setPrinterType('label');
            setPrinterModalVisible(true);
          }}
        >
          <Svg name={labelPrinterStatus === 'connected' ? 'icon_print' : 'icon_print_warning'} size={24} />
          <TextSmallTwelve style={{ marginLeft: 4 }}>In tem</TextSmallTwelve>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row' }}
          onPress={() => {
            setPrinterType('bill');
            setPrinterModalVisible(true);
          }}
        >
          <Svg name={billPrinterStatus === 'connected' ? 'icon_print' : 'icon_print_warning'} size={24} />
          <TextSmallTwelve style={{ marginLeft: 4 }}>In bill</TextSmallTwelve>
        </TouchableOpacity>
      </View>
      <View style={{
        flex: 1,
        backgroundColor: Colors.bgInput,
        flexDirection: 'row',
      }}>
        <View style={{ flex: 1, width: widthDevice * 0.5757 }}>
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
              paddingLeft: widthDevice * 0.02345,
              paddingTop: 24,
              paddingBottom: insets.bottom,
              paddingRight: widthDevice * 0.006,
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
      </View>

      {/* Printer Settings Modal */}
      <PrinterSettingsModal
        visible={printerModalVisible}
        onClose={() => setPrinterModalVisible(false)}
        initialPrinterType={printerType}
        onSettingsSaved={handlePrinterSettingsSaved}
      />
    </SafeAreaView>
  );
};

export default Home;
