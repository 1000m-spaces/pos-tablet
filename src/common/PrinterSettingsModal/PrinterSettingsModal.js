import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, Switch, TouchableOpacity, Platform } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import AsyncStorage from 'store/async_storage/index';
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';

const PrinterSettingsModal = ({
    visible,
    onClose,
    initialPrinterType = 'label',
    onSettingsSaved
}) => {
    // Printer settings state
    const [ip, setIP] = useState("");
    const [sWidth, setSWidth] = useState(50);
    const [sHeight, setSHeight] = useState(30);
    const [autoPrint, setAutoPrint] = useState(false);

    // Bill printer settings
    const [billIP, setBillIP] = useState("");
    const [billPort, setBillPort] = useState(9100);
    const [billPaperSize, setBillPaperSize] = useState('80mm'); // 58mm, 80mm

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [printerType, setPrinterType] = useState(initialPrinterType); // 'label' or 'bill'

    // Load printer settings when modal opens
    useEffect(() => {
        if (visible) {
            loadPrinterSettings();
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
            }

            // Load bill printer settings
            const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();
            if (billPrinterInfo) {
                setBillIP(billPrinterInfo.billIP || "");
                setBillPort(billPrinterInfo.billPort || 9100);
                setBillPaperSize(billPrinterInfo.billPaperSize || '80mm');
            }
        } catch (error) {
            console.error('Error loading printer settings:', error);
        }
    };

    // Printer validation - only validate active tab
    const validateForm = () => {
        const newErrors = {};

        if (printerType === 'label') {
            // Validate label printer settings only
            if (!ip) {
                newErrors.ip = 'Vui lòng nhập địa chỉ IP máy in tem';
            } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                newErrors.ip = 'Định dạng địa chỉ IP không hợp lệ';
            }
            if (!sWidth || isNaN(sWidth) || sWidth <= 0) {
                newErrors.sWidth = 'Chiều rộng tem phải là số dương';
            }
            if (!sHeight || isNaN(sHeight) || sHeight <= 0) {
                newErrors.sHeight = 'Chiều cao tem phải là số dương';
            }
        } else if (printerType === 'bill') {
            // Validate bill printer settings only
            if (!billIP) {
                newErrors.billIP = 'Vui lòng nhập địa chỉ IP máy in bill';
            } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(billIP)) {
                newErrors.billIP = 'Định dạng địa chỉ IP không hợp lệ';
            }
            if (!billPort || isNaN(billPort) || billPort <= 0 || billPort > 65535) {
                newErrors.billPort = 'Port phải là số từ 1-65535';
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

                // Bill printer settings
                billIP: billIP,
                billPort: parseInt(billPort),
                billPaperSize: billPaperSize
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

                <View style={styles.modalContent}>
                    {printerType === 'label' ? (
                        // Label Printer Settings
                        <>
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
                        </>
                    ) : (
                        // Bill Printer Settings
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
                        </>
                    )}
                </View>

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
});

export default PrinterSettingsModal;
