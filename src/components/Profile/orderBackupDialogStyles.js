import { StyleSheet } from 'react-native';
import Colors from 'theme/Colors';

export default StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 800,
        height: '85%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.backgroundSecondary,
    },
    title: {
        fontSize: 20,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    closeButton: {
        padding: 8,
    },
    actionBar: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.backgroundSecondary,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    selectAllButton: {
        flex: 1,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    actionButtonText: {
        fontSize: 13,
        color: Colors.primary,
    },
    syncButton: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    syncButtonText: {
        fontSize: 13,
        color: Colors.white,
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.error,
        paddingHorizontal: 12,
    },
    backupButton: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyIcon: {
        fontSize: 60,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    emptySubtext: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    orderList: {
        flex: 1,
    },
    orderItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.white,
    },
    orderItemSelected: {
        backgroundColor: Colors.primaryLight,
    },
    orderCheckbox: {
        justifyContent: 'flex-start',
        paddingTop: 2,
        marginRight: 12,
    },
    orderContent: {
        flex: 1,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderSession: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    syncStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    syncStatusText: {
        fontSize: 11,
        color: Colors.white,
        fontWeight: '600',
    },
    orderInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    orderInfoText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    customerName: {
        fontSize: 13,
        color: Colors.textPrimary,
        marginTop: 4,
    },
    retryInfo: {
        fontSize: 11,
        color: Colors.error,
        marginTop: 4,
        fontStyle: 'italic',
    },
});
