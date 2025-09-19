import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import XPrinterOrderExample from '../../print/print';
import TemTemplateTestScreen from './TemTemplateTestScreen';
import { useDispatch } from 'react-redux';
import { getOrderChannelsAction } from 'store/payment/paymentAction';

// Test app selector component
const TestAppSelector = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getOrderChannelsAction());
    }, [dispatch]);
    const [selectedTest, setSelectedTest] = useState('template');

    const renderSelectedTest = () => {
        switch (selectedTest) {
            case 'printer':
                return <XPrinterOrderExample />;
            case 'template':
                return <TemTemplateTestScreen />;
            default:
                return <TemTemplateTestScreen />;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.selector}>
                <TouchableOpacity
                    style={[styles.button, selectedTest === 'template' && styles.selectedButton]}
                    onPress={() => setSelectedTest('template')}
                >
                    <Text style={[styles.buttonText, selectedTest === 'template' && styles.selectedButtonText]}>
                        Template Test
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, selectedTest === 'printer' && styles.selectedButton]}
                    onPress={() => setSelectedTest('printer')}
                >
                    <Text style={[styles.buttonText, selectedTest === 'printer' && styles.selectedButtonText]}>
                        Printer Test
                    </Text>
                </TouchableOpacity>
            </View>
            {renderSelectedTest()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    selector: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: 5,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        color: '#495057',
        fontWeight: '500',
    },
    selectedButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default TestAppSelector;
