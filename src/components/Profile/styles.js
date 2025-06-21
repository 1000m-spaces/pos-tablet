import { StyleSheet, Dimensions } from 'react-native';
import Colors from 'theme/Colors';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColor,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 12,
        padding: 24,
        marginBottom: 20,
        elevation: 2,
        shadowColor: Colors.blackColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    profileIconContainer: {
        marginBottom: 16,
        padding: 20,
        backgroundColor: Colors.backgroundColor,
        borderRadius: 50,
    },
    username: {
        fontSize: 24,
        color: Colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    userRole: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    infoSection: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: Colors.blackColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    sectionTitle: {
        fontSize: 18,
        color: Colors.textPrimary,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.line,
        paddingBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.line,
    },
    infoLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
        flex: 1,
    },
    infoValue: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    shopItem: {
        backgroundColor: Colors.bgInput,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    shopName: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '600',
        marginBottom: 4,
    },
    shopId: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    logoutSection: {
        marginTop: 20,
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: Colors.error,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: Colors.blackColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
    },
    logoutText: {
        color: Colors.whiteColor,
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        backgroundColor: Colors.bgInput,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    statNumber: {
        fontSize: 24,
        color: Colors.primary,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default styles; 