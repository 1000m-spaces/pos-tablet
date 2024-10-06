module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    // Cấu hình tắt cảnh báo lỗi cho tất cả các file, exhaustive-deps là cảnh báo của useEffect khi mà mảng tham số ở cuối thiếu, hoặc không đủ
    'react-hooks/exhaustive-deps': 'off',
  },
};
