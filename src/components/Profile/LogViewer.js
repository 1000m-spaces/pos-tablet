import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Platform,
    TextInput,
    Clipboard,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
    TextNormal,
    TextSemiBold,
} from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import logService, { LOG_CATEGORIES, CATEGORY_LABELS } from '../../services/LogService';

const LEVEL_COLORS = {
    info: '#3498DB',
    warn: '#F39C12',
    error: '#E74C3C',
};

const getLocalDateString = (date = new Date()) => {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date; // Already formatted YYYY-MM-DD
    }
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDate, setSelectedDate] = useState(null); // null = today
    const [selectedTimeBlock, setSelectedTimeBlock] = useState('all'); // 'all', '0-6', '6-12', '12-18', '18-24'
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState(null);

    // Load available dates
    const loadDates = useCallback(async () => {
        const dates = await logService.getAvailableDates();
        setAvailableDates(dates);
    }, []);

    // Load logs cho category + date hiện tại
    const loadLogs = useCallback(async () => {
        setIsLoading(true);
        setExpandedIndex(null);
        try {
            const date = selectedDate || new Date();
            let entries;
            if (selectedCategory === 'all') {
                entries = await logService.readAllLogs(date);
            } else {
                entries = await logService.readLogs(selectedCategory, date);
            }
            let filteredByTime = entries;
            // Lọc theo khung giờ để giảm tải bộ nhớ
            if (selectedTimeBlock !== 'all') {
                const [startHour, endHour] = selectedTimeBlock.split('-').map(Number);
                filteredByTime = entries.filter(entry => {
                    try {
                        const hour = new Date(entry.t).getHours();
                        return hour >= startHour && hour < endHour;
                    } catch {
                        return true;
                    }
                });
            }

            // Mới nhất trước
            setLogs(filteredByTime.reverse());
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, selectedDate, selectedTimeBlock]);

    useEffect(() => {
        logService.init().then(() => {
            loadDates();
            loadLogs();
        });
    }, []);

    useEffect(() => {
        loadLogs();
    }, [selectedCategory, selectedDate, selectedTimeBlock]);

    // Filter logs theo search query
    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs;
        const q = searchQuery.toLowerCase();
        return logs.filter(entry => {
            const message = (entry.m || '').toLowerCase();
            const time = (entry.t || '').toLowerCase();
            const data = entry.d ? JSON.stringify(entry.d).toLowerCase() : '';
            return message.includes(q) || time.includes(q) || data.includes(q);
        });
    }, [logs, searchQuery]);

    const handleExport = async () => {
        try {
            const date = selectedDate || getLocalDateString();
            const cat = selectedCategory === 'all' ? null : selectedCategory;
            await logService.exportLogs(cat, date);
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể xuất log');
        }
    };

    const handleExportAll = async () => {
        try {
            await logService.exportLogs(null, selectedDate);
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể xuất log');
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    const copyLogEntry = (entry) => {
        const copyText = [
            `[${entry.t}] [${entry.l?.toUpperCase()}]`,
            entry.m,
            entry.d ? JSON.stringify(entry.d, null, 2) : '',
        ].filter(Boolean).join('\n');

        Clipboard.setString(copyText);
        Toast.show({
            type: 'success',
            text1: 'Đã copy log',
            text2: entry.m?.substring(0, 50),
            position: 'top',
            visibilityTime: 1500,
        });
    };

    const renderLogEntry = ({ item, index }) => {
        const isExpanded = expandedIndex === index;
        const levelColor = LEVEL_COLORS[item.l] || '#888';

        return (
            <TouchableOpacity
                style={[
                    styles.logEntry,
                    { borderLeftColor: levelColor },
                ]}
                onPress={() => setExpandedIndex(isExpanded ? null : index)}
                activeOpacity={0.7}
            >
                <View style={styles.logHeader}>
                    <TextNormal style={styles.logTime}>
                        {formatTime(item.t)}
                    </TextNormal>
                    <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
                        <TextNormal style={[styles.levelText, { color: levelColor }]}>
                            {item.l?.toUpperCase()}
                        </TextNormal>
                    </View>
                    {/* Nút Copy — luôn hiển thị */}
                    <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => copyLogEntry(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <TextNormal style={styles.copyBtnText}>📋</TextNormal>
                    </TouchableOpacity>
                </View>
                <TextNormal
                    style={styles.logMessage}
                    numberOfLines={isExpanded ? undefined : 2}
                >
                    {item.m}
                </TextNormal>
                {isExpanded && item.d && (
                    <View style={styles.logData}>
                        <TextNormal style={styles.logDataText}>
                            {typeof item.d === 'string'
                                ? item.d
                                : JSON.stringify(item.d, null, 2)}
                        </TextNormal>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const todayStr = getLocalDateString();

    const TIME_BLOCKS = [
        { id: 'all', label: 'Cả ngày' },
        { id: '0-6', label: '0h - 6h' },
        { id: '6-12', label: '6h - 12h' },
        { id: '12-18', label: '12h - 18h' },
        { id: '18-24', label: '18h - 24h' },
    ];

    return (
        <View style={styles.container}>
            {/* ============ CATEGORY TABS ============ */}
            <View style={styles.categoryBar}>
                {/* Tab Tất cả */}
                <TouchableOpacity
                    style={[
                        styles.categoryTab,
                        selectedCategory === 'all' && styles.categoryTabActive,
                    ]}
                    onPress={() => setSelectedCategory('all')}
                >
                    <TextNormal
                        style={[
                            styles.categoryText,
                            selectedCategory === 'all' && styles.categoryTextActive,
                        ]}
                    >
                        📋 Tất cả
                    </TextNormal>
                </TouchableOpacity>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.categoryTab,
                            selectedCategory === key && styles.categoryTabActive,
                        ]}
                        onPress={() => setSelectedCategory(key)}
                    >
                        <TextNormal
                            style={[
                                styles.categoryText,
                                selectedCategory === key && styles.categoryTextActive,
                            ]}
                        >
                            {label}
                        </TextNormal>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ============ DATE SELECTOR ============ */}
            <View style={styles.dateBar}>
                <FlatList
                    horizontal
                    data={[
                        { date: null, label: 'Hôm nay' },
                        ...availableDates
                            .filter(d => d !== todayStr)
                            .slice(0, 9)
                            .map(d => ({ date: d, label: d })),
                    ]}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.dateBtn,
                                (selectedDate === item.date) && styles.dateBtnActive,
                            ]}
                            onPress={() => setSelectedDate(item.date)}
                        >
                            <TextNormal style={[
                                styles.dateText,
                                (selectedDate === item.date) && styles.dateTextActive,
                            ]}>
                                {item.label}
                            </TextNormal>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, i) => item.date || `today-${i}`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateBtnList}
                />
            </View>

            {/* ============ TIME BLOCK SELECTOR ============ */}
            <View style={styles.timeBlockBar}>
                <FlatList
                    horizontal
                    data={TIME_BLOCKS}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.timeBlockBtn,
                                (selectedTimeBlock === item.id) && styles.timeBlockBtnActive,
                            ]}
                            onPress={() => setSelectedTimeBlock(item.id)}
                        >
                            <TextNormal style={[
                                styles.timeBlockText,
                                (selectedTimeBlock === item.id) && styles.timeBlockTextActive,
                            ]}>
                                {item.label}
                            </TextNormal>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeBlockBtnList}
                />
            </View>

            {/* ============ SEARCH + ACTIONS ============ */}
            <View style={styles.searchBar}>
                <View style={styles.searchInputWrapper}>
                    <TextNormal style={styles.searchIcon}>🔍</TextNormal>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm theo API, thời gian, nội dung..."
                        placeholderTextColor="#AAA"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <TextNormal style={styles.clearBtn}>✕</TextNormal>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                    <TextNormal style={styles.exportBtnText}>📤</TextNormal>
                </TouchableOpacity>

                <View style={styles.countBadge}>
                    <TextSemiBold style={styles.countText}>
                        {filteredLogs.length}
                    </TextSemiBold>
                </View>
            </View>

            {/* ============ LOG LIST ============ */}
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <TextNormal style={styles.loadingText}>Đang tải log...</TextNormal>
                </View>
            ) : (
                <FlatList
                    data={filteredLogs}
                    renderItem={renderLogEntry}
                    keyExtractor={(item, index) => `${item.t}-${index}`}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={30}
                    maxToRenderPerBatch={20}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <TextNormal style={styles.emptyText}>
                                {searchQuery
                                    ? `Không tìm thấy log cho "${searchQuery}"`
                                    : `Không có log ${CATEGORY_LABELS[selectedCategory]} nào`}
                            </TextNormal>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#888',
        fontSize: 13,
    },

    // ======= CATEGORY TABS =======
    categoryBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    categoryTab: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 4,
    },
    categoryTabActive: {
        backgroundColor: Colors.primary + '15',
    },
    categoryText: {
        fontSize: 12,
        color: '#888',
    },
    categoryTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },

    // ======= DATE SELECTOR =======
    dateBar: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    dateBtnList: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    dateBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        backgroundColor: '#F0F0F0',
        marginRight: 6,
    },
    dateBtnActive: {
        backgroundColor: Colors.primary,
    },
    dateText: {
        fontSize: 11,
        color: '#666',
    },
    dateTextActive: {
        color: '#fff',
        fontWeight: '600',
    },

    // ======= TIME BLOCK SELECTOR =======
    timeBlockBar: {
        backgroundColor: '#F9F9F9',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    timeBlockBtnList: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    timeBlockBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#EAEAEA',
        marginRight: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    timeBlockBtnActive: {
        backgroundColor: '#E8F4FD',
        borderColor: Colors.primary,
    },
    timeBlockText: {
        fontSize: 11,
        color: '#666',
    },
    timeBlockTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },

    // ======= SEARCH BAR =======
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 8,
        height: 34,
    },
    searchIcon: {
        fontSize: 12,
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 12,
        color: '#333',
        paddingVertical: 0,
        height: 34,
    },
    clearBtn: {
        fontSize: 14,
        color: '#999',
        paddingHorizontal: 4,
    },
    exportBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: '#E8F8F0',
        marginLeft: 6,
    },
    exportBtnText: {
        fontSize: 16,
    },
    countBadge: {
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginLeft: 6,
    },
    countText: {
        fontSize: 11,
        color: Colors.primary,
    },

    // ======= LOG LIST =======
    listContent: {
        padding: 6,
        paddingBottom: 40,
    },
    logEntry: {
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 3,
        padding: 8,
        borderLeftWidth: 3,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    logTime: {
        fontSize: 10,
        color: '#999',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginRight: 6,
    },
    levelBadge: {
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 3,
    },
    levelText: {
        fontSize: 9,
        fontWeight: '700',
    },
    copyBtn: {
        marginLeft: 'auto',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#F0F0F0',
    },
    copyBtnText: {
        fontSize: 12,
    },
    logMessage: {
        fontSize: 12,
        color: '#333',
        lineHeight: 17,
    },
    logData: {
        marginTop: 4,
        backgroundColor: '#F8F8F8',
        borderRadius: 4,
        padding: 6,
    },
    logDataText: {
        fontSize: 10,
        color: '#555',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        lineHeight: 15,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#999',
        fontSize: 13,
    },
});

export default LogViewer;
