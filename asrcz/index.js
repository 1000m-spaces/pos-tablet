import React, {useRef, useEffect, useState} from 'react';
// import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import RNPrint from 'react-native-print';
// import html2canvas from 'html2canvas';
import {Buffer} from 'buffer';
// import RNFS from 'react-native-fs';
import TcpSocket from 'react-native-tcp-socket';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import {printImage, printText} from './printImage';
import {Printer, PrinterConstants} from 'react-native-esc-pos-printer';
import {View, Text, Image, Button, TouchableOpacity, Alert} from 'react-native';
// import {
//   NetworkPrinter,
//   USBPrinter,
//   NetPrinter,
//   BLEPrinter,
// } from 'react-native-thermal-receipt-printer-image-qr';
import {
  NetworkPrinter,
  USBPrinter,
  NetPrinter,
  BLEPrinter,
} from 'react-native-thermal-receipt-printer';

const App = () => {
  const [printers, setPrinters] = useState([]);
  const [currentPrinter, setCurrentPrinter] = useState(null);
  const viewRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [status, setStatus] = useState('Ready');

  // ESC/POS commands for thermal printers
  const COMMANDS = {
    LF: Buffer.from([0x0a]),
    ESC: Buffer.from([0x1b]),
    GS: Buffer.from([0x1d]),
    INIT: Buffer.from([0x1b, 0x40]),
    CUT: Buffer.from([0x1d, 0x56, 0x41]),
    CENTER: Buffer.from([0x1b, 0x61, 0x01]),
    LEFT: Buffer.from([0x1b, 0x61, 0x00]),
    RIGHT: Buffer.from([0x1b, 0x61, 0x02]),
  };

  const orderData = {
    orderId: 'ORD-12345',
    date: new Date().toLocaleString(),
    items: [
      {name: 'Cà phê sữa', price: 30000, quantity: 2},
      {name: 'Bánh mì thịt', price: 25000, quantity: 1},
    ],
    total: 85000,
    customerName: 'Nguyễn Văn A',
  };

  // Địa chỉ IP của máy in X-Printer (đổi theo IP thực tế)
  const printerIP = '192.168.1.100';
  const printerPort = 9100;

  useEffect(() => {
    NetPrinter.init().then(() => {
      setPrinters([
        {device_name: 'Xprinter', host: '192.168.1.100', port: 9100},
      ]);
    });
  }, []);

  const connectPrinter = () => {
    console.log('conneccttttt____printerrrr', printerIP, printerPort);
    // NetPrinter.connectPrinter(printerIP, printerPort).then(
    //   printer => {
    //     console.log('printerrrr::::::', printer);
    //     setCurrentPrinter(printer);
    //   },
    //   error => console.log(error),
    // );
  };

  const print = async () => {
    try {
      const printerInstance = new Printer({
        target: '192.168.1.100', // IP máy in XPrinter XP-Q800
        deviceName: 'XPrinter XP-Q800', // Tên máy in
      });

      await printerInstance.addQueueTask(async () => {
        // Kiểm tra kết nối
        await Printer.tryToConnectUntil(
          printerInstance,
          status => status.online.statusCode === PrinterConstants.TRUE,
        );
      });

      // In nội dung
      await printerInstance.addText(
        'Xin chào, đây là test in trên XP-Q800!\n\n',
        {encoding: 'CP1258'},
      );
      await printerInstance.addFeedLine();
      await printerInstance.addCut();

      // Gửi lệnh in
      const result = await printerInstance.sendData();

      // Ngắt kết nối sau khi in xong
      await printerInstance.disconnect();

      console.log('In thành công:', result);
    } catch (error) {
      console.error('Lỗi khi in:', error);
    }
  };

  // Connect to printer
  // const connectPrinter = () => {
  //   console.log('connect to printer');
  //   setStatus('Connecting...');
  //   try {
  //     const newClient = TcpSocket.createConnection({
  //       host: printerIP,
  //       port: parseInt(printerPort),
  //       timeout: 3000,
  //     });

  //     newClient.on('connect', () => {
  //       setClient(newClient);
  //       setIsConnected(true);
  //       setStatus('Connected');
  //       console.log('connecteddddddd to printer');
  //       // Initialize printer
  //       newClient.write(COMMANDS.INIT);
  //     });

  //     newClient.on('error', error => {
  //       setStatus(`Error: ${error.message}`);
  //       console.log('connect to printer errorrrrr');
  //       setIsConnected(false);
  //     });

  //     newClient.on('close', () => {
  //       setStatus('Disconnected');
  //       setIsConnected(false);
  //       setClient(null);
  //     });
  //   } catch (error) {
  //     setStatus(`Connection failed: ${error.message}`);
  //   }
  // };

  // Print current view as image
  const printScreen = async () => {
    setStatus('Capturing screen...');
    try {
      // Capture the view as an image
      console.log('pass to view.....');
      const uri = await viewRef.current.capture(viewRef, {
        format: 'png',
        quality: 0.8,
      });

      const printer = new Printer({
        target: '192.168.1.100',
        deviceName: 'XPrinter XP-Q800',
      });

      // Khởi tạo đối tượng máy in với địa chỉ IP và cổng mặc định 9100
      // await printer.addQueueTask(async () => {
      //   await Printer.tryToConnectUntil(
      //     printer,
      //     status => status.online.statusCode === true,
      //   );
      // });
      await printer.init();

      await printer.addFeedLine();

      await Printer.addViewShot(printer, {
        viewNode: viewRef.current,
      });

      await printer.addCut();

      const result = await printer.sendData();

      await printer.disconnect();

      setStatus('Processing image...', result);
      // Prepare image data for printer
      console.log('Processing text...', uri);

      setStatus('Print complete');
    } catch (error) {
      console.log('printing error.....', error);
      setStatus(`Print failed: ${error.message}`);
    }
  };

  // Print text
  // const printText = text => {
  //   if (!isConnected) {
  //     // Alert.alert('Not Connected', 'Please connect to a printer first.');
  //     console.log('do not connect to printer');
  //     return;
  //   }

  //   try {
  //     client.write(COMMANDS.LEFT);
  //     client.write(Buffer.from(text));
  //     client.write(COMMANDS.LF);
  //     client.write(COMMANDS.LF);
  //     setStatus('Text printed');
  //   } catch (error) {
  //     setStatus(`Print failed: ${error.message}`);
  //   }
  // };

  const printTextTest = () => {
    if (currentPrinter) {
      NetPrinter.printText(`<C>${'Hee Looo'}</C>\n`);
    }
  };

  const printBillTest = () => {
    if (currentPrinter) {
      NetPrinter.printBill(formatBill(data));
    }
  };

  const formatBill = jsonData => {
    let bill = '<C>Receipt</C>\n';
    bill += '<D>Date: ' + jsonData.date + '</D>\n';
    jsonData.items.forEach(item => {
      bill += item.product_name + '  x' + '1' + '  ' + item.paid_price + '\n';
    });
    bill += '\n<C>Total: ' + jsonData.totalPrice + '</C>\n';
    return bill;
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      {printers.map(printer => (
        <TouchableOpacity
          key={printer.device_id}
          onPress={() => connectPrinter()}>
          <Text>{`device_name: ${printer.device_name}, host: ${printer.host}, port: ${printer.port}`}</Text>
        </TouchableOpacity>
      ))}
      {/* Thành phần cần in */}
      <ViewShot ref={viewRef} options={{format: 'jpg', quality: 0.9}}>
        <View
          style={{
            width: 200,
            height: 100,
            backgroundColor: 'blue',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={{
              uri: 'https://reactnative.dev/img/tiny_logo.png',
            }}
            style={{width: 50, height: 50}}
          />
        </View>
      </ViewShot>

      {/* Nút bấm để chụp và in */}
      <Button title="Chụp & In" onPress={print} />

      {/* Hiển thị ảnh đã chụp (debug) */}
      {imageUri && (
        <Image
          source={{uri: imageUri}}
          style={{width: 200, height: 100, marginTop: 10}}
        />
      )}
      <TouchableOpacity onPress={print}>
        <Text> Print Text </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={printBillTest}>
        <Text> Print Bill Text </Text>
      </TouchableOpacity>
    </View>
  );
};

const data = {
  idOrder: 1975814,
  idVendor: 0,
  idProduct: 0,
  inputEndPoint: 0,
  outputEndPoint: 0,
  url_icon: 'null',
  trans_type_lable: 'HTTT',
  trans_type: 'Tiá»n máº·t',
  partnerid: '107',
  foodapp_order_id: '',
  online_tran_id: '',
  imgUrl: 'https://helio.assets.ciaolink.net',
  shopname: 'Trà 1000M 45 Nguyễn Thị Định',
  address:
    'Ä/C: 45 Nguyá»…n Thá»‹ Äá»‹nh, Trung HÃ²a, Cáº§u Giáº¥y, Ha Noi, Viet Nam',
  phone: 'Tel: 0904343433',
  chanel_name: 'Äáº·t táº¡i cá»­a hÃ ng',
  package_id: 0,
  shipping_address: '',
  shiper_name: '',
  date: '2024-10-10 15:32',
  date_label: 'Ngay',
  bill_label: 'Ma HD',
  bill_id: '1975814',
  staff_label: 'Nhan vien',
  staff: '1000m_cash',
  table_label: 'Ban',
  table: 'BÃ n 01',
  fee_percent: '0',
  fee_service: '0',
  subTotal: '164,000',
  price_discount: '-0',
  total_price: '164,000',
  wifi_name: 'null',
  wifi_pass: 'null',
  bill_type: 1,
  bill_number: null,
  ttSP: '  San pham',
  ttGia: 'Gia',
  ttSL: 'SL',
  ttTT: 'Thanh Tien',
  subTT_lable: 'Thanh Tien',
  fee_lable: 'Khuyen mai',
  tt_lable: 'Tong cong',
  footer1: 'Thank You and Have a Nice Day!',
  footer2: '( Reprint bill 1)',
  items: [
    {
      product_name: 'Trà Shan Tuyết thượng hạng 1000M',
      quantity: '1',
      isCheckBill: 0,
      note_prod: '',
      price: '49,000',
      listExtras: [
        {
          quantity: '1',
          paid_price: '0',
          amount: 0,
          id: 7745,
          name: '100% Ngá»t',
          name_vn: '100% Ngá»t',
          name_eng: '100% Ngá»t',
          group_extra_name: 'Äá»™ ngá»t',
          group_type: 1,
        },
      ],
      option: 'ÄÃ¡ chung',
      paid_price: '49,000',
    },
    {
      product_name: 'TrÃ  Shan Tuyáº¿t ThÆ°á»£ng Háº¡ng 1000M',
      quantity: '1',
      isCheckBill: 0,
      note_prod: '',
      price: '45,000',
      listExtras: [
        {
          quantity: '1',
          paid_price: '10,000',
          amount: 10000,
          id: 7744,
          name: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_vn: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_eng: 'TrÃ¢n chÃ¢u Tráº¯ng',
          group_extra_name: 'Topping',
          group_type: 2,
        },
        {
          quantity: '1',
          paid_price: '0',
          amount: 0,
          id: 7745,
          name: '100% Ngá»t',
          name_vn: '100% Ngá»t',
          name_eng: '100% Ngá»t',
          group_extra_name: 'Äá»™ ngá»t',
          group_type: 1,
        },
      ],
      option: 'ÄÃ¡ chung',
      paid_price: '45,000',
    },
    {
      product_name: 'Shan Tuyáº¿t HÆ°Æ¡ng Shen',
      quantity: '1',
      isCheckBill: 0,
      note_prod: '',
      price: '70,000',
      listExtras: [
        {
          quantity: '1',
          paid_price: '10,000',
          amount: 10000,
          id: 7744,
          name: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_vn: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_eng: 'TrÃ¢n chÃ¢u Tráº¯ng',
          group_extra_name: 'Topping',
          group_type: 2,
        },
        {
          quantity: '1',
          paid_price: '0',
          amount: 0,
          id: 7745,
          name: '100% Ngá»t',
          name_vn: '100% Ngá»t',
          name_eng: '100% Ngá»t',
          group_extra_name: 'Äá»™ ngá»t',
          group_type: 1,
        },
      ],
      option: 'ÄÃ¡ chung',
      paid_price: '70,000',
    },
  ],
  decals: [
    {
      id: '85270',
      item_name: 'TrÃ  Shan Tuyáº¿t ThÆ°á»£ng Háº¡ng 1000M',
      note_prod: '',
      option: 'ÄÃ¡ chung',
      listExtras: [
        {
          quantity: '1',
          paid_price: '0',
          amount: 0,
          id: 7745,
          name: '100% Ngá»t',
          name_vn: '100% Ngá»t',
          name_eng: '100% Ngá»t',
          group_extra_name: 'Äá»™ ngá»t',
          group_type: 1,
        },
      ],
      amount: '49,000 VNÄ',
      extrastring: ' + 100% Ngá»t',
    },
    {
      id: '85270',
      item_name: 'TrÃ  Shan Tuyáº¿t ThÆ°á»£ng Háº¡ng 1000M',
      note_prod: '',
      option: 'ÄÃ¡ chung',
      listExtras: [
        {
          quantity: '1',
          paid_price: '10,000',
          amount: 10000,
          id: 7744,
          name: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_vn: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_eng: 'TrÃ¢n chÃ¢u Tráº¯ng',
          group_extra_name: 'Topping',
          group_type: 2,
        },
        {
          quantity: '1',
          paid_price: '0',
          amount: 0,
          id: 7745,
          name: '100% Ngá»t',
          name_vn: '100% Ngá»t',
          name_eng: '100% Ngá»t',
          group_extra_name: 'Äá»™ ngá»t',
          group_type: 1,
        },
      ],
      amount: '45,000 VNÄ',
      extrastring: ' + TrÃ¢n chÃ¢u Tráº¯ng + 100% Ngá»t',
    },
    {
      id: '85270',
      item_name: 'Shan Tuyáº¿t HÆ°Æ¡ng Shen',
      note_prod: '',
      option: 'ÄÃ¡ chung',
      listExtras: [
        {
          quantity: '1',
          paid_price: '10,000',
          amount: 10000,
          id: 7744,
          name: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_vn: 'TrÃ¢n chÃ¢u Tráº¯ng',
          name_eng: 'TrÃ¢n chÃ¢u Tráº¯ng',
          group_extra_name: 'Topping',
          group_type: 2,
        },
        {
          quantity: '1',
          paid_price: '0',
          amount: 0,
          id: 7745,
          name: '100% Ngá»t',
          name_vn: '100% Ngá»t',
          name_eng: '100% Ngá»t',
          group_extra_name: 'Äá»™ ngá»t',
          group_type: 1,
        },
      ],
      amount: '70,000 VNÄ',
      extrastring: ' + TrÃ¢n chÃ¢u Tráº¯ng + 100% Ngá»t',
    },
  ],
  note_lable: 'Ghi chu',
  note: '',
  custPay: '0',
  repayCus: '0',
  isGetPass: 0,
  arrayTT: [
    {
      titel: 'Tá»•ng',
      value: '164,000',
    },
    {
      titel: 'Thanh ToÃ¡n',
      value: '164,000',
    },
  ],
};

// const App = () => {
//     const [selectedPrinter, setSelectedPrinter] = useState(null);
//     // @NOTE iOS Only
//     const selectPrinter = async () => {
//         const selecPrinter = await RNPrint.selectPrinter({ x: 100, y: 100 });
//         setSelectedPrinter(selecPrinter);
//     };

//     // @NOTE iOS Only
//     const silentPrint = async () => {
//         if (!selectedPrinter) {
//             alert('Must Select Printer First');
//         }

//         const jobName = await RNPrint.print({
//             printerURL: selectedPrinter.url,
//             html: '<h1>Silent Print</h1>',
//         });

//     };

//     const printHTML = async () => {
//         await RNPrint.print({
//             html: '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>',
//         });
//     };

//     const printPDF = async () => {
//         const results = await RNHTMLtoPDF.convert({
//             html: '<h1>Custom converted PDF Document</h1>',
//             fileName: 'test',
//             base64: true,
//         });

//         await RNPrint.print({ filePath: results.filePath });
//     };

//     const printRemotePDF = async () => {
//         await RNPrint.print({ filePath: 'https://graduateland.com/api/v2/users/jesper/cv' });
//     };

//     const customOptions = () => {
//         return (
//             <View>
//                 {selectedPrinter &&
//                     <View>
//                         <Text>{`Selected Printer Name: ${selectedPrinter.name}`}</Text>
//                         <Text>{`Selected Printer URI: ${selectedPrinter.url}`}</Text>
//                     </View>
//                 }
//                 <Button onPress={selectPrinter} title="Select Printer" />
//                 <Button onPress={silentPrint} title="Silent Print" />
//             </View>

//         );
//     };

//     return(
//         <View style = { styles.container } >
//             { Platform.OS === 'ios' && customOptions() }
//             < Button onPress = { printHTML } title = "Print HTML" />
//         <Button onPress={printPDF} title="Print PDF" />
//         <Button onPress={printRemotePDF} title="Print Remote PDF" />
//       </View >
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#F5FCFF',
//     },
// });

export default App;
