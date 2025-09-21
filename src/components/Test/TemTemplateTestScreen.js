import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    TextInput,
    Switch
} from 'react-native';
import BillTemplate from '../Order/BillTemplate';

const { width: screenWidth } = Dimensions.get('window');

const TemTemplateTestScreen = () => {
    // State for controlling the bill template
    const [selectedScenario, setSelectedScenario] = useState(0);
    const [orderData, setOrderData] = useState({
        displayID: "TEST001",
        session: "TEST001",
        tableName: "T12",
        createdAt: new Date().toISOString(),
        orderNote: "Test order note",
        staff: "Test Staff",
        paymentMethod: "Tiền mặt",
        service: "POS",
        total_amount: 85000,
        orderValue: 85000,
        shippingAddress: "",
        itemInfo: {
            items: [
                {
                    name: "Cà Phê Sữa Đá",
                    quantity: 2,
                    price: 30000,
                    note: "Ít đường",
                    modifierGroups: [
                        {
                            modifiers: [
                                { modifierName: "Size L" },
                                { modifierName: "Đá ít" }
                            ]
                        }
                    ]
                },
                {
                    name: "Bánh Mì Thịt Nướng",
                    quantity: 1,
                    price: 25000,
                    note: "Không hành",
                    modifierGroups: [
                        {
                            modifiers: [
                                { modifierName: "Extra Mayo" },
                                { modifierName: "Ít cay" }
                            ]
                        }
                    ]
                }
            ]
        }
    });

    // State for UI controls
    const [showModifiers, setShowModifiers] = useState(true);
    const [showNotes, setShowNotes] = useState(true);
    const [showShippingAddress, setShowShippingAddress] = useState(false);

    // Predefined test scenarios
    const testScenarios = [
        {
            title: "Simple Order",
            data: {
                displayID: "ORD001",
                tableName: "T12",
                staff: "John Doe",
                paymentMethod: "Tiền mặt",
                service: "POS",
                orderNote: "Test order",
                itemInfo: {
                    items: [
                        { name: "Cà Phê Đen", quantity: 1, price: 15000 },
                        { name: "Bánh Mì", quantity: 1, price: 20000 }
                    ]
                }
            }
        },
        {
            title: "Complex Order",
            data: {
                displayID: "ORD002",
                tableName: "T08",
                staff: "Jane Smith",
                paymentMethod: "Chuyển khoản",
                service: "Delivery",
                orderNote: "Birthday party order",
                shippingAddress: "123 Nguyễn Văn Linh, Q7, TP.HCM",
                itemInfo: {
                    items: [
                        {
                            name: "Pizza Margherita",
                            quantity: 2,
                            price: 150000,
                            note: "Extra cheese",
                            modifierGroups: [
                                {
                                    modifiers: [
                                        { modifierName: "Large" },
                                        { modifierName: "Thin crust" },
                                        { modifierName: "Extra cheese" }
                                    ]
                                }
                            ]
                        },
                        {
                            name: "Coca Cola",
                            quantity: 4,
                            price: 12000,
                            modifierGroups: [
                                {
                                    modifiers: [
                                        { modifierName: "Large" },
                                        { modifierName: "No ice" }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }
    ];

    // Helper functions
    const updateOrderField = (field, value) => {
        setOrderData(prev => ({ ...prev, [field]: value }));
    };

    const loadTestScenario = (scenarioIndex) => {
        if (testScenarios[scenarioIndex]) {
            const scenario = testScenarios[scenarioIndex];
            setOrderData(prev => ({
                ...prev,
                ...scenario.data,
                createdAt: new Date().toISOString(),
                orderValue: scenario.data.itemInfo.items.reduce((total, item) => total + (item.price * item.quantity), 0),
                total_amount: scenario.data.itemInfo.items.reduce((total, item) => total + (item.price * item.quantity), 0)
            }));
        }
    };

    const addNewItem = () => {
        const newItem = {
            name: "New Item",
            quantity: 1,
            price: 10000,
            note: "",
            modifierGroups: []
        };
        setOrderData(prev => ({
            ...prev,
            itemInfo: {
                ...prev.itemInfo,
                items: [...prev.itemInfo.items, newItem]
            }
        }));
    };

    const removeItem = (index) => {
        setOrderData(prev => ({
            ...prev,
            itemInfo: {
                ...prev.itemInfo,
                items: prev.itemInfo.items.filter((_, i) => i !== index)
            }
        }));
    };

    const updateItem = (index, field, value) => {
        setOrderData(prev => ({
            ...prev,
            itemInfo: {
                ...prev.itemInfo,
                items: prev.itemInfo.items.map((item, i) =>
                    i === index ? { ...item, [field]: value } : item
                )
            }
        }));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>BillTemplate Test Lab</Text>
                <Text style={styles.subtitle}>Interactive testing environment</Text>
            </View>

            {/* Main Content - Split Layout */}
            <View style={styles.mainContent}>
                {/* Left Panel - Controls */}
                <View style={styles.leftPanel}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Test Scenarios */}
                        <View style={styles.controlSection}>
                            <Text style={styles.controlTitle}>Quick Scenarios</Text>
                            {testScenarios.map((scenario, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.scenarioBtn,
                                        selectedScenario === index && styles.selectedScenarioBtn
                                    ]}
                                    onPress={() => {
                                        setSelectedScenario(index);
                                        loadTestScenario(index);
                                    }}
                                >
                                    <Text style={[
                                        styles.scenarioBtnText,
                                        selectedScenario === index && styles.selectedScenarioBtnText
                                    ]}>
                                        {scenario.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Order Information */}
                        <View style={styles.controlSection}>
                            <Text style={styles.controlTitle}>Order Information</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Order ID:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={orderData.displayID}
                                    onChangeText={(text) => updateOrderField('displayID', text)}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Table:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={orderData.tableName}
                                    onChangeText={(text) => updateOrderField('tableName', text)}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Staff:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={orderData.staff}
                                    onChangeText={(text) => updateOrderField('staff', text)}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Payment Method:</Text>
                                <View style={styles.paymentButtons}>
                                    {["Tiền mặt", "Chuyển khoản", "Thẻ tín dụng"].map((method) => (
                                        <TouchableOpacity
                                            key={method}
                                            style={[
                                                styles.paymentBtn,
                                                orderData.paymentMethod === method && styles.selectedPaymentBtn
                                            ]}
                                            onPress={() => updateOrderField('paymentMethod', method)}
                                        >
                                            <Text style={[
                                                styles.paymentBtnText,
                                                orderData.paymentMethod === method && styles.selectedPaymentBtnText
                                            ]}>
                                                {method}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Order Note:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={orderData.orderNote}
                                    onChangeText={(text) => updateOrderField('orderNote', text)}
                                    placeholder="Enter order note..."
                                />
                            </View>
                        </View>

                        {/* Display Options */}
                        <View style={styles.controlSection}>
                            <Text style={styles.controlTitle}>Display Options</Text>

                            <View style={styles.switchGroup}>
                                <Text style={styles.switchLabel}>Show Shipping Address</Text>
                                <Switch
                                    value={showShippingAddress}
                                    onValueChange={(value) => {
                                        setShowShippingAddress(value);
                                        if (value && !orderData.shippingAddress) {
                                            updateOrderField('shippingAddress', '123 Test Street, District 1, Ho Chi Minh City');
                                        } else if (!value) {
                                            updateOrderField('shippingAddress', '');
                                        }
                                    }}
                                />
                            </View>

                            {showShippingAddress && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Shipping Address:</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={orderData.shippingAddress}
                                        onChangeText={(text) => updateOrderField('shippingAddress', text)}
                                        placeholder="Enter shipping address..."
                                        multiline={true}
                                        numberOfLines={2}
                                    />
                                </View>
                            )}
                        </View>

                        {/* Items Management */}
                        <View style={styles.controlSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.controlTitle}>Items ({orderData.itemInfo.items.length})</Text>
                                <TouchableOpacity
                                    style={styles.addItemBtn}
                                    onPress={addNewItem}
                                >
                                    <Text style={styles.addItemBtnText}>+ Add</Text>
                                </TouchableOpacity>
                            </View>

                            {orderData.itemInfo.items.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <View style={styles.itemHeader}>
                                        <TextInput
                                            style={[styles.textInput, styles.itemNameInput]}
                                            value={item.name}
                                            onChangeText={(text) => updateItem(index, 'name', text)}
                                            placeholder="Item name"
                                        />
                                        <TouchableOpacity
                                            style={styles.removeItemBtn}
                                            onPress={() => removeItem(index)}
                                        >
                                            <Text style={styles.removeItemBtnText}>×</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.itemDetails}>
                                        <View style={styles.itemDetailRow}>
                                            <Text style={styles.itemDetailLabel}>Qty:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={String(item.quantity)}
                                                onChangeText={(text) => updateItem(index, 'quantity', parseInt(text) || 1)}
                                                keyboardType="numeric"
                                            />
                                            <Text style={styles.itemDetailLabel}>Price:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={String(item.price)}
                                                onChangeText={(text) => updateItem(index, 'price', parseInt(text) || 0)}
                                                keyboardType="numeric"
                                            />
                                        </View>

                                        {item.note !== undefined && (
                                            <TextInput
                                                style={styles.textInput}
                                                value={item.note}
                                                onChangeText={(text) => updateItem(index, 'note', text)}
                                                placeholder="Item note..."
                                            />
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Debug */}
                        <View style={styles.controlSection}>
                            <TouchableOpacity
                                style={styles.debugBtn}
                                onPress={() => {
                                    console.log('Current Order Data:', JSON.stringify(orderData, null, 2));
                                }}
                            >
                                <Text style={styles.debugBtnText}>Log Order Data</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

                {/* Right Panel - Bill Preview */}
                <View style={styles.rightPanel}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>Live Preview</Text>
                        <Text style={styles.previewSubtitle}>
                            Total: {orderData.itemInfo.items.reduce((total, item) =>
                                total + (item.price * item.quantity), 0).toLocaleString('vi-VN')}đ
                        </Text>
                    </View>

                    <ScrollView
                        style={styles.previewScrollView}
                        contentContainerStyle={styles.previewContent}
                        showsVerticalScrollIndicator={true}
                    >
                        <View style={styles.billWrapper}>
                            <BillTemplate selectedOrder={orderData} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
    },

    // Left Panel Styles
    leftPanel: {
        width: screenWidth * 0.4,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
    },
    controlSection: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    controlTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    // Scenario Buttons
    scenarioBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        marginBottom: 6,
    },
    selectedScenarioBtn: {
        backgroundColor: '#007AFF',
    },
    scenarioBtnText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    selectedScenarioBtnText: {
        color: '#fff',
        fontWeight: '600',
    },

    // Input Styles
    inputGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#fff',
    },

    // Payment Method Buttons
    paymentButtons: {
        flexDirection: 'column',
        gap: 6,
    },
    paymentBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        alignItems: 'center',
    },
    selectedPaymentBtn: {
        backgroundColor: '#007AFF',
    },
    paymentBtnText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    selectedPaymentBtnText: {
        color: '#fff',
    },

    // Switch Styles
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    switchLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },

    // Item Management
    addItemBtn: {
        backgroundColor: '#28a745',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    addItemBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    itemRow: {
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        padding: 10,
        marginBottom: 8,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemNameInput: {
        flex: 1,
        marginRight: 8,
    },
    removeItemBtn: {
        backgroundColor: '#dc3545',
        borderRadius: 4,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeItemBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemDetails: {
        gap: 6,
    },
    itemDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemDetailLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    smallInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontSize: 12,
        width: 60,
        backgroundColor: '#fff',
        textAlign: 'center',
    },

    // Debug Button
    debugBtn: {
        backgroundColor: '#6c757d',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 6,
        alignItems: 'center',
    },
    debugBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },

    // Right Panel Styles
    rightPanel: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    previewHeader: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    previewSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    previewScrollView: {
        flex: 1,
    },
    previewContent: {
        padding: 20,
        alignItems: 'center',
    },
    billWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default TemTemplateTestScreen;
