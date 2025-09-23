import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from 'store/index';
import { View, StyleSheet, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';
import PrintTemplate from '../components/Order/TemTemplate';
import BillTemplate from '../components/Order/BillTemplate';
import printQueueService from '../services/PrintQueueService';
import AsyncStorage from '../store/async_storage';

// Helper functions for printing dimensions
const mmToPixels = (mm, dpi = 72) => {
  const LABEL_PRINTER_DPI = dpi;
  const pixelValue = Math.round((mm * LABEL_PRINTER_DPI) / 25.4);
  return pixelValue;
};

// Hidden ViewShot Components - Must be inside Redux Provider
const HiddenViewShotComponents = () => {
  const [printingOrder, setPrintingOrder] = useState(null);
  const [printerInfo, setPrinterInfo] = useState(null);
  const [isComponentReady, setIsComponentReady] = useState(false);

  const viewTemShotRef = useRef(null);
  const viewBillShotRef = useRef(null);

  // Helper function to transform order for label printing
  const transformOrderForLabel = (originalOrder, productIndex = 0, labelIndex = 0, totalLabels = 1) => {
    const product = originalOrder.products?.[productIndex];
    if (!product) return originalOrder;

    return {
      ...originalOrder,
      // Basic order identification
      displayID: originalOrder.session,
      bill_id: originalOrder.session,
      session: originalOrder.session,

      // Service and location information
      serviceType: 'offline',
      tableName: originalOrder.shopTableName,
      table: originalOrder.shopTableName,
      shopTableName: originalOrder.shopTableName,
      shopTableid: originalOrder.shopTableid || "0",

      // Timing information
      date: originalOrder.created_at || originalOrder.timestamp || new Date().toISOString(),
      created_at: originalOrder.created_at || originalOrder.timestamp || new Date().toISOString(),
      timestamp: originalOrder.created_at || originalOrder.timestamp || new Date().toISOString(),

      // Order notes and metadata
      note: originalOrder.orderNote || originalOrder.note || '',
      orderNote: originalOrder.orderNote || originalOrder.note || '',

      // Shop and user information
      shopid: originalOrder.shopid || "246",
      userid: originalOrder.userid || "1752",
      roleid: originalOrder.roleid || "4",

      // Payment and pricing information
      subPrice: originalOrder.subPrice || originalOrder.total_amount || 0,
      total_amount: originalOrder.total_amount || 0,
      orderValue: originalOrder.total_amount || 0,
      transType: originalOrder.transType || "41",
      chanel_type_id: originalOrder.chanel_type_id || "1",

      // Channel information (for delivery apps)
      chanel_name: originalOrder.chanel_name || 'POS',
      foodapp_order_id: originalOrder.foodapp_order_id || '',
      package_id: originalOrder.package_id || 0,

      // Status information
      status: originalOrder.status || "pending",
      orderStatus: originalOrder.orderStatus || "Paymented",
      syncStatus: originalOrder.syncStatus || "pending",

      // Enhanced item information structure
      itemInfo: {
        items: [{
          name: product.name,
          item_name: product.name,
          quantity: 1, // Each label represents 1 item
          amount: 1,
          fare: {
            priceDisplay: product.price ? product.price.toLocaleString('vi-VN') : '0',
            currencySymbol: '₫',
            price: product.price || 0
          },
          price: product.price || 0,
          comment: product.note || '',
          note_prod: product.note || '',
          product_id: product.product_id || product.id,

          // Enhanced modifier information
          modifierGroups: product.extras ? product.extras.map(extra => ({
            modifierGroupName: extra.group_extra_name || 'Extras',
            groupName: extra.group_extra_name || 'Extras',
            modifiers: [{
              modifierName: extra.name,
              name: extra.name,
              price: extra.price || 0,
              priceDisplay: extra.price ? extra.price.toLocaleString('vi-VN') : '0'
            }]
          })) : [],

          // Flattened modifier strings for easier template access
          stringName: product.extras ? product.extras.map(extra => extra.name).join(' / ') : '',
          option: product.extras ? product.extras.filter(extra => extra.type === 'option').map(extra => extra.name).join(' / ') : '',
          extrastring: product.extras ? product.extras.filter(extra => extra.type !== 'option').map(extra => extra.name).join(' / ') : '',
        }],
        itemIdx: labelIndex + 1, // Use 1-based indexing for display
        totalItems: totalLabels,
      },

      // Direct decals format for immediate template compatibility
      decals: [{
        item_name: product.name,
        amount: 1,
        note_prod: product.note || '',
        stringName: product.extras ? product.extras.map(extra => extra.name).join(' / ') : '',
        option: product.extras ? product.extras.filter(extra => extra.type === 'option').map(extra => extra.name).join(' / ') : '',
        extrastring: product.extras ? product.extras.filter(extra => extra.type !== 'option').map(extra => extra.name).join(' / ') : '',
        itemIdx: labelIndex + 1, // Use 1-based indexing for display
        totalItems: totalLabels,
        price: product.price || 0,
        priceDisplay: product.price ? product.price.toLocaleString('vi-VN') : '0₫',
        product_id: product.product_id || product.id,
      }],

      // Customer and service information
      customerInfo: {
        name: originalOrder.shopTableName || 'Khách hàng',
        table: originalOrder.shopTableName,
        phone: originalOrder.customerPhone || '',
        address: originalOrder.customerAddress || '',
      },

      // Additional metadata for comprehensive printing
      products: originalOrder.products, // Keep full product array for reference
      offline_code: originalOrder.offline_code || originalOrder.session,
      offlineOrderId: originalOrder.offlineOrderId || originalOrder.session,

      // Fees and discounts
      svFee: originalOrder.svFee || "0",
      svFee_amount: originalOrder.svFee_amount || 0,
      phuthu: originalOrder.phuthu || 0,
      fix_discount: originalOrder.fix_discount || 0,
      perDiscount: originalOrder.perDiscount || 0,

      // Print tracking
      printStatus: originalOrder.printStatus || "not_printed",
      currentItemIndex: labelIndex + 1,
      isPartialPrint: true, // Indicates this is one item from a multi-item order
    };
  };

  // Helper function to transform order for bill printing
  const transformOrderForBill = (originalOrder) => {
    return {
      ...originalOrder,
      displayID: originalOrder.session,
      orderValue: originalOrder.total_amount,
      itemInfo: {
        items: originalOrder.products ? originalOrder.products.map(product => ({
          name: product.name,
          quantity: product.quanlity || 1,
          fare: {
            priceDisplay: product.price ? product.price.toLocaleString('vi-VN') : '0',
            currencySymbol: '₫'
          },
          comment: product.note || '',
          modifierGroups: product.extras ? product.extras.map(extra => ({
            modifierGroupName: extra.group_extra_name || 'Extras',
            modifiers: [{
              modifierName: extra.name,
              price: extra.price || 0
            }]
          })) : [],
        })) : []
      },
      customerInfo: {
        name: originalOrder.shopTableName || 'Khách hàng',
      },
      serviceType: 'offline',
      tableName: originalOrder.shopTableName,
    };
  };

  // Capture snapshot function for print queue service
  const handleCaptureSnapshot = async (type, order, options = {}) => {
    try {
      console.log(`RootNav: Capturing ${type} snapshot for order:`, order?.session || order?.offlineOrderId);

      // Transform the order based on print type
      let transformedOrder;

      if (type === 'label') {
        // For label printing, use the enhanced transformation
        const { productIndex = 0, labelIndex = 0, totalLabels = 1 } = options;
        transformedOrder = transformOrderForLabel(order, productIndex, labelIndex, totalLabels);
        console.log(`RootNav: Transformed order for label printing (product ${productIndex + 1}, label ${labelIndex + 1}/${totalLabels})`);
      } else if (type === 'bill') {
        // For bill printing, use the simpler transformation
        transformedOrder = transformOrderForBill(order);
        console.log(`RootNav: Transformed order for bill printing`);
      } else {
        throw new Error(`Unknown snapshot type: ${type}`);
      }

      // Set the transformed printing order to render in ViewShot components
      setPrintingOrder(transformedOrder);
      setIsComponentReady(false);

      // Wait for component to render with new order data - increased delay for reliability
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mark component as ready for capture
      setIsComponentReady(true);

      // Additional wait to ensure component state is stable
      await new Promise(resolve => setTimeout(resolve, 500));

      // Additional check to ensure refs are available
      let viewShotRef;
      let maxRetries = 5;
      let retryCount = 0;

      if (type === 'label') {
        viewShotRef = viewTemShotRef;
      } else if (type === 'bill') {
        viewShotRef = viewBillShotRef;
      }

      // Wait for ref to be available with retries
      while ((!viewShotRef.current || !viewShotRef.current.capture) && retryCount < maxRetries) {
        console.log(`RootNav: Waiting for ${type} ViewShot ref to be available, attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
      }

      if (!viewShotRef.current) {
        throw new Error(`${type} ViewShot ref not available after ${maxRetries} retries`);
      }

      if (!viewShotRef.current.capture) {
        throw new Error(`${type} ViewShot capture method not available`);
      }

      // Capture the snapshot
      console.log(`RootNav: Attempting to capture ${type} snapshot...`);
      const capturedData = await viewShotRef.current.capture();

      if (!capturedData) {
        throw new Error(`Failed to capture ${type} snapshot - no data returned`);
      }

      console.log(`RootNav: ${type} snapshot captured successfully:`, typeof capturedData === 'string' ? `${capturedData.substring(0, 50)}...` : 'Data available');
      return capturedData;

    } catch (error) {
      console.error(`RootNav: Error capturing ${type} snapshot:`, error);
      // Reset printing order on error to prevent stale state
      setPrintingOrder(null);
      throw new Error(`Failed to capture view snapshot: ${error.message}`);
    }
  };

  // Initialize print queue service
  useEffect(() => {
    const initializePrintQueue = async () => {
      try {
        // Load printer info
        const info = await AsyncStorage.getLabelPrinterInfo();
        setPrinterInfo(info);

        // Set capture callback for print queue service
        console.log('RootNav: Setting capture callback to print queue service');
        printQueueService.setCaptureCallback(handleCaptureSnapshot);

        // Mark component as ready
        setIsComponentReady(true);

      } catch (error) {
        console.error('RootNav: Error initializing print queue:', error);
      }
    };

    initializePrintQueue();
  }, []);

  // Queue multiple labels for orders with multiple products and quantities
  const queueMultipleLabels = async (order, printerInfo) => {
    try {
      console.log('RootNav: Starting queueMultipleLabels for order:', order?.session || order?.offlineOrderId);

      if (!order || !order.products) {
        throw new Error('Order or products not available');
      }

      // Calculate total number of labels to be printed
      let totalLabels = 0;
      order.products.forEach(product => {
        totalLabels += (product.quanlity || 1);
      });

      console.log(`RootNav: Total labels to print: ${totalLabels}`);

      let currentLabelIndex = 0;
      const printTaskIds = [];

      // Create print tasks for each product and each quantity
      for (let productIndex = 0; productIndex < order.products.length; productIndex++) {
        const product = order.products[productIndex];
        const quantity = product.quanlity || 1;

        // Create one print task for each quantity of the product
        for (let quantityIndex = 0; quantityIndex < quantity; quantityIndex++) {
          const taskId = printQueueService.addPrintTask({
            type: 'label',
            order: order,
            printerInfo: printerInfo,
            // Metadata for tracking individual labels
            metadata: {
              productIndex: productIndex,
              labelIndex: currentLabelIndex,
              totalLabels: totalLabels,
              productQuantityIndex: quantityIndex,
              productQuantityTotal: quantity,
              productName: product.name,
              isMultiLabel: true
            }
          });

          printTaskIds.push(taskId);
          console.log(`RootNav: Queued label task ${taskId} - Product: "${product.name}" (${productIndex + 1}/${order.products.length}), Label: ${currentLabelIndex + 1}/${totalLabels}, Qty: ${quantityIndex + 1}/${quantity}`);

          currentLabelIndex++;
        }
      }

      console.log(`RootNav: Successfully queued ${printTaskIds.length} label printing tasks`);
      return printTaskIds;

    } catch (error) {
      console.error('RootNav: Error in queueMultipleLabels:', error);
      throw error;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setPrintingOrder(null);
      setIsComponentReady(false);
    };
  }, []);

  // Expose functions globally for use by other components
  useEffect(() => {
    global.queueMultipleLabels = queueMultipleLabels;
    return () => {
      delete global.queueMultipleLabels;
    };
  }, []);

  return (
    <View style={styles.hiddenPrintComponents} collapsable={false}>
      <ViewShot
        ref={viewTemShotRef}
        options={{
          format: "jpg",
          quality: 1.0,
          result: 'tmpfile'
        }}
        style={[
          styles.hiddenViewShot,
          {
            width: printerInfo ? mmToPixels(Number(printerInfo.sWidth) - 2, printerInfo.labelPrinterDPI) : mmToPixels(50 - 2),
            minHeight: printerInfo ? mmToPixels(Number(printerInfo.sHeight) - 2, printerInfo.labelPrinterDPI) : mmToPixels(30 - 2),
          }
        ]}
        collapsable={false}
      >
        {printingOrder && isComponentReady && <PrintTemplate orderPrint={printingOrder} />}
      </ViewShot>

      <ViewShot
        ref={viewBillShotRef}
        options={{
          format: 'jpg',
          quality: 1.0,
          result: 'base64'
        }}
        style={[
          styles.hiddenViewShot,
          {
            width: 400,
            minHeight: 200,
          }
        ]}
        collapsable={false}
      >
        {printingOrder && isComponentReady && <BillTemplate selectedOrder={printingOrder} />}
      </ViewShot>
    </View>
  );
};

const RootNavigation = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
        {/* Hidden ViewShot components inside Redux Provider */}
        <HiddenViewShotComponents />
      </SafeAreaProvider>
    </Provider>
  );
};

export default RootNavigation;

const styles = StyleSheet.create({
  // Hidden print components styles
  hiddenPrintComponents: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
    zIndex: -1,
    pointerEvents: 'none',
  },
  hiddenViewShot: {
    backgroundColor: 'white',
    opacity: 0,
    zIndex: -1,
    pointerEvents: 'none',
  },
});
