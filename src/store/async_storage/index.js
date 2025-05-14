import AsyncStorage from '@react-native-async-storage/async-storage';

const setExtraProducts = async listProduct => {
  try {
    await AsyncStorage.setItem('extraProduct', JSON.stringify(listProduct));
  } catch (error) {
    console.log(error);
  }
};
const getExtraProducts = async () => {
  try {
    const value = await AsyncStorage.getItem('extraProduct');
    if (value) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};
const setLastOrder = async lastOrder => {
  console.log('set last order local: ', lastOrder);
  try {
    await AsyncStorage.setItem('theLastOrder', JSON.stringify(lastOrder));
  } catch (error) {
    console.log(error);
  }
};
const getLastOrder = async () => {
  try {
    const value = await AsyncStorage.getItem('theLastOrder');
    if (value) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const setPrinterInfo = async printerInfo => {
  try {
    await AsyncStorage.setItem('printerInfo', JSON.stringify(printerInfo));
  } catch (e) {
    console.log(e);
  }
};

const getPrinterInfo = async () => {
  try {
    const value = await AsyncStorage.getItem('printerInfo');
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

const setUser = async user => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    console.log(e);
  }
};

const getUser = async () => {
  try {
    const value = await AsyncStorage.getItem('user');
    if (value !== null) {
      // console.log(value);
      return JSON.parse(value);
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

const setSkipForceUpdate = async skip => {
  try {
    await AsyncStorage.setItem('skipForceUpdate', skip);
  } catch (e) {
    console.log(e);
  }
};

const getSkipForceUpdate = async () => {
  try {
    const value = await AsyncStorage.getItem('skipForceUpdate');
    if (value == 'true') {
      return 'true';
    } else {
      console.log('SKIP_FORCE_UPDTE:', value);
      return 'false';
    }
  } catch (e) {
    console.log(e);
  }
};

const setTheFirstLogin = async theFirst => {
  console.log('SETTTTTTTTTTTTT:', theFirst);
  try {
    await AsyncStorage.setItem('theFirstLogin', theFirst);
  } catch (e) {
    console.log(e);
  }
};

const getTheFirstLogin = async () => {
  try {
    const value = await AsyncStorage.getItem('theFirstLogin');
    if (value === 'false') {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};

const clearStorage = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (e) {
    console.log(e);
  }
};

const getListRecommned = async () => {
  try {
    const value = await AsyncStorage.getItem('recommendedProducts');
    if (value) {
      return JSON.parse(value);
    } else {
      return {
        list1: [],
        list2: [],
        created_at: '',
        index_recommend: 0,
      };
    }
  } catch (error) {
    return {
      list1: [],
      list2: [],
      created_at: new Date().toString(),
      index_recommend: 0,
    };
  }
};
const setListRecommned = async listProduct => {
  try {
    await AsyncStorage.setItem(
      'recommendedProducts',
      JSON.stringify(listProduct),
    );
  } catch (error) {
    console.log(error);
  }
};

const setPrintedLabels = async (orderId) => {
  try {
    const existingLabels = await AsyncStorage.getItem('printedLabels');
    const printedLabels = existingLabels ? JSON.parse(existingLabels) : [];
    if (!printedLabels.includes(orderId)) {
      printedLabels.push(orderId);
      await AsyncStorage.setItem('printedLabels', JSON.stringify(printedLabels));
    }
  } catch (error) {
    console.log(error);
  }
};

const getPrintedLabels = async () => {
  try {
    const printedLabels = await AsyncStorage.getItem('printedLabels');
    return printedLabels ? JSON.parse(printedLabels) : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const setSelectedStore = async (store) => {
  try {
    await AsyncStorage.setItem('selectedStore', JSON.stringify(store));
  } catch (error) {
    console.log('Error saving selected store:', error);
  }
};

const getSelectedStore = async () => {
  try {
    const value = await AsyncStorage.getItem('selectedStore');
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.log('Error getting selected store:', error);
  }
  return null;
};

export default {
  setListRecommned,
  getListRecommned,
  setLastOrder,
  getLastOrder,
  getExtraProducts,
  setExtraProducts,
  setUser,
  getUser,
  setSkipForceUpdate,
  getSkipForceUpdate,
  setTheFirstLogin,
  getTheFirstLogin,
  clearStorage,
  setPrinterInfo,
  getPrinterInfo,
  setPrintedLabels,
  getPrintedLabels,
  setSelectedStore,
  getSelectedStore,
};
