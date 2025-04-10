import React, { useState, useEffect } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Modal, Pressable, Platform, Image } from "react-native";
import { Table, Row } from "react-native-table-component";
import ViewShot from "react-native-view-shot";
import PrintTemplate from "./TemTemplate";
import { useRef } from "react";
import AsyncStorage from 'store/async_storage/index'
import BillTemplate from "./BillTemplate";
import Toast from 'react-native-toast-message'
import Spinner from 'react-native-loading-spinner-overlay';
import { netConnect, printBitmap } from 'rn-xprinter';
import ImageEditor from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';

const { width, height } = Dimensions.get("window");
const tableWidth = width - 108; // Adjust width to leave space for left nav

const Badge = ({ text, color }) => (
    <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{text}</Text>
    </View>
);


const splitImageByHeight = async (uri, imageHeight, chunkHeight, imageWidth) => {
    const chunks = [];

    for (let y = 0; y < imageHeight; y += chunkHeight) {
        const cropData = {
            offset: { x: 0, y },
            size: {
                width: imageWidth,
                height: Math.min(chunkHeight, imageHeight - y),
            },
            displaySize: {
                width: imageWidth,
                height: Math.min(chunkHeight, imageHeight - y),
            },
            resizeMode: 'contain',
        };

        const croppedUri = await ImageEditor.cropImage(uri, cropData);
        chunks.push(croppedUri);
    }

    return chunks;
};

const OrderTable = ({ orders, showSettingPrinter }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const viewTemShotRef = useRef();
    const viewBillShotRef = useRef();

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
        if (Platform.OS != "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            })
            return
        }
        setLoadingVisible(true)
        viewTemShotRef.current.capture().then(async (uri) => {
            try {
                const imageInfo = await Image.getSize(uri);
                const chunks = await splitImageByHeight(uri, imageInfo.height, 500, imageInfo.width);
                console.log("chunks", chunks);
                AsyncStorage.getPrinterInfo().then(async (printerInfo) => {
                    if (printerInfo == null || printerInfo.IP === "") {
                        setLoadingVisible(false)
                        Toast.show({
                            type: 'error',
                            text1: 'Vui lòng thiết lập máy in'
                        })
                        showSettingPrinter()
                        return
                    }
                    await netConnect(printerInfo.IP)
                    for (chunk in chunks) {
                        const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');
                        printBitmap(base64, 1, 554, 0)
                    }
                    setLoadingVisible(false)
                    Toast.show({
                        type: 'success',
                        text1: 'In tem thành công'
                    })
                }).catch(() => {
                    setLoadingVisible(false)
                    Toast.show({
                        type: 'error',
                        text1: 'Vui lòng thiết lập máy in'
                    })
                    showSettingPrinter()
                })
            } catch (e) {
                console.error(e)
            }


        }).catch((err) => {
            setLoadingVisible(false)
            Toast.show({
                type: 'error',
                text1: 'Lỗi ' + err
            })
        });
    }

    const printBill = () => {
        if (Platform.OS != "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            })
            return
        }
        setLoadingVisible(true)
        viewBillShotRef.current.capture().then(imageData => {
            AsyncStorage.getPrinterInfo().then((printerInfo) => {
                if (printerInfo == null || printerInfo.IP === "") {
                    setLoadingVisible(false)
                    Toast.show({
                        type: 'error',
                        text1: 'Vui lòng thiết lập máy in'
                    })
                    showSettingPrinter()
                    return
                }
                netConnect(printerInfo.IP).then(() => {
                    printBitmap(imageData, 1, 554, 0)
                    setLoadingVisible(false)
                    Toast.show({
                        type: 'success',
                        text1: 'In hoá đơn thành công'
                    })
                }).catch((err) => {
                    setLoadingVisible(false)
                    Toast.show({
                        type: 'error',
                        text1: 'Lỗi ' + err
                    })
                })
            }).catch(() => {
                setLoadingVisible(false)
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng thiết lập máy in'
                })
                showSettingPrinter()
            })
        }).catch((err) => {
            setLoadingVisible(false)
            Toast.show({
                type: 'error',
                text1: 'Lỗi ' + err
            })
        });
    }

    const tableData = orders.map(order => [
        "GRAB",
        order.displayID,
        order.orderValue,
        order.itemInfoDetail?.count,
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
                <Toast />
                <Spinner
                    visible={loadingVisible}
                    textContent={''} />
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedOrder && (
                            <>
                                <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                                <View style={styles.detailRow}><Text style={styles.label}>Mã đơn hàng:</Text><Text>{selectedOrder.displayID}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Tổng tiền:</Text><Text>{selectedOrder.orderValue}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Số món:</Text><Text>{selectedOrder?.itemInfoDetail?.count || 0}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Trạng thái:</Text><Badge text={selectedOrder.state} color={getStatusColor(selectedOrder.state)} /></View>
                                <Text style={styles.modalTitle}>Danh sách món</Text>
                                {selectedOrder?.itemInfoDetail?.items?.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                    </View>
                                ))}
                                <View style={{
                                    display: 'flex',
                                    width: 200,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}>
                                    <Pressable style={styles.printButton} onPress={() => printTem(selectedOrder)}>
                                        <Text style={styles.printButtonText}>Print Tem</Text>
                                    </Pressable>
                                    <Pressable style={styles.printButton} onPress={() => printBill(selectedOrder)}>
                                        <Text style={styles.printButtonText}>Print Bill</Text>
                                    </Pressable>
                                </View>
                                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>Đóng</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <ViewShot
                ref={viewTemShotRef}
                options={{ format: "jpg", quality: 1.0 }}
                style={{
                    position: 'absolute',
                    left: -400,
                    bottom: 0,
                    width: 400,
                    backgroundColor: 'white',
                }}>{selectedOrder && (<PrintTemplate orderPrint={selectedOrder} />)}</ViewShot>
            <ViewShot
                ref={viewBillShotRef}
                options={{ format: 'jpg', quality: 1.0, result: 'base64' }}
                style={{
                    position: 'absolute',
                    left: -400,
                    bottom: 0,
                    width: 400,
                    backgroundColor: 'white',
                }}
            >
                {
                    selectedOrder && (
                        <BillTemplate selectedOrder={selectedOrder} />
                    )
                }
            </ViewShot>
            <Toast />
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