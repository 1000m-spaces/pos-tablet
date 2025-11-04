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
  const [printingOrderLabel, setPrintingOrderLabel] = useState(null);
  const [printingOrderBill, setPrintingOrderBill] = useState(null);
  const [printerInfo, setPrinterInfo] = useState(null);
  const [isComponentReady, setIsComponentReady] = useState(false);

  const viewTemShotRef = useRef(null);
  const viewBillShotRef = useRef(null);

  // Helper function to transform order for label printing
  const transformOrderForLabel = (originalOrder, productIndex = 0, labelIndex = 0, totalLabels = 1) => {
    console.log(`RootNav: transformOrderForLabel called with productIndex=${productIndex}, labelIndex=${labelIndex}, totalLabels=${totalLabels}`);

    // Detect order type based on structure
    const isOnlineOrder = originalOrder.source === 'app_order' || originalOrder.source === 'online_new';
    const isOfflineOrder = originalOrder.products && Array.isArray(originalOrder.products);

    console.log('RootNav: originalOrder data:', {
      ...originalOrder,
      isOnlineOrder,
      isOfflineOrder,
    });

    // Get product from appropriate structure
    let product;
    if (isOfflineOrder) {
      product = originalOrder.products?.[productIndex];
    } else if (isOnlineOrder && originalOrder.itemInfo?.items) {
      product = originalOrder.itemInfo.items[productIndex];
    }

    if (!product) {
      console.log(`RootNav: No product found at index ${productIndex}`);
      return originalOrder;
    }

    console.log(`RootNav: Processing product:`, product.name || product.prodname, 'for label', labelIndex + 1, 'of', totalLabels);

    // Extract product details based on order type
    let productName, productPrice, productComment, productModifiers, productId;

    if (isOfflineOrder) {
      // Offline order structure
      productName = product.name;
      productPrice = product.price || 0;
      productComment = product.note || '';
      productId = product.product_id || product.id;
      // Extract modifiers from extras
      productModifiers = product.extras ? product.extras.map(extra => ({
        modifierGroupName: extra.group_extra_name || 'Extras',
        groupName: extra.group_extra_name || 'Extras',
        modifiers: [{
          modifierName: extra.name,
          name: extra.name,
          price: extra.price || 0,
          priceDisplay: extra.price ? extra.price.toLocaleString('vi-VN') : '0'
        }]
      })) : [];
    } else {
      // Online order structure
      productName = product.prodname || product.name;
      // Parse price from fare object or use priceDisplay
      const priceFromFare = product.fare?.priceDisplay ?
        parseInt(product.fare.priceDisplay.replace(/[^0-9]/g, '')) : 0;
      productPrice = product.price || priceFromFare || 0;
      productComment = product.comment || '';
      productId = product.prod_id || product.product_id || product.id;
      // Use existing modifierGroups
      productModifiers = product.modifierGroups || [];
    }

    // Build modifier strings for template
    let modifierStrings = {
      stringName: '',
      option: '',
      extrastring: ''
    };

    if (isOfflineOrder && product.extras) {
      modifierStrings.stringName = product.extras.map(extra => extra.name).join(' / ');
      modifierStrings.option = product.extras.filter(extra => extra.type === 'option').map(extra => extra.name).join(' / ');
      modifierStrings.extrastring = product.extras.filter(extra => extra.type !== 'option').map(extra => extra.name).join(' / ');
    } else if (isOnlineOrder && productModifiers.length > 0) {
      // Build strings from modifierGroups
      const modifierNames = [];
      productModifiers.forEach(group => {
        group.modifiers?.forEach(mod => {
          modifierNames.push(mod.modifierName || mod.name);
        });
      });
      modifierStrings.stringName = modifierNames.join(' / ');
      modifierStrings.extrastring = modifierNames.join(' / ');
    }

    const transformedOrder = {
      ...originalOrder,
      // Basic order identification
      displayID: originalOrder.displayID || originalOrder.session,
      bill_id: originalOrder.session || originalOrder.displayID,
      session: originalOrder.session || originalOrder.displayID,

      // Service and location information
      serviceType: isOnlineOrder ? 'online' : 'offline',
      tableName: originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table,
      table: originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table,
      shopTableName: originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table,
      shopTableid: originalOrder.shopTableid || "0",

      // Timing information
      date: originalOrder.created_at || originalOrder.createdAt || originalOrder.timestamp || new Date().toISOString(),
      created_at: originalOrder.created_at || originalOrder.createdAt || originalOrder.timestamp || new Date().toISOString(),
      timestamp: originalOrder.created_at || originalOrder.createdAt || originalOrder.timestamp || new Date().toISOString(),

      // Order notes and metadata
      note: originalOrder.orderNote || originalOrder.note || originalOrder.eater?.comment || '',
      orderNote: originalOrder.orderNote || originalOrder.note || originalOrder.eater?.comment || '',

      // Shop and user information
      shopid: originalOrder.shopid || "246",
      userid: originalOrder.userid || "1752",
      roleid: originalOrder.roleid || "4",

      // Payment and pricing information
      subPrice: originalOrder.subPrice || originalOrder.total_amount || 0,
      total_amount: originalOrder.total_amount || 0,
      orderValue: originalOrder.orderValue || originalOrder.total_amount || 0,
      transType: originalOrder.transType || "41",
      chanel_type_id: originalOrder.chanel_type_id || "1",

      // Channel information (for delivery apps)
      chanel_name: isOnlineOrder ? (originalOrder.service || originalOrder.chanel_name || 'Online') : (originalOrder.chanel_name || 'POS'),
      foodapp_order_id: originalOrder.foodapp_order_id || '',
      package_id: originalOrder.package_id || 0,

      // Status information
      status: originalOrder.status || originalOrder.state || "pending",
      orderStatus: originalOrder.orderStatus || "Paymented",
      syncStatus: originalOrder.syncStatus || "pending",

      // Enhanced item information structure
      itemInfo: {
        items: [{
          name: productName,
          item_name: productName,
          quantity: 1, // Each label represents 1 item
          amount: 1,
          fare: {
            priceDisplay: productPrice ? productPrice.toLocaleString('vi-VN') : '0',
            currencySymbol: '₫',
            price: productPrice
          },
          price: productPrice,
          comment: productComment,
          note_prod: productComment,
          product_id: productId,

          // Enhanced modifier information
          modifierGroups: productModifiers,

          // Flattened modifier strings for easier template access
          stringName: modifierStrings.stringName,
          option: product.option,
          extrastring: modifierStrings.extrastring,
          itemIdx: labelIndex + 1, // Use 1-based indexing for display
          totalItems: totalLabels,
        }],
        itemIdx: labelIndex + 1, // Use 1-based indexing for display
        totalItems: totalLabels,
      },

      // Direct decals format for immediate template compatibility
      decals: [{
        item_name: productName,
        amount: 1,
        note_prod: productComment,
        stringName: modifierStrings.stringName,
        option: product.option,
        extrastring: modifierStrings.extrastring,
        itemIdx: labelIndex + 1, // Use 1-based indexing for display
        totalItems: totalLabels,
        price: productPrice,
        priceDisplay: productPrice ? productPrice.toLocaleString('vi-VN') : '0₫',
        product_id: productId,
      }],

      // Customer and service information
      customerInfo: {
        name: isOnlineOrder ?
          (originalOrder.eater?.name || originalOrder.service || 'Khách hàng') :
          (originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table || 'Khách hàng'),
        table: isOnlineOrder ?
          (originalOrder.service || 'Online') :
          (originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table),
        phone: isOnlineOrder ?
          (originalOrder.eater?.mobileNumber || '') :
          (originalOrder.customerPhone || ''),
        address: isOnlineOrder ?
          (originalOrder.eater?.address?.address || '') :
          (originalOrder.customerAddress || ''),
      },

      // Additional metadata for comprehensive printing
      products: originalOrder.products, // Keep full product array for reference (offline orders)
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

      // Preserve source marker
      source: originalOrder.source,
    };

    console.log(`RootNav: transformedOrder table field:`, transformedOrder.table);
    console.log(`RootNav: transformedOrder decals:`, transformedOrder.decals);
    console.log(`RootNav: transformedOrder itemInfo:`, transformedOrder.itemInfo);

    return transformedOrder;
  };

  // Helper function to transform order for bill printing
  const transformOrderForBill = (originalOrder) => {
    // Detect order type
    const isOnlineOrder = originalOrder.source === 'app_order' || originalOrder.source === 'online_new';
    const isOfflineOrder = originalOrder.products && Array.isArray(originalOrder.products);

    // Get items from appropriate structure
    let items = [];
    if (isOfflineOrder && originalOrder.products) {
      items = originalOrder.products.map(product => ({
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
      }));
    } else if (isOnlineOrder && originalOrder.itemInfo?.items) {
      // Online orders already have the correct structure
      items = originalOrder.itemInfo.items;
    }

    return {
      ...originalOrder,
      displayID: originalOrder.displayID || originalOrder.session,
      orderValue: originalOrder.orderValue || originalOrder.total_amount,
      itemInfo: {
        items: items
      },
      customerInfo: {
        name: isOnlineOrder ?
          (originalOrder.eater?.name || originalOrder.service || 'Khách hàng') :
          (originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table || 'Khách hàng'),
        phone: isOnlineOrder ?
          (originalOrder.eater?.mobileNumber || '') :
          (originalOrder.customerPhone || ''),
        address: isOnlineOrder ?
          (originalOrder.eater?.address?.address || '') :
          (originalOrder.customerAddress || ''),
      },
      serviceType: isOnlineOrder ? 'online' : 'offline',
      tableName: isOnlineOrder ?
        (originalOrder.service || originalOrder.eater?.name || 'Khách hàng') :
        (originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table),
      table: isOnlineOrder ?
        (originalOrder.service || originalOrder.eater?.name || 'Khách hàng') :
        (originalOrder.shopTableName || originalOrder.shoptablename || originalOrder.table),
    };
  };

  // Capture snapshot function for print queue service
  const handleCaptureSnapshot = async (type, order, options = {}) => {
    try {
      console.log(`RootNav: Capturing ${type} snapshot for order:`, order, options, order?.session || order?.offlineOrderId);

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

      // Set the transformed printing order to render in appropriate ViewShot component
      if (type === 'label') {
        setPrintingOrderLabel(transformedOrder);
      } else if (type === 'bill') {
        setPrintingOrderBill(transformedOrder);
      }
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
      // Reset appropriate printing order on error to prevent stale state
      if (type === 'label') {
        setPrintingOrderLabel(null);
      } else if (type === 'bill') {
        setPrintingOrderBill(null);
      }
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
      console.log('RootNav: Starting queueMultipleLabels for order:', order);

      // Handle different order structures: offline orders use order.products, online orders use order.itemInfo.items
      let products = null;
      if (order?.products) {
        products = order.products; // Offline orders
      } else if (order?.itemInfo?.items) {
        products = order.itemInfo.items; // Online orders
      }

      if (!order || !products || products.length === 0) {
        throw new Error('Order or products not available');
      }

      // Calculate total number of labels to be printed
      let totalLabels = 0;
      products.forEach(product => {
        totalLabels += (product.quanlity || product.quantity || 1);
      });

      console.log(`RootNav: Total labels to print: ${totalLabels}`);

      let currentLabelIndex = 0;
      const printTaskIds = [];

      // Create print tasks for each product and each quantity
      for (let productIndex = 0; productIndex < products.length; productIndex++) {
        const product = products[productIndex];
        const quantity = product.quanlity || product.quantity || 1;
        console.log('RootNav: Product:', order, product);

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
          console.log(`RootNav: Queued label task ${taskId} - Product: "${product.name}" (${productIndex + 1}/${products.length}), Label: ${currentLabelIndex + 1}/${totalLabels}, Qty: ${quantityIndex + 1}/${quantity}`);
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
      setPrintingOrderLabel(null);
      setPrintingOrderBill(null);
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
        {printingOrderLabel && isComponentReady && <PrintTemplate orderPrint={printingOrderLabel} />}
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
        {printingOrderBill && isComponentReady && <BillTemplate selectedOrder={printingOrderBill} />}
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
