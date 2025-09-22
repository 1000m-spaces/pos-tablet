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

  // Capture snapshot function for print queue service
  const handleCaptureSnapshot = async (type, order) => {
    try {
      console.log(`RootNav: Capturing ${type} snapshot for order:`, order?.session || order?.offlineOrderId);

      // Set the printing order to render in ViewShot components
      setPrintingOrder(order);
      setIsComponentReady(false);

      // Wait for component to render with new order data - increased delay for reliability
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
      } else {
        throw new Error(`Unknown snapshot type: ${type}`);
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setPrintingOrder(null);
      setIsComponentReady(false);
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
