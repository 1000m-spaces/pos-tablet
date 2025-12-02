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
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [showShippingAddress, setShowShippingAddress] = useState(false);

    // Sample JSON objects
    const sampleJsonObjects = [
        {
            title: "Online Order (Object 1)",
            json: `{
    "displayID": "2660658",
    "state": "ORDER_CREATED",
    "orderValue": "39.000",
    "itemInfo": {
        "items": [
            {
                "name": "Trà Trái Cây",
                "quantity": 1,
                "comment": "",
                "modifierGroups": [
                    {
                        "modifierGroupName": "Nhiệt độ",
                        "modifiers": [
                            {
                                "modifierName": "Đá chung",
                                "modifierPrice": "0"
                            }
                        ]
                    }
                ],
                "fare": {
                    "priceDisplay": "55.000",
                    "currencySymbol": "₫"
                }
            },
            {
                "name": "Bơ Già Dừa Non",
                "quantity": 1,
                "comment": "",
                "modifierGroups": [],
                "fare": {
                    "priceDisplay": "59.000",
                    "currencySymbol": "₫"
                }
            }
        ]
    },
    "eater": {
        "name": "Đơn hàng Online-Shipping",
        "mobileNumber": "+84898480926",
        "comment": "",
        "address": {
            "address": ""
        }
    },
    "service": "APP",
    "source": "app_order"
}`
        },
        {
            title: "Offline Order (Object 2)",
            json: `{
    "price_paid": 276000,
    "svFee": "0",
    "svFee_amount": 0,
    "shopTableid": "28685",
    "shoptablename": "Thẻ 15",
    "orderNote": "",
    "products": [
        {
            "prodid": 7849,
            "price": 59000,
            "prodprice": 59000,
            "rate_discount": 0,
            "opt1": 757,
            "opt2": null,
            "opt3": null,
            "option": [
                {
                    "optdetailid": 757,
                    "optdetailname": "100% ngọt",
                    "stat": 1
                }
            ],
            "extras": [
                {
                    "id": 7883,
                    "quantity": 1,
                    "name": "Đá chung",
                    "idcha": 0,
                    "isExtra": 1,
                    "price": 0,
                    "amount": 0,
                    "group_extra_id": 4,
                    "group_extra_name": "Nhiệt độ",
                    "group_type": 1
                },
                {
                    "id": 7939,
                    "quantity": 1,
                    "name": "Trân châu Hồng Sen + Trà Xanh",
                    "idcha": 0,
                    "isExtra": 1,
                    "price": 10000,
                    "amount": 10000,
                    "group_extra_id": 6,
                    "group_extra_name": "Topping (không áp dụng cho voucher đồng giá)",
                    "group_type": 0
                }
            ],
            "name": "Shan Vàng Kiều Mạch - 1000M Đổ Đèo",
            "amount": 276000,
            "note": "tesssss",
            "typeOrder": "Tại quầy",
            "quanlity": 4
        }
    ],
    "cust_id": 0,
    "transType": "41",
    "chanel_type_id": "1",
    "phuthu": 0,
    "total_amount": 276000,
    "fix_discount": 0,
    "perDiscount": 0,
    "session": "M-0001",
    "offlineOrderId": "M-0001",
    "offline_code": "M-0001",
    "shopid": "248",
    "userid": "1780",
    "roleid": "4",
    "timestamp": "2025-09-21T14:43:22.779Z",
    "status": "pending",
    "orderStatus": "Paymented",
    "tableId": "28685",
    "created_at": "2025-09-21T14:43:22.779Z",
    "syncStatus": "synced",
    "error_reason": "",
    "failed_at": "2025-09-21T14:43:22.884Z",
    "retry_count": 0,
    "updated_at": "2025-09-21T14:43:32.050Z",
    "synced_at": "2025-09-21T14:43:32.050Z",
    "printStatus": "not_printed",
    "displayID": "M-0001",
    "orderValue": 276000,
    "itemInfo": {
        "items": [
            {
                "name": "Shan Vàng Kiều Mạch - 1000M Đổ Đèo",
                "quantity": 4,
                "fare": {
                    "priceDisplay": "59.000",
                    "currencySymbol": "₫"
                },
                "comment": "tesssss",
                "modifierGroups": [
                    {
                        "modifierGroupName": "Nhiệt độ",
                        "modifiers": [
                            {
                                "modifierName": "Đá chung",
                                "price": 0
                            }
                        ]
                    },
                    {
                        "modifierGroupName": "Topping (không áp dụng cho voucher đồng giá)",
                        "modifiers": [
                            {
                                "modifierName": "Trân châu Hồng Sen + Trà Xanh",
                                "price": 10000
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "customerInfo": {
        "name": "Thẻ 15"
    },
    "serviceType": "offline",
    "tableName": "Thẻ 15"
}`
        }
    ];

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

    // JSON parsing and normalization functions
    const parsePrice = (priceStr) => {
        if (typeof priceStr === 'number') return priceStr;
        if (typeof priceStr === 'string') {
            return parseInt(priceStr.replace(/[.,]/g, '')) || 0;
        }
        return 0;
    };

    const normalizeJsonToOrderData = (jsonObj) => {
        let normalizedData = {
            displayID: jsonObj.displayID || jsonObj.session,
            session: jsonObj.session || jsonObj.displayID,
            tableName: jsonObj.tableName || jsonObj.shoptablename || (jsonObj.customerInfo?.name),
            createdAt: jsonObj.created_at || jsonObj.timestamp || new Date().toISOString(),
            orderNote: jsonObj.orderNote || "",
            staff: "System Staff",
            paymentMethod: "Tiền mặt",
            service: jsonObj.service || jsonObj.serviceType || "POS",
            shippingAddress: jsonObj.eater?.address?.address || "",
            itemInfo: { items: [] }
        };

        // Handle different JSON structures
        let items = [];

        // Structure 1: Has itemInfo.items directly (online orders)
        if (jsonObj.itemInfo?.items) {
            items = jsonObj.itemInfo.items.map(item => {
                const price = item.fare ? parsePrice(item.fare.priceDisplay) : parsePrice(item.price);
                return {
                    name: item.name,
                    quantity: item.quantity,
                    price: price,
                    note: item.comment || item.note || "",
                    modifierGroups: item.modifierGroups?.map(group => ({
                        modifierGroupName: group.modifierGroupName,
                        modifiers: group.modifiers?.map(modifier => ({
                            modifierName: modifier.modifierName,
                            price: parsePrice(modifier.modifierPrice || modifier.price || 0)
                        })) || []
                    })) || []
                };
            });
        }

        // Structure 2: Has products array (offline orders)
        else if (jsonObj.products) {
            items = jsonObj.products.map(product => {
                const modifierGroups = [];

                // Handle extras as modifier groups
                if (product.extras?.length > 0) {
                    const groupedExtras = {};
                    product.extras.forEach(extra => {
                        if (!groupedExtras[extra.group_extra_name]) {
                            groupedExtras[extra.group_extra_name] = [];
                        }
                        groupedExtras[extra.group_extra_name].push({
                            modifierName: extra.name,
                            price: extra.price || 0
                        });
                    });

                    Object.keys(groupedExtras).forEach(groupName => {
                        modifierGroups.push({
                            modifierGroupName: groupName,
                            modifiers: groupedExtras[groupName]
                        });
                    });
                }

                return {
                    name: product.name,
                    quantity: product.quanlity || product.quantity || 1,
                    price: product.prodprice || product.price || 0,
                    note: product.note || "",
                    modifierGroups: modifierGroups
                };
            });
        }

        normalizedData.itemInfo.items = items;

        // Calculate totals
        const totalAmount = items.reduce((sum, item) => {
            const itemTotal = (item.price * item.quantity);
            const modifierTotal = item.modifierGroups?.reduce((modSum, group) =>
                modSum + (group.modifiers?.reduce((modGroupSum, mod) =>
                    modGroupSum + (mod.price || 0), 0) || 0), 0) || 0;
            return sum + itemTotal + (modifierTotal * item.quantity);
        }, 0);

        normalizedData.total_amount = jsonObj.total_amount || jsonObj.orderValue ? parsePrice(jsonObj.orderValue) : totalAmount;
        normalizedData.orderValue = normalizedData.total_amount;

        // Set service info based on JSON structure
        if (jsonObj.eater?.name) {
            normalizedData.service = jsonObj.service === "APP" ? "Delivery" : "POS";
            if (jsonObj.eater.address?.address) {
                normalizedData.shippingAddress = jsonObj.eater.address.address;
            }
        }

        return normalizedData;
    };

    const loadJsonData = () => {
        setJsonError('');
        if (!jsonInput.trim()) {
            setJsonError('Please enter JSON data');
            return;
        }

        try {
            const jsonObj = JSON.parse(jsonInput);
            const normalizedData = normalizeJsonToOrderData(jsonObj);
            setOrderData(normalizedData);
            console.log('Loaded JSON Data:', normalizedData);
        } catch (error) {
            setJsonError('Invalid JSON format: ' + error.message);
        }
    };

    const loadSampleJson = (index) => {
        if (sampleJsonObjects[index]) {
            const jsonData = sampleJsonObjects[index].json;
            setJsonInput(jsonData);
            setJsonError('');

            try {
                const jsonObj = JSON.parse(jsonData);
                const normalizedData = normalizeJsonToOrderData(jsonObj);
                setOrderData(normalizedData);
                console.log('Loaded Sample JSON Data:', normalizedData);
            } catch (error) {
                setJsonError('Invalid JSON format: ' + error.message);
            }
        }
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
                        {/* JSON Input Section */}
                        <View style={styles.controlSection}>
                            <Text style={styles.controlTitle}>JSON Input</Text>

                            {/* Sample JSON buttons */}
                            <View style={styles.jsonSampleButtons}>
                                {sampleJsonObjects.map((sample, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.sampleJsonBtn}
                                        onPress={() => loadSampleJson(index)}
                                    >
                                        <Text style={styles.sampleJsonBtnText}>
                                            {sample.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* JSON input text area */}
                            <TextInput
                                style={styles.jsonTextInput}
                                multiline={true}
                                numberOfLines={8}
                                value={jsonInput}
                                onChangeText={setJsonInput}
                                placeholder="Paste your JSON object here..."
                                placeholderTextColor="#999"
                            />

                            {/* Load JSON button */}
                            <TouchableOpacity
                                style={styles.loadJsonBtn}
                                onPress={loadJsonData}
                            >
                                <Text style={styles.loadJsonBtnText}>Load JSON Data</Text>
                            </TouchableOpacity>

                            {/* Error display */}
                            {jsonError ? (
                                <Text style={styles.jsonError}>{jsonError}</Text>
                            ) : null}

                            {/* Clear button */}
                            <TouchableOpacity
                                style={styles.clearJsonBtn}
                                onPress={() => {
                                    setJsonInput('');
                                    setJsonError('');
                                }}
                            >
                                <Text style={styles.clearJsonBtnText}>Clear JSON</Text>
                            </TouchableOpacity>
                        </View>

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

    // JSON Input Styles
    jsonSampleButtons: {
        flexDirection: 'column',
        gap: 6,
        marginBottom: 12,
    },
    sampleJsonBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#e8f4f8',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    sampleJsonBtnText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500',
        textAlign: 'center',
    },
    jsonTextInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 12,
        backgroundColor: '#fff',
        fontFamily: 'monospace',
        textAlignVertical: 'top',
        minHeight: 120,
        marginBottom: 8,
    },
    loadJsonBtn: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 8,
    },
    loadJsonBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    clearJsonBtn: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    clearJsonBtnText: {
        color: '#6c757d',
        fontSize: 12,
        fontWeight: '500',
    },
    jsonError: {
        color: '#dc3545',
        fontSize: 12,
        marginBottom: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#f8d7da',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#f5c6cb',
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
