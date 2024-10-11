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
      NetPrinter.printBill('<C>sample bill success</C>');
    }
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
