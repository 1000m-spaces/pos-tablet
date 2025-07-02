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



const setPendingOrders = async (orders) => {
  try {
    await AsyncStorage.setItem('pendingOrders', JSON.stringify(orders));
  } catch (error) {
    console.log('Error saving pending orders:', error);
  }
};

const getPendingOrders = async () => {
  try {
    const value = await AsyncStorage.getItem('pendingOrders');
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.log('Error getting pending orders:', error);
  }
  return [];
};

const addPendingOrder = async (order) => {
  try {
    const existingOrders = await getPendingOrders();
    const updatedOrders = [...existingOrders, order];
    await setPendingOrders(updatedOrders);
    return updatedOrders;
  } catch (error) {
    console.log('Error adding pending order:', error);
    return [];
  }
};

const removePendingOrder = async (orderId) => {
  try {
    const existingOrders = await getPendingOrders();
    const updatedOrders = existingOrders.filter(order => order.session !== orderId);
    await setPendingOrders(updatedOrders);
    return updatedOrders;
  } catch (error) {
    console.log('Error removing pending order:', error);
    return [];
  }
};

// Order Status Management
const updateOrderStatus = async (orderId, status) => {
  try {
    const existingOrders = await getPendingOrders();
    const updatedOrders = existingOrders.map(order => {
      if (order.session === orderId) {
        return { ...order, orderStatus: status, updated_at: new Date().toISOString() };
      }
      return order;
    });
    await setPendingOrders(updatedOrders);

    // Handle table blocking/unblocking
    if (status === 'WaitingForServe') {
      const order = existingOrders.find(o => o.session === orderId);
      if (order && order.tableId) {
        await blockTable(order.tableId, orderId);
      }
    } else if (status === 'Completed') {
      const order = existingOrders.find(o => o.session === orderId);
      if (order && order.tableId) {
        await releaseTable(order.tableId);
      }
    }

    return updatedOrders;
  } catch (error) {
    console.log('Error updating order status:', error);
    return [];
  }
};

const getOrdersByStatus = async (status) => {
  try {
    const orders = await getPendingOrders();
    return orders.filter(order => order.orderStatus === status);
  } catch (error) {
    console.log('Error getting orders by status:', error);
    return [];
  }
};

// Table Blocking Management
const setBlockedTables = async (blockedTables) => {
  try {
    await AsyncStorage.setItem('blockedTables', JSON.stringify(blockedTables));
  } catch (error) {
    console.log('Error saving blocked tables:', error);
  }
};

const getBlockedTables = async () => {
  try {
    const value = await AsyncStorage.getItem('blockedTables');
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.log('Error getting blocked tables:', error);
  }
  return {};
};

const blockTable = async (tableId, orderId) => {
  try {
    const blockedTables = await getBlockedTables();
    blockedTables[tableId] = {
      orderId,
      blockedAt: new Date().toISOString(),
      status: 'occupied'
    };
    await setBlockedTables(blockedTables);
    return blockedTables;
  } catch (error) {
    console.log('Error blocking table:', error);
    return {};
  }
};

const releaseTable = async (tableId) => {
  try {
    const blockedTables = await getBlockedTables();
    delete blockedTables[tableId];
    await setBlockedTables(blockedTables);
    return blockedTables;
  } catch (error) {
    console.log('Error releasing table:', error);
    return {};
  }
};

const isTableBlocked = async (tableId) => {
  try {
    const blockedTables = await getBlockedTables();
    return blockedTables.hasOwnProperty(tableId);
  } catch (error) {
    console.log('Error checking table status:', error);
    return false;
  }
};

const getTableStatus = async (tableId) => {
  try {
    const blockedTables = await getBlockedTables();
    return blockedTables[tableId] || null;
  } catch (error) {
    console.log('Error getting table status:', error);
    return null;
  }
};

// Helper functions for specific printer settings
const getLabelPrinterInfo = async () => {
  try {
    const printerInfo = await getPrinterInfo();
    if (printerInfo) {
      return {
        IP: printerInfo.IP || "",
        sWidth: printerInfo.sWidth || 50,
        sHeight: printerInfo.sHeight || 30,
        autoPrint: printerInfo.autoPrint || false
      };
    }
  } catch (error) {
    console.log('Error getting label printer info:', error);
  }
  return {
    IP: "",
    sWidth: 50,
    sHeight: 30,
    autoPrint: false
  };
};

const getBillPrinterInfo = async () => {
  try {
    const printerInfo = await getPrinterInfo();
    if (printerInfo) {
      return {
        billIP: printerInfo.billIP || "",
        billPort: printerInfo.billPort || 9100,
        billPaperSize: printerInfo.billPaperSize || '80mm'
      };
    }
  } catch (error) {
    console.log('Error getting bill printer info:', error);
  }
  return {
    billIP: "",
    billPort: 9100,
    billPaperSize: '80mm'
  };
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
  getLabelPrinterInfo,
  getBillPrinterInfo,
  setPrintedLabels,
  getPrintedLabels,
  setPendingOrders,
  getPendingOrders,
  addPendingOrder,
  removePendingOrder,
  updateOrderStatus,
  getOrdersByStatus,
  setBlockedTables,
  getBlockedTables,
  blockTable,
  releaseTable,
  isTableBlocked,
  getTableStatus,
};
