import React, { useState } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextNormal } from 'common/Text/TextFont';
import Colors from 'theme/Colors';

const FilterRow = ({ selectedDate, onDateChange }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (event, date) => {
        if (Platform.OS !== 'ios') {
            setShowDatePicker(false);
        }
        if (date) {
            onDateChange(date);
        }
    };

    return (
        <View style={styles.dateFilterRow}>
            <TouchableOpacity
                style={styles.dateFilterButton}
                onPress={() => setShowDatePicker(true)}
            >
                <TextNormal style={styles.dateFilterText}>
                    {selectedDate.toLocaleDateString('vi-VN')}
                </TextNormal>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dateFilterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    dateFilterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: Colors.whiteColor,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        minWidth: 100,
        alignItems: 'center',
    },
    dateFilterText: {
        fontSize: 12,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
});

export default FilterRow; 