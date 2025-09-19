import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions
} from 'react-native';
import TemTemplate from '../Order/TemTemplate';

const { width: screenWidth } = Dimensions.get('window');

const TemTemplateTestScreen = () => {
    const [selectedScenario, setSelectedScenario] = useState(0);

    // Mock order data scenarios
    const mockOrderScenarios = [
        {
            title: "Dine-in Order with Multiple Items",
            data: {
                bill_id: "ORD001",
                displayID: "ORD001",
                table: "T12",
                chanel_type_id: "dine-in",
                date: new Date().toISOString(),
                note: "Extra spicy, no onions",
                decals: [
                    {
                        item_name: "Phở Bò Tái",
                        stringName: "Large / Extra Beef / Extra Noodles",
                        option: "Hot",
                        extrastring: "Special Broth",
                        note_prod: "Well done meat",
                        amount: 2,
                        price: 85000,
                        itemIdx: 0,
                        totalItems: 3
                    },
                    {
                        item_name: "Bánh Mì Thịt Nướng",
                        stringName: "Extra Mayo / No Cilantro",
                        option: "Toasted",
                        extrastring: "",
                        note_prod: "Cut in half",
                        amount: 1,
                        price: 25000,
                        itemIdx: 1,
                        totalItems: 3
                    },
                    {
                        item_name: "Cà Phê Sữa Đá",
                        stringName: "Less Ice",
                        option: "Strong",
                        extrastring: "Extra Milk",
                        note_prod: "",
                        amount: 2,
                        price: 15000,
                        itemIdx: 2,
                        totalItems: 3
                    }
                ]
            }
        },
        {
            title: "Delivery Order - Simple",
            data: {
                bill_id: "DEL456",
                displayID: "DEL456",
                table: "——",
                chanel_type_id: "delivery",
                date: new Date().toISOString(),
                note: "Ring doorbell twice",
                decals: [
                    {
                        item_name: "Gà Rán KFC Style",
                        stringName: "Original Recipe / 8 pieces",
                        option: "",
                        extrastring: "",
                        note_prod: "Extra crispy",
                        amount: 1,
                        price: 120000,
                        itemIdx: 0,
                        totalItems: 2
                    },
                    {
                        item_name: "Pepsi Cola",
                        stringName: "Large",
                        option: "Cold",
                        extrastring: "",
                        note_prod: "",
                        amount: 2,
                        price: 12000,
                        itemIdx: 1,
                        totalItems: 2
                    }
                ]
            }
        },
        {
            title: "Take-away Order - Complex Modifiers",
            data: {
                bill_id: "TO789",
                displayID: "TO789",
                table: "Counter",
                chanel_type_id: "offline",
                date: new Date().toISOString(),
                note: "",
                decals: [
                    {
                        item_name: "Pizza Margherita Supreme Ultra Deluxe With Extra Cheese",
                        stringName: "Medium / Extra Cheese / Thin Crust / Mushrooms / Bell Peppers / Olives",
                        option: "Half Spicy",
                        extrastring: "No Garlic / Extra Sauce",
                        note_prod: "Cut into 8 slices, well done crust, extra hot",
                        amount: 1,
                        price: 189000,
                        itemIdx: 0,
                        totalItems: 1
                    }
                ]
            }
        },
        {
            title: "Group Order - Many Items",
            data: {
                bill_id: "GRP123",
                displayID: "GRP123",
                table: "T08",
                chanel_type_id: "dine-in",
                date: new Date().toISOString(),
                note: "Birthday celebration table",
                decals: [
                    {
                        item_name: "Steak Wagyu A5",
                        stringName: "Medium Rare / Garlic Butter",
                        option: "Premium Cut",
                        extrastring: "Side Vegetables",
                        note_prod: "Birthday special",
                        amount: 1,
                        price: 450000,
                        itemIdx: 0,
                        totalItems: 6
                    },
                    {
                        item_name: "Lobster Thermidor",
                        stringName: "Grilled / Cheese Topping",
                        option: "",
                        extrastring: "",
                        note_prod: "",
                        amount: 2,
                        price: 380000,
                        itemIdx: 1,
                        totalItems: 6
                    },
                    {
                        item_name: "Wine Bordeaux Red",
                        stringName: "Vintage 2018 / Decanted",
                        option: "Room Temperature",
                        extrastring: "",
                        note_prod: "For celebration",
                        amount: 1,
                        price: 890000,
                        itemIdx: 2,
                        totalItems: 6
                    },
                    {
                        item_name: "Caesar Salad",
                        stringName: "Large / Extra Croutons / Parmesan",
                        option: "Fresh",
                        extrastring: "Chicken Strips",
                        note_prod: "",
                        amount: 3,
                        price: 65000,
                        itemIdx: 3,
                        totalItems: 6
                    },
                    {
                        item_name: "Tiramisu Cake",
                        stringName: "Slice / Extra Cream",
                        option: "Chilled",
                        extrastring: "Birthday Candle",
                        note_prod: "With sparkler",
                        amount: 1,
                        price: 75000,
                        itemIdx: 4,
                        totalItems: 6
                    },
                    {
                        item_name: "Espresso Double Shot",
                        stringName: "Strong / Sugar on Side",
                        option: "Hot",
                        extrastring: "",
                        note_prod: "",
                        amount: 4,
                        price: 18000,
                        itemIdx: 5,
                        totalItems: 6
                    }
                ]
            }
        },
        {
            title: "Minimal Order - No Modifiers",
            data: {
                bill_id: "MIN999",
                displayID: "MIN999",
                table: "——",
                chanel_type_id: "offline",
                date: new Date().toISOString(),
                note: "",
                decals: [
                    {
                        item_name: "Water",
                        stringName: "",
                        option: "",
                        extrastring: "",
                        note_prod: "",
                        amount: 1,
                        price: 0,
                        itemIdx: 0,
                        totalItems: 1
                    }
                ]
            }
        },
        {
            title: "Legacy Format - itemInfo Structure",
            data: {
                bill_id: "LEG555",
                displayID: "LEG555",
                table: "T05",
                chanel_type_id: "dine-in",
                date: new Date().toISOString(),
                note: "Old format test",
                itemInfo: {
                    items: [
                        {
                            name: "Burger Classic",
                            quantity: 2,
                            comment: "No pickles",
                            modifierGroups: [
                                {
                                    modifiers: [
                                        { modifierName: "Extra Cheese" },
                                        { modifierName: "Bacon" }
                                    ]
                                },
                                {
                                    modifiers: [
                                        { modifierName: "Large Fries" }
                                    ]
                                }
                            ]
                        },
                        {
                            name: "Soft Drink",
                            quantity: 2,
                            comment: "",
                            modifierGroups: [
                                {
                                    modifiers: [
                                        { modifierName: "Coca Cola" },
                                        { modifierName: "No Ice" }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }
    ];

    const currentOrder = mockOrderScenarios[selectedScenario];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>TemTemplate Test Screen</Text>
                <Text style={styles.subtitle}>Testing different order scenarios</Text>
            </View>

            {/* Scenario Selector */}
            <View style={styles.scenarioSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {mockOrderScenarios.map((scenario, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.scenarioButton,
                                selectedScenario === index && styles.selectedScenarioButton
                            ]}
                            onPress={() => setSelectedScenario(index)}
                        >
                            <Text style={[
                                styles.scenarioButtonText,
                                selectedScenario === index && styles.selectedScenarioButtonText
                            ]}>
                                {scenario.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Current Scenario Info */}
            <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioTitle}>{currentOrder.title}</Text>
                <Text style={styles.scenarioDetails}>
                    Order: {currentOrder.data.bill_id} |
                    Table: {currentOrder.data.table} |
                    Items: {currentOrder.data.decals?.length || currentOrder.data.itemInfo?.items?.length || 0}
                </Text>
            </View>

            {/* Template Preview */}
            <ScrollView style={styles.previewContainer}>
                <View style={styles.templateWrapper}>
                    <TemTemplate orderPrint={currentOrder.data} />
                </View>
            </ScrollView>

            {/* Order Data Debug */}
            <View style={styles.debugSection}>
                <TouchableOpacity
                    style={styles.debugToggle}
                    onPress={() => console.log('Current Order Data:', JSON.stringify(currentOrder.data, null, 2))}
                >
                    <Text style={styles.debugText}>
                        Tap to log order data to console
                    </Text>
                </TouchableOpacity>
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
        padding: 20,
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
    scenarioSelector: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    scenarioButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        minWidth: 120,
    },
    selectedScenarioButton: {
        backgroundColor: '#007AFF',
    },
    scenarioButtonText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedScenarioButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    scenarioInfo: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    scenarioTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    scenarioDetails: {
        fontSize: 14,
        color: '#666',
    },
    previewContainer: {
        flex: 1,
        padding: 20,
    },
    templateWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    debugSection: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    debugToggle: {
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    debugText: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
    },
});

export default TemTemplateTestScreen;
