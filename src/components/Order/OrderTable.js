import React, { useState } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Table, Row } from "react-native-table-component";
import ViewShot from "react-native-view-shot";
import PrintTemplate from "./TemTemplate";
import { Image } from "react-native";
import { useRef } from "react";
import FileViewer from 'react-native-file-viewer';

const { width, height } = Dimensions.get("window");
const tableWidth = width - 108; // Adjust width to leave space for left nav

const Badge = ({ text, color }) => (
    <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{text}</Text>
    </View>
);

const OrderTable = ({ orders }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const viewShotRef = useRef();
    const [image, setImage] = useState("")

    const tableHead = ["Đối tác", "Mã đơn hàng", "Tổng tiền", "Số món", "Tem", "Trạng thái đơn"];
    const numColumns = tableHead.length;
    const columnWidth = tableWidth / numColumns;
    const widthArr = Array(numColumns).fill(columnWidth);

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed": return "#4CAF50";
            case "Delivered": return "#2196F3";
            case "Cancelled": return "#F44336";
            default: return "#9E9E9E";
        }
    };

    const handleRowPress = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const printTem = () => {
        // on mount
        viewShotRef.current.capture().then(uri => {
            console.log("do something with ", uri);
            setImage(uri)
            FileViewer.open(uri)
                .then(() => {
                    console.log("Opened image successfully");
                })
                .catch(error => {
                    console.error("Failed to open image:", error);
                });
        });
    }

    const tableData = orders.map(order => [
        "GRAB",
        order.displayID,
        order.orderValue,
        order.itemInfo.count,
        <Badge text="chưa in" color="#FF9800" key={order.displayID + "_tem"} />,
        <Badge text={order.state} color={getStatusColor(order.state)} key={order.displayID + "_status"} />
    ]);

    return (
        <>
            <ScrollView horizontal>
                <ScrollView style={{ maxHeight: height * 0.6 }}>
                    <View style={{ width: tableWidth }}>
                        <Table borderStyle={styles.border}>
                            <Row data={tableHead} widthArr={widthArr} style={styles.head} textStyle={styles.textHead} />
                            {orders.map((order, index) => (
                                <TouchableOpacity key={index} onPress={() => handleRowPress(order)}>
                                    <Row data={tableData[index]} widthArr={widthArr} style={styles.row} textStyle={styles.text} />
                                </TouchableOpacity>
                            ))}
                        </Table>
                    </View>
                </ScrollView>
            </ScrollView>
            <Modal supportedOrientations={['portrait', 'landscape']} visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {image != "" && (<Image style={{ width: 380, height: 'auto', resizeMode: 'contain' }} source={{ uri: image }}></Image>)}
                        {selectedOrder && (
                            <>
                                <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                                <View style={styles.detailRow}><Text style={styles.label}>Mã đơn hàng:</Text><Text>{selectedOrder.displayID}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Tổng tiền:</Text><Text>{selectedOrder.orderValue}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Số món:</Text><Text>{selectedOrder.itemInfo.count}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Trạng thái:</Text><Badge text={selectedOrder.state} color={getStatusColor(selectedOrder.state)} /></View>
                                <Text style={styles.modalTitle}>Danh sách món</Text>
                                {selectedOrder.itemInfo.items.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                    </View>
                                ))}
                                <Pressable style={styles.printButton} onPress={() => printTem(selectedOrder)}>
                                    <Text style={styles.printButtonText}>Print Tem</Text>
                                </Pressable>
                                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>Đóng</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 1.0 }}
                style={{
                    position: 'absolute',
                    left: -400,
                    bottom: 0,
                    width: 400,
                    backgroundColor: 'white',
                }}>{selectedOrder && (<PrintTemplate orderPrint={selectedOrder} />)}</ViewShot>
        </>
    );
};

const styles = StyleSheet.create({
    border: {
        borderWidth: 1,
        borderColor: "#ddd",
    },
    head: {
        height: 40,
        backgroundColor: "#f0f0f0",
    },
    row: {
        height: 50,
    },
    textHead: {
        textAlign: "center",
        fontWeight: "bold",
    },
    text: {
        textAlign: "center",
        padding: 10,
    },
    badge: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignSelf: "center",
    },
    badgeText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 5,
    },
    label: {
        fontWeight: "bold",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 5,
    },
    itemName: {
        fontSize: 16,
    },
    itemQuantity: {
        fontSize: 16,
        fontWeight: "bold",
    },
    printButton: {
        marginTop: 15,
        backgroundColor: "#FF9800",
        padding: 10,
        borderRadius: 5,
    },
    printButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: "#2196F3",
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default OrderTable;