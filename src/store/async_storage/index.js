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

// Helper function to get current date string in YYYY-MM-DD format
const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const setPrintedLabels = async (orderId, dateString = null) => {
  try {
    if (!orderId) {
      console.warn('setPrintedLabels called with empty orderId');
      return;
    }

    const date = dateString || getCurrentDateString();
    const existingData = await AsyncStorage.getItem('printedLabels');
    const printedLabels = existingData ? JSON.parse(existingData) : {};

    // Initialize array for this date if it doesn't exist
    if (!printedLabels[date]) {
      printedLabels[date] = [];
    }

    // Add orderId if not already present for this date
    if (!printedLabels[date].includes(orderId)) {
      printedLabels[date].push(orderId);
      await AsyncStorage.setItem('printedLabels', JSON.stringify(printedLabels));
      console.log(`Marked labels as printed for order: ${orderId} on ${date}`);
    } else {
      console.log(`Labels already marked as printed for order: ${orderId} on ${date}`);
    }
  } catch (error) {
    console.error('Error setting printed labels:', error);
  }
};

const getPrintedLabels = async (dateString = null) => {
  try {
    const date = dateString || getCurrentDateString();
    const existingData = await AsyncStorage.getItem('printedLabels');
    const printedLabels = existingData ? JSON.parse(existingData) : {};
    return printedLabels[date] || [];
  } catch (error) {
    console.error('Error getting printed labels:', error);
    return [];
  }
};

const clearPrintedLabels = async (dateString = null) => {
  try {
    if (dateString) {
      // Clear labels for specific date
      const existingData = await AsyncStorage.getItem('printedLabels');
      const printedLabels = existingData ? JSON.parse(existingData) : {};
      delete printedLabels[dateString];
      await AsyncStorage.setItem('printedLabels', JSON.stringify(printedLabels));
      console.log(`Cleared printed labels for date: ${dateString}`);
    } else {
      // Clear current date's labels
      const date = getCurrentDateString();
      const existingData = await AsyncStorage.getItem('printedLabels');
      const printedLabels = existingData ? JSON.parse(existingData) : {};
      delete printedLabels[date];
      await AsyncStorage.setItem('printedLabels', JSON.stringify(printedLabels));
      console.log(`Cleared printed labels for current date: ${date}`);
    }
  } catch (error) {
    console.error('Error clearing printed labels:', error);
  }
};

const removePrintedLabel = async (orderId, dateString = null) => {
  try {
    if (!orderId) {
      console.warn('removePrintedLabel called with empty orderId');
      return;
    }

    const date = dateString || getCurrentDateString();
    const existingData = await AsyncStorage.getItem('printedLabels');
    const printedLabels = existingData ? JSON.parse(existingData) : {};

    if (printedLabels[date]) {
      const filteredLabels = printedLabels[date].filter(id => id !== orderId);
      if (filteredLabels.length !== printedLabels[date].length) {
        printedLabels[date] = filteredLabels;
        await AsyncStorage.setItem('printedLabels', JSON.stringify(printedLabels));
        console.log(`Removed printed label status for order: ${orderId} on ${date}`);
      }
    }
  } catch (error) {
    console.error('Error removing printed label:', error);
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
        autoPrint: printerInfo.autoPrint || false,
        connectionType: printerInfo.connectionType || 'network',
        usbDevice: printerInfo.usbDevice || '',
        serialPort: printerInfo.serialPort || '',
        // Label font sizes
        labelStoreName: printerInfo.labelStoreName || 15,
        labelOrderNumber: printerInfo.labelOrderNumber || 15,
        labelItemName: printerInfo.labelItemName || 15,
        labelModifier: printerInfo.labelModifier || 14,
        labelNote: printerInfo.labelNote || 14,
        // Label printer DPI
        labelPrinterDPI: printerInfo.labelPrinterDPI || 72
      };
    }
  } catch (error) {
    console.log('Error getting label printer info:', error);
  }
  return {
    IP: "",
    sWidth: 50,
    sHeight: 30,
    autoPrint: false,
    connectionType: 'network',
    usbDevice: '',
    serialPort: '',
    // Label font sizes
    labelStoreName: 15,
    labelOrderNumber: 15,
    labelItemName: 15,
    labelModifier: 14,
    labelNote: 14,
    // Label printer DPI
    labelPrinterDPI: 72
  };
};

const getBillPrinterInfo = async () => {
  try {
    const printerInfo = await getPrinterInfo();
    if (printerInfo) {
      return {
        billIP: printerInfo.billIP || "",
        billPort: printerInfo.billPort || 9100,
        billPaperSize: printerInfo.billPaperSize || '80mm',
        billConnectionType: printerInfo.billConnectionType || 'network',
        billUsbDevice: printerInfo.billUsbDevice || '',
        billSerialPort: printerInfo.billSerialPort || '',
        // Bill font sizes
        billHeader: printerInfo.billHeader || 24,
        billContent: printerInfo.billContent || 16,
        billTotal: printerInfo.billTotal || 18
      };
    }
  } catch (error) {
    console.log('Error getting bill printer info:', error);
  }
  return {
    billIP: "",
    billPort: 9100,
    billPaperSize: '80mm',
    billConnectionType: 'network',
    billUsbDevice: '',
    billSerialPort: '',
    // Bill font sizes
    billHeader: 24,
    billContent: 16,
    billTotal: 18
  };
};

// Offline Order Counter Management
const setOfflineOrderCounter = async (counterData) => {
  try {
    await AsyncStorage.setItem('offlineOrderCounter', JSON.stringify(counterData));
  } catch (error) {
    console.error('Error setting offline order counter:', error);
  }
};

const getOfflineOrderCounter = async () => {
  try {
    const value = await AsyncStorage.getItem('offlineOrderCounter');
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error('Error getting offline order counter:', error);
  }
  return null;
};

// Print Records Management for Print Queue
const setPrintRecords = async (printRecords) => {
  try {
    await AsyncStorage.setItem('printRecords', JSON.stringify(printRecords));
  } catch (error) {
    console.error('Error setting print records:', error);
  }
};

const getPrintRecords = async () => {
  try {
    const value = await AsyncStorage.getItem('printRecords');
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error('Error getting print records:', error);
  }
  return [];
};

// Failed Print Tasks Management
const setFailedPrintTasks = async (failedTasks) => {
  try {
    await AsyncStorage.setItem('failedPrintTasks', JSON.stringify(failedTasks));
  } catch (error) {
    console.error('Error setting failed print tasks:', error);
  }
};

const getFailedPrintTasks = async () => {
  try {
    const value = await AsyncStorage.getItem('failedPrintTasks');
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error('Error getting failed print tasks:', error);
  }
  return [];
};

