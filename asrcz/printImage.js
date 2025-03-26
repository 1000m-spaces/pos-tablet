import {readFile} from 'react-native-fs';
import TcpSocket from 'react-native-tcp-socket';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer';

/**
 * Chuyển đổi ảnh thành bitmap nhị phân theo chuẩn ESC/POS
 * @param {string} imagePath - Đường dẫn ảnh đầu vào
 * @returns {Buffer} Dữ liệu buffer sẵn sàng để in
 */
const prepareImageData = async imagePath => {
  try {
    // Đọc file ảnh dưới dạng base64
    const base64Image = await RNFS.readFile(imagePath, 'base64');
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Giả sử máy in hỗ trợ ảnh có chiều rộng 384px (48 bytes mỗi dòng)
    const imageWidth = 384;
    const bytesPerLine = imageWidth / 8;
    const imageHeight = imageBuffer.length / (imageWidth * 4); // Mỗi pixel có 4 bytes RGBA

    let bitmapData = [];
    for (let y = 0; y < imageHeight; y++) {
      for (let x = 0; x < bytesPerLine; x++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const pixelIndex = (y * imageWidth + x * 8 + bit) * 4;
          const grayscale =
            (imageBuffer[pixelIndex] +
              imageBuffer[pixelIndex + 1] +
              imageBuffer[pixelIndex + 2]) /
            3;
          if (grayscale < 128) {
            byte |= 1 << (7 - bit);
          }
        }
        bitmapData.push(byte);
      }
    }

    console.log('✅ Bitmap Data Generated:', bitmapData);

    const command = Buffer.concat([
      Buffer.from([0x1d, 0x76, 0x30, 0x00]), // ESC * v (Raster Bit Image)
      Buffer.from([bytesPerLine & 0xff, bytesPerLine >> 8]), // Width
      Buffer.from([imageHeight & 0xff, imageHeight >> 8]), // Height
      Buffer.from(bitmapData), // Image data
    ]);

    return command;
  } catch (error) {
    console.error('❌ Error preparing image:', error);
    throw error;
  }
};

/**
 * Gửi dữ liệu ảnh đến máy in XPrinter qua TCP
 * @param {string} printerIP - Địa chỉ IP của máy in
 * @param {number} printerPort - Cổng của máy in (thường là 9100)
 * @param {Buffer} data - Dữ liệu buffer của ảnh
 */
const sendToPrinter = (printerIP, printerPort, data) => {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Connecting to printer ${printerIP}:${printerPort}...`);

    const client = TcpSocket.createConnection(
      {host: printerIP, port: printerPort},
      () => {
        console.log('✅ Connected to printer, sending data...');

        client.write(data);
        client.write(Buffer.from('\x0A')); // Xuống dòng
        client.write(Buffer.from('\x1D\x56\x00')); // Cắt giấy

        client.end();
        resolve();
      },
    );

    client.on('error', error => {
      console.error('❌ Printer connection error:', error);
      reject(error);
    });

    client.on('close', () => {
      console.log('🔌 Printer connection closed.');
    });
  });
};

/**
 * In văn bản ESC/POS
 * @param {string} printerIP - Địa chỉ IP của máy in
 * @param {number} printerPort - Cổng của máy in
 * @param {string} text - Văn bản cần in
 */
const printText = async (printerIP, printerPort, text) => {
  try {
    console.log('🔄 Preparing text for printing...');

    // Chuyển đổi Tiếng Việt sang mã UTF-8 (Giữ nguyên định dạng)
    let encodedText = Buffer.from(text, 'utf-8');

    // Lệnh ESC/POS cho định dạng văn bản
    const commands = Buffer.concat([
      Buffer.from('\x1B\x40'), // Reset máy in
      Buffer.from('\x1B\x61\x01'), // Căn giữa
      Buffer.from('\x1B\x21\x10'), // In đậm
      encodedText,
      // Buffer.from('\x0A\x0A'), // Xuống dòng
      Buffer.from('\x1D\x56\x00'), // Cắt giấy
    ]);

    console.log('🔄 Sending text data to printer...');
    await sendToPrinter(printerIP, printerPort, commands);

    console.log('✅ Text printing completed!');
  } catch (error) {
    console.error('❌ Print text error:', error);
  }
};

/**
 * Hàm chính để in ảnh lên máy in XPrinter qua TCP
 * @param {string} printerIP - Địa chỉ IP của máy in
 * @param {number} printerPort - Cổng của máy in (thường là 9100)
 * @param {string} imagePath - Đường dẫn ảnh cần in
 */
const printImage = async (printerIP, printerPort, imagePath) => {
  try {
    console.log('🔄 Chuẩn bị ảnh để in...');
    const imageData = await prepareImageData(imagePath);

    console.log('🔄 Gửi ảnh đến máy in qua TCP...');
    await sendToPrinter(printerIP, printerPort, imageData);

    console.log('✅ In ảnh thành công!');
  } catch (error) {
    console.error('❌ Lỗi in ảnh:', error);
  }
};

// Xuất các hàm để sử dụng trong React Native
export {printImage, printText};
