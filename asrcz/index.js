import React, {useEffect, useState} from 'react';
// import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import {View, Text, TouchableOpacity} from 'react-native';
import {
  USBPrinter,
  NetPrinter,
  BLEPrinter,
} from 'react-native-thermal-receipt-printer';

const App = () => {
  const [printers, setPrinters] = useState([]);
  const [currentPrinter, setCurrentPrinter] = useState(null);

  useEffect(() => {
    NetPrinter.init().then(() => {
      setPrinters([
        {device_name: 'Xprinter', host: '192.168.0.10', port: 9100},
      ]);
    });
  }, []);

  const connectPrinter = (host, port) => {
    NetPrinter.connectPrinter(host, port).then(
      printer => setCurrentPrinter(printer),
      error => console.warn(error),
    );
  };

  const printTextTest = () => {
    if (currentPrinter) {
      NetPrinter.printText('<C>sample text</C>\n');
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
          onPress={() => connectPrinter(printer.host, printer.port)}>
          <Text>{`device_name: ${printer.device_name}, host: ${printer.host}, port: ${printer.port}`}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={printTextTest}>
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
  shopname: 'TrÃ  1000M - 45 Nguyá»…n Thá»‹ Äá»‹nh',
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
      product_name: 'TrÃ  Shan Tuyáº¿t ThÆ°á»£ng Háº¡ng 1000M',
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