// Offline Cache Management for Static Data
const setCachedMenu = async (menuData) => {
  try {
    const cacheData = {
      data: menuData,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem('cachedMenu', JSON.stringify(cacheData));
    console.log('Menu data cached successfully');
  } catch (error) {
    console.error('Error caching menu data:', error);
  }
};

const getCachedMenu = async () => {
  try {
    const value = await AsyncStorage.getItem('cachedMenu');
    if (value !== null) {
      const cacheData = JSON.parse(value);
      console.log('Retrieved cached menu data from:', cacheData.timestamp);
      return cacheData.data;
    }
  } catch (error) {
    console.error('Error getting cached menu data:', error);
  }
  return null;
};

const setCachedShopTables = async (tablesData) => {
  try {
    const cacheData = {
      data: tablesData,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem('cachedShopTables', JSON.stringify(cacheData));
    console.log('Shop tables data cached successfully');
  } catch (error) {
    console.error('Error caching shop tables data:', error);
  }
};

const getCachedShopTables = async () => {
  try {
    const value = await AsyncStorage.getItem('cachedShopTables');
    if (value !== null) {
      const cacheData = JSON.parse(value);
      console.log('Retrieved cached shop tables data from:', cacheData.timestamp);
      return cacheData.data;
    }
  } catch (error) {
    console.error('Error getting cached shop tables data:', error);
  }
  return null;
};

const setCachedPaymentChannels = async (paymentData) => {
  try {
    const cacheData = {
      data: paymentData,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem('cachedPaymentChannels', JSON.stringify(cacheData));
    console.log('Payment channels data cached successfully');
  } catch (error) {
    console.error('Error caching payment channels data:', error);
  }
};

const getCachedPaymentChannels = async () => {
  try {
    const value = await AsyncStorage.getItem('cachedPaymentChannels');
    if (value !== null) {
      const cacheData = JSON.parse(value);
      console.log('Retrieved cached payment channels data from:', cacheData.timestamp);
      return cacheData.data;
    }
  } catch (error) {
    console.error('Error getting cached payment channels data:', error);
  }
  return null;
};

const setCachedOrderChannels = async (orderChannelsData) => {
  try {
    const cacheData = {
      data: orderChannelsData,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem('cachedOrderChannels', JSON.stringify(cacheData));
    console.log('Order channels data cached successfully');
  } catch (error) {
    console.error('Error caching order channels data:', error);
  }
};

const getCachedOrderChannels = async () => {
  try {
    const value = await AsyncStorage.getItem('cachedOrderChannels');
    if (value !== null) {
      const cacheData = JSON.parse(value);
      console.log('Retrieved cached order channels data from:', cacheData.timestamp);
      return cacheData.data;
    }
  } catch (error) {
    console.error('Error getting cached order channels data:', error);
  }
  return null;
};

// Order Backup Management (Hidden from users, for emergency recovery)
const setBackupOrders = async (orders) => {
  try {
    const backupData = {
      orders: orders,
      timestamp: new Date().toISOString(),
      count: orders.length,
    };
    await AsyncStorage.setItem('backupOrders', JSON.stringify(backupData));
    console.log(`Backed up ${orders.length} orders at ${backupData.timestamp}`);
  } catch (error) {
    console.error('Error setting backup orders:', error);
  }
};

const getBackupOrders = async () => {
  try {
    const value = await AsyncStorage.getItem('backupOrders');
    if (value !== null) {
      const backupData = JSON.parse(value);
      console.log(`Retrieved ${backupData.count} backup orders from ${backupData.timestamp}`);
      return backupData.orders || [];
    }
  } catch (error) {
    console.error('Error getting backup orders:', error);
  }
  return [];
};

const addToBackupOrders = async (order) => {
  try {
    const existingBackups = await getBackupOrders();
    // Check if order already exists in backup (by session ID)
    const orderExists = existingBackups.some(o => o.session === order.session);

    if (!orderExists) {
      const updatedBackups = [...existingBackups, {
        ...order,
        backup_at: new Date().toISOString(),
      }];
      await setBackupOrders(updatedBackups);
      console.log(`Added order ${order.session} to backup`);
    } else {
      console.log(`Order ${order.session} already in backup`);
    }
  } catch (error) {
    console.error('Error adding to backup orders:', error);
  }
};

const clearBackupOrders = async () => {
  try {
    await AsyncStorage.removeItem('backupOrders');
    console.log('Cleared all backup orders');
  } catch (error) {
    console.error('Error clearing backup orders:', error);
  }
};

const getBackupOrdersMetadata = async () => {
  try {
    const value = await AsyncStorage.getItem('backupOrders');
    if (value !== null) {
      const backupData = JSON.parse(value);
      return {
        count: backupData.count || 0,
        timestamp: backupData.timestamp,
        lastBackup: backupData.timestamp,
      };
    }
  } catch (error) {
    console.error('Error getting backup metadata:', error);
  }
  return {
    count: 0,
    timestamp: null,
    lastBackup: null,
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
  clearPrintedLabels,
  removePrintedLabel,
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
  setOfflineOrderCounter,
  getOfflineOrderCounter,
  setPrintRecords,
  getPrintRecords,
  setFailedPrintTasks,
  getFailedPrintTasks,
  // Offline cache functions
  setCachedMenu,
  getCachedMenu,
  setCachedShopTables,
  getCachedShopTables,
  setCachedPaymentChannels,
  getCachedPaymentChannels,
  setCachedOrderChannels,
  getCachedOrderChannels,
  // Backup order functions
  setBackupOrders,
  getBackupOrders,
  addToBackupOrders,
  clearBackupOrders,
  getBackupOrdersMetadata,
};
