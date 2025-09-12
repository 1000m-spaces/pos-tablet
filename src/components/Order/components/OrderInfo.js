import React from 'react';
import InfoCard from './InfoCard';
import Badge from './Badge';

const OrderInfo = ({
    orderData,
    printStatusConfig,
    isOfflineOrder
}) => {
    const {
        identifier,
        statusDisplay,
        tableInfo,
        orderNote,
        isPrinted,
    } = orderData;

    return (
        <InfoCard title="Thông tin đơn hàng">
            <InfoCard.DetailRow label="Mã đơn:" value={identifier} />

            {isOfflineOrder && tableInfo && (
                <InfoCard.DetailRow label="Bàn/Khách:" value={tableInfo} />
            )}

            {isOfflineOrder && orderNote && orderNote.trim() !== '' && (
                <InfoCard.DetailRow label="Ghi chú đơn:" value={orderNote} />
            )}

            <InfoCard.DetailRow label="Trạng thái:">
                <Badge
                    text={statusDisplay.text}
                    color={statusDisplay.color}
                    backgroundColor={statusDisplay.backgroundColor}
                    width="auto"
                />
            </InfoCard.DetailRow>

            <InfoCard.DetailRow label="Trạng thái in:">
                <Badge
                    text={printStatusConfig.text}
                    color={printStatusConfig.color}
                    backgroundColor={printStatusConfig.backgroundColor}
                    width="auto"
                />
            </InfoCard.DetailRow>
        </InfoCard>
    );
};

export default OrderInfo;
