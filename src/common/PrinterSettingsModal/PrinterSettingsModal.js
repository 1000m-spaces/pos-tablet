import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, Switch, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import AsyncStorage from 'store/async_storage/index';
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';
import { getUsbDevices, getSerialDevices } from 'rn-xprinter';

const PrinterSettingsModal = ({
    visible,
    onClose,
    initialPrinterType = 'label',
    onSettingsSaved
}) => {
    // Label printer settings state
    const [ip, setIP] = useState("");
    const [sWidth, setSWidth] = useState(50);
    const [sHeight, setSHeight] = useState(30);
    const [autoPrint, setAutoPrint] = useState(false);
    const [labelConnectionType, setLabelConnectionType] = useState('network'); // 'network', 'usb', 'serial'
    const [labelUsbDevice, setLabelUsbDevice] = useState('');
    const [labelSerialPort, setLabelSerialPort] = useState('');

    // Label printer font sizes
    const [labelStoreName, setLabelStoreName] = useState(15);
    const [labelOrderNumber, setLabelOrderNumber] = useState(15);
    const [labelItemName, setLabelItemName] = useState(15);
    const [labelModifier, setLabelModifier] = useState(14);
    const [labelNote, setLabelNote] = useState(14);

    // Bill printer settings
    const [billIP, setBillIP] = useState("");
    const [billPort, setBillPort] = useState(9100);
    const [billPaperSize, setBillPaperSize] = useState('80mm'); // 58mm, 80mm
    const [billConnectionType, setBillConnectionType] = useState('network'); // 'network', 'usb', 'serial'
    const [billUsbDevice, setBillUsbDevice] = useState('');
    const [billSerialPort, setBillSerialPort] = useState('');

    // Bill printer font sizes
    const [billHeader, setBillHeader] = useState(24);
    const [billContent, setBillContent] = useState(16);
    const [billTotal, setBillTotal] = useState(18);

    // Device lists and loading states
    const [usbDevices, setUsbDevices] = useState([]);
    const [serialPorts, setSerialPorts] = useState([]);
    const [isLoadingUsb, setIsLoadingUsb] = useState(false);
    const [isLoadingSerial, setIsLoadingSerial] = useState(false);

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [printerType, setPrinterType] = useState(initialPrinterType); // 'label' or 'bill'

    // Load printer settings when modal opens
    useEffect(() => {
        if (visible) {
            loadPrinterSettings();
            // Load device lists when modal opens
            if (Platform.OS === 'android') {
                scanUsbDevices();
                scanSerialPorts();
            }
        }
    }, [visible]);

    // Update printer type when initialPrinterType changes
    useEffect(() => {
        setPrinterType(initialPrinterType);
    }, [initialPrinterType]);

    const loadPrinterSettings = async () => {
        try {
            // Load label printer settings
            const labelPrinterInfo = await AsyncStorage.getLabelPrinterInfo();
            if (labelPrinterInfo) {
                setIP(labelPrinterInfo.IP || "");
                setSWidth(labelPrinterInfo.sWidth || 50);
                setSHeight(labelPrinterInfo.sHeight || 30);
                setAutoPrint(labelPrinterInfo.autoPrint || false);
                setLabelConnectionType(labelPrinterInfo.connectionType || 'network');
                setLabelUsbDevice(labelPrinterInfo.usbDevice || '');
                setLabelSerialPort(labelPrinterInfo.serialPort || '');

                // Load label font sizes
                setLabelStoreName(labelPrinterInfo.labelStoreName || 15);
                setLabelOrderNumber(labelPrinterInfo.labelOrderNumber || 15);
                setLabelItemName(labelPrinterInfo.labelItemName || 15);
                setLabelModifier(labelPrinterInfo.labelModifier || 14);
                setLabelNote(labelPrinterInfo.labelNote || 14);
            }

            // Load bill printer settings
            const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();
            if (billPrinterInfo) {
                setBillIP(billPrinterInfo.billIP || "");
                setBillPort(billPrinterInfo.billPort || 9100);
                setBillPaperSize(billPrinterInfo.billPaperSize || '80mm');
                setBillConnectionType(billPrinterInfo.billConnectionType || 'network');
                setBillUsbDevice(billPrinterInfo.billUsbDevice || '');
                setBillSerialPort(billPrinterInfo.billSerialPort || '');

                // Load bill font sizes
                setBillHeader(billPrinterInfo.billHeader || 24);
                setBillContent(billPrinterInfo.billContent || 16);
                setBillTotal(billPrinterInfo.billTotal || 18);
            }
        } catch (error) {
            console.error('Error loading printer settings:', error);
        }
    };

    const scanUsbDevices = async () => {
        if (Platform.OS !== 'android') {
            Toast.show({
                type: 'error',
                text1: 'USB scanning chỉ hỗ trợ trên Android'
            });
            return;
        }

        setIsLoadingUsb(true);
        try {
            const devices = await getUsbDevices();
            setUsbDevices(Array.isArray(devices) ? devices : []);
            Toast.show({
                type: 'success',
                text1: `Tìm thấy ${Array.isArray(devices) ? devices.length : 0} thiết bị USB`
            });
        } catch (error) {
            console.error('Error scanning USB devices:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi quét thiết bị USB',
                text2: error.message
            });
            setUsbDevices([]);
        } finally {
            setIsLoadingUsb(false);
        }
    };

    const scanSerialPorts = async () => {
        if (Platform.OS !== 'android') {
            Toast.show({
                type: 'error',
                text1: 'Serial port scanning chỉ hỗ trợ trên Android'
            });
            return;
        }

        setIsLoadingSerial(true);
        try {
            const ports = await getSerialDevices();
            // Parse the string response (assuming comma-separated)
            const portList = typeof ports === 'string' ? ports.split(',').filter(port => port.trim()) : [];
            setSerialPorts(portList);
            Toast.show({
                type: 'success',
                text1: `Tìm thấy ${portList.length} cổng serial`
            });
        } catch (error) {
            console.error('Error scanning serial ports:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi quét cổng serial',
                text2: error.message
            });
            setSerialPorts([]);
        } finally {
            setIsLoadingSerial(false);
        }
    };

    // Printer validation - only validate active tab
    const validateForm = () => {
        const newErrors = {};

        if (printerType === 'label') {
            // Validate label printer settings only
            if (labelConnectionType === 'network') {
                if (!ip) {
                    newErrors.ip = 'Vui lòng nhập địa chỉ IP máy in tem';
                } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                    newErrors.ip = 'Định dạng địa chỉ IP không hợp lệ';
                }
            } else if (labelConnectionType === 'usb') {
                if (!labelUsbDevice) {
                    newErrors.labelUsbDevice = 'Vui lòng chọn thiết bị USB';
                }
            } else if (labelConnectionType === 'serial') {
                if (!labelSerialPort) {
                    newErrors.labelSerialPort = 'Vui lòng chọn cổng serial';
                }
            }

            if (!sWidth || isNaN(sWidth) || sWidth <= 0) {
                newErrors.sWidth = 'Chiều rộng tem phải là số dương';
            }
            if (!sHeight || isNaN(sHeight) || sHeight <= 0) {
                newErrors.sHeight = 'Chiều cao tem phải là số dương';
            }
        } else if (printerType === 'bill') {
            // Validate bill printer settings only
            if (billConnectionType === 'network') {
                if (!billIP) {
                    newErrors.billIP = 'Vui lòng nhập địa chỉ IP máy in bill';
                } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(billIP)) {
                    newErrors.billIP = 'Định dạng địa chỉ IP không hợp lệ';
                }
                if (!billPort || isNaN(billPort) || billPort <= 0 || billPort > 65535) {
                    newErrors.billPort = 'Port phải là số từ 1-65535';
                }
            } else if (billConnectionType === 'usb') {
                if (!billUsbDevice) {
                    newErrors.billUsbDevice = 'Vui lòng chọn thiết bị USB';
                }
            } else if (billConnectionType === 'serial') {
                if (!billSerialPort) {
                    newErrors.billSerialPort = 'Vui lòng chọn cổng serial';
                }
            }
        }

        console.log('newErrors', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save printer settings
    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const printerSettings = {
                // Label printer settings
                IP: ip,
                sWidth: parseInt(sWidth),
                sHeight: parseInt(sHeight),
                autoPrint: autoPrint,
                connectionType: labelConnectionType,
                usbDevice: labelUsbDevice,
                serialPort: labelSerialPort,

                // Label printer font sizes
                labelStoreName: parseInt(labelStoreName),
                labelOrderNumber: parseInt(labelOrderNumber),
                labelItemName: parseInt(labelItemName),
                labelModifier: parseInt(labelModifier),
                labelNote: parseInt(labelNote),

                // Bill printer settings
                billIP: billIP,
                billPort: parseInt(billPort),
                billPaperSize: billPaperSize,
                billConnectionType: billConnectionType,
                billUsbDevice: billUsbDevice,
                billSerialPort: billSerialPort,

                // Bill printer font sizes
                billHeader: parseInt(billHeader),
                billContent: parseInt(billContent),
                billTotal: parseInt(billTotal)
            };

            await AsyncStorage.setPrinterInfo(printerSettings);

            Toast.show({
                type: 'success',
                text1: 'Lưu cài đặt máy in thành công',
                position: 'bottom',
            });

            // Call callback if provided
            if (onSettingsSaved) {
                onSettingsSaved(printerSettings);
            }

            onClose();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lưu cài đặt thất bại',
                text2: error.message,
                position: 'bottom',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    const renderConnectionTypeSelector = (connectionType, setConnectionType, printerTypePrefix = '') => (
        <View style={styles.inputGroup}>
            <TextNormal style={styles.label}>{"Loại kết nối"}</TextNormal>
            <View style={styles.connectionTypeContainer}>
                <TouchableOpacity
                    style={[
                        styles.connectionTypeButton,
                        connectionType === 'network' && styles.connectionTypeButtonActive
                    ]}
                    onPress={() => setConnectionType('network')}
                >
                    <TextNormal style={[
                        styles.connectionTypeText,
                        connectionType === 'network' && styles.connectionTypeTextActive
                    ]}>
                        Mạng
                    </TextNormal>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.connectionTypeButton,
                        connectionType === 'usb' && styles.connectionTypeButtonActive
                    ]}
                    onPress={() => setConnectionType('usb')}
                >
                    <TextNormal style={[
                        styles.connectionTypeText,
                        connectionType === 'usb' && styles.connectionTypeTextActive
                    ]}>
                        USB
                    </TextNormal>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.connectionTypeButton,
                        connectionType === 'serial' && styles.connectionTypeButtonActive
                    ]}
                    onPress={() => setConnectionType('serial')}
                >
                    <TextNormal style={[
                        styles.connectionTypeText,
                        connectionType === 'serial' && styles.connectionTypeTextActive
                    ]}>
                        Serial
                    </TextNormal>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDeviceSelector = (devices, selectedDevice, setSelectedDevice, isLoading, onScan, label, errorKey) => (
        <View style={styles.inputGroup}>
            <View style={styles.deviceSelectorHeader}>
                <TextNormal style={styles.label}>{label}</TextNormal>
                <TouchableOpacity
                    style={[styles.scanButton, isLoading && styles.scanButtonDisabled]}
                    onPress={onScan}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.whiteColor} />
                    ) : (
                        <TextNormal style={styles.scanButtonText}>Quét</TextNormal>
                    )}
                </TouchableOpacity>
            </View>
            <View style={[styles.deviceDropdown, errors[errorKey] && styles.inputError]}>
                {devices.length === 0 ? (
                    <TextNormal style={styles.noDeviceText}>
                        {isLoading ? 'Đang quét...' : 'Không tìm thấy thiết bị'}
                    </TextNormal>
                ) : (
                    <ScrollView style={styles.deviceList} showsVerticalScrollIndicator={false}>
                        {devices.map((device, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.deviceItem,
                                    selectedDevice === (typeof device === 'string' ? device : device.name || device.deviceName || device.mName) && styles.deviceItemSelected
                                ]}
                                onPress={() => {
                                    const deviceName = typeof device === 'string' ? device : device.name || device.deviceName || device.mName || device.toString();
                                    setSelectedDevice(deviceName);
                                    setErrors(prev => ({ ...prev, [errorKey]: null }));
                                }}
                            >
                                <TextNormal style={[
                                    styles.deviceItemText,
                                    selectedDevice === (typeof device === 'string' ? device : device.name || device.deviceName || device.mName) && styles.deviceItemTextSelected
                                ]}>
                                    {typeof device === 'string' ? device : device.name || device.deviceName || device.mName || device.toString()}
                                </TextNormal>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
            {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
        </View>
    );

    return (
        <Modal
            onBackdropPress={handleClose}
            isVisible={visible}
            onBackButtonPress={handleClose}
            propagateSwipe
            style={styles.modal}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TextNormal style={styles.modalTitle}>{"Thiết lập máy in"}</TextNormal>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, printerType === 'label' && styles.activeTab]}
                            onPress={() => setPrinterType('label')}
                        >
                            <TextNormal style={[styles.tabText, printerType === 'label' && styles.activeTabText]}>
                                {"In tem"}
                            </TextNormal>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, printerType === 'bill' && styles.activeTab]}
                            onPress={() => setPrinterType('bill')}
                        >
                            <TextNormal style={[styles.tabText, printerType === 'bill' && styles.activeTabText]}>
                                {"In bill"}
                            </TextNormal>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.modalContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                >
                    {printerType === 'label' ? (
                        // Label Printer Settings
                        <>
                            {renderConnectionTypeSelector(labelConnectionType, setLabelConnectionType, 'label')}
                            {labelConnectionType === 'network' && (
                                <View style={styles.inputGroup}>
                                    <TextNormal style={styles.label}>{"Địa chỉ IP máy in tem"}</TextNormal>
                                    <View style={[styles.inputContainer, errors.ip && styles.inputError]}>
                                        <TextInput
                                            placeholder="Ví dụ: 192.168.1.100"
                                            value={ip}
                                            onChangeText={(text) => {
                                                setIP(text);
                                                setErrors(prev => ({ ...prev, ip: null }));
                                            }}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholderTextColor={Colors.textSecondary}
                                        />
                                    </View>
                                    {errors.ip && <Text style={styles.errorText}>{errors.ip}</Text>}
                                </View>
                            )}
                            {labelConnectionType === 'usb' && (
                                renderDeviceSelector(usbDevices, labelUsbDevice, setLabelUsbDevice, isLoadingUsb, scanUsbDevices, "Thiết bị USB", "labelUsbDevice")
                            )}
                            {labelConnectionType === 'serial' && (
                                renderDeviceSelector(serialPorts, labelSerialPort, setLabelSerialPort, isLoadingSerial, scanSerialPorts, "Cổng Serial", "labelSerialPort")
                            )}

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Chiều rộng tem (mm)"}</TextNormal>
                                <View style={[styles.inputContainer, errors.sWidth && styles.inputError]}>
                                    <TextInput
                                        placeholder="Ví dụ: 50"
                                        value={sWidth.toString()}
                                        onChangeText={(text) => {
                                            setSWidth(text);
                                            setErrors(prev => ({ ...prev, sWidth: null }));
                                        }}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                                {errors.sWidth && <Text style={styles.errorText}>{errors.sWidth}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Chiều cao tem (mm)"}</TextNormal>
                                <View style={[styles.inputContainer, errors.sHeight && styles.inputError]}>
                                    <TextInput
                                        placeholder="Ví dụ: 30"
                                        value={sHeight.toString()}
                                        onChangeText={(text) => {
                                            setSHeight(text);
                                            setErrors(prev => ({ ...prev, sHeight: null }));
                                        }}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                                {errors.sHeight && <Text style={styles.errorText}>{errors.sHeight}</Text>}
                            </View>

                            <View style={styles.toggleGroup}>
                                <View style={styles.toggleLabelContainer}>
                                    <TextNormal style={styles.label}>{"Tự động in tem"}</TextNormal>
                                    <Text style={styles.toggleDescription}>
                                        {"Tự động in tem khi có đơn hàng mới"}
                                    </Text>
                                </View>
                                <Switch
                                    value={autoPrint}
                                    onValueChange={setAutoPrint}
                                    trackColor={{ false: Colors.border, true: Colors.primary }}
                                    thumbColor={Colors.whiteColor}
                                    ios_backgroundColor={Colors.border}
                                />
                            </View>

                            {/* Font Size Settings for Label Printer */}
                            <View style={styles.sectionHeader}>
                                <TextNormal style={styles.sectionTitle}>{"Cài đặt kích thước chữ"}</TextNormal>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Tên cửa hàng"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="15"
                                        value={labelStoreName.toString()}
                                        onChangeText={(text) => setLabelStoreName(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Số đơn hàng"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="15"
                                        value={labelOrderNumber.toString()}
                                        onChangeText={(text) => setLabelOrderNumber(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Tên món"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="15"
                                        value={labelItemName.toString()}
                                        onChangeText={(text) => setLabelItemName(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Modifier"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="14"
                                        value={labelModifier.toString()}
                                        onChangeText={(text) => setLabelModifier(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Ghi chú"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="14"
                                        value={labelNote.toString()}
                                        onChangeText={(text) => setLabelNote(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>
                        </>
                    ) : (
                        // Bill Printer Settings
                        <>
                            {renderConnectionTypeSelector(billConnectionType, setBillConnectionType, 'bill')}
                            {billConnectionType === 'network' && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <TextNormal style={styles.label}>{"Địa chỉ IP máy in bill"}</TextNormal>
                                        <View style={[styles.inputContainer, errors.billIP && styles.inputError]}>
                                            <TextInput
                                                placeholder="Ví dụ: 192.168.1.101"
                                                value={billIP}
                                                onChangeText={(text) => {
                                                    setBillIP(text);
                                                    setErrors(prev => ({ ...prev, billIP: null }));
                                                }}
                                                style={styles.input}
                                                keyboardType="numeric"
                                                placeholderTextColor={Colors.textSecondary}
                                            />
                                        </View>
                                        {errors.billIP && <Text style={styles.errorText}>{errors.billIP}</Text>}
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <TextNormal style={styles.label}>{"Port"}</TextNormal>
                                        <View style={[styles.inputContainer, errors.billPort && styles.inputError]}>
                                            <TextInput
                                                placeholder="Ví dụ: 9100"
                                                value={billPort.toString()}
                                                onChangeText={(text) => {
                                                    setBillPort(text);
                                                    setErrors(prev => ({ ...prev, billPort: null }));
                                                }}
                                                style={styles.input}
                                                keyboardType="numeric"
                                                placeholderTextColor={Colors.textSecondary}
                                            />
                                        </View>
                                        {errors.billPort && <Text style={styles.errorText}>{errors.billPort}</Text>}
                                    </View>
                                </>
                            )}
                            {billConnectionType === 'usb' && (
                                renderDeviceSelector(usbDevices, billUsbDevice, setBillUsbDevice, isLoadingUsb, scanUsbDevices, "Thiết bị USB", "billUsbDevice")
                            )}
                            {billConnectionType === 'serial' && (
                                renderDeviceSelector(serialPorts, billSerialPort, setBillSerialPort, isLoadingSerial, scanSerialPorts, "Cổng Serial", "billSerialPort")
                            )}

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Kích thước giấy"}</TextNormal>
                                <View style={styles.paperSizeContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.paperSizeButton,
                                            billPaperSize === '58mm' && styles.paperSizeButtonActive
                                        ]}
                                        onPress={() => setBillPaperSize('58mm')}
                                    >
                                        <TextNormal style={[
                                            styles.paperSizeText,
                                            billPaperSize === '58mm' && styles.paperSizeTextActive
                                        ]}>
                                            58mm
                                        </TextNormal>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.paperSizeButton,
                                            billPaperSize === '80mm' && styles.paperSizeButtonActive
                                        ]}
                                        onPress={() => setBillPaperSize('80mm')}
                                    >
                                        <TextNormal style={[
                                            styles.paperSizeText,
                                            billPaperSize === '80mm' && styles.paperSizeTextActive
                                        ]}>
                                            80mm
                                        </TextNormal>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.paperSizeDescription}>
                                    Chọn kích thước giấy in phù hợp với máy in thermal của bạn
                                </Text>
                            </View>

                            {/* Font Size Settings for Bill Printer */}
                            <View style={styles.sectionHeader}>
                                <TextNormal style={styles.sectionTitle}>{"Cài đặt kích thước chữ"}</TextNormal>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Tiêu đề hóa đơn"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="24"
                                        value={billHeader.toString()}
                                        onChangeText={(text) => setBillHeader(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Nội dung hóa đơn"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="16"
                                        value={billContent.toString()}
                                        onChangeText={(text) => setBillContent(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextNormal style={styles.label}>{"Tổng cộng"}</TextNormal>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder="18"
                                        value={billTotal.toString()}
                                        onChangeText={(text) => setBillTotal(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.textSecondary}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>

                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleClose}
                    >
                        <Text style={styles.buttonText}>{"Hủy"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.buttonText}>
                            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '95%',
        maxWidth: 500,
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    modalContent: {
        marginBottom: 20,
        maxHeight: 400,
        flex: 0,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.whiteColor,
    },
    inputError: {
        borderColor: Colors.error,
    },
    input: {
        height: 45,
        paddingHorizontal: 12,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.bgInput,
    },
    saveButton: {
        backgroundColor: Colors.primary,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.whiteColor,
        fontSize: 16,
        fontWeight: '500',
    },
    toggleGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    toggleLabelContainer: {
        flex: 1,
        marginRight: 10,
    },
    toggleDescription: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.bgInput,
        borderRadius: 8,
        padding: 4,
        maxWidth: 200,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: Colors.whiteColor,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.textPrimary,
    },
    // Paper size selector styles
    paperSizeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    paperSizeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
    },
    paperSizeButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    paperSizeText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    paperSizeTextActive: {
        color: Colors.whiteColor,
        fontWeight: '600',
    },
    paperSizeDescription: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 8,
        fontStyle: 'italic',
    },
    // Connection type selector styles
    connectionTypeContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.bgInput,
        borderRadius: 8,
        padding: 4,
        maxWidth: 200,
    },
    connectionTypeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    connectionTypeButtonActive: {
        backgroundColor: Colors.whiteColor,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    connectionTypeText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    connectionTypeTextActive: {
        color: Colors.textPrimary,
    },
    // Device selector styles
    deviceSelectorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    scanButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    scanButtonDisabled: {
        opacity: 0.7,
    },
    scanButtonText: {
        color: Colors.whiteColor,
        fontSize: 14,
        fontWeight: '500',
    },
    deviceDropdown: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.whiteColor,
        minHeight: 45,
        justifyContent: 'center',
    },
    deviceList: {
        maxHeight: 150, // Adjust as needed
    },
    deviceItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    deviceItemSelected: {
        backgroundColor: Colors.primaryLight,
    },
    deviceItemText: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    deviceItemTextSelected: {
        color: Colors.whiteColor,
        fontWeight: '600',
    },
    noDeviceText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 10,
    },
    // Font size section styles
    sectionHeader: {
        marginTop: 20,
        marginBottom: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
});

export default PrinterSettingsModal;
