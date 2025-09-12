import React from 'react';
import InfoCard from './InfoCard';

const CustomerInfo = ({ customerInfo }) => {
    if (!customerInfo) return null;

    const { name, phone, address, comment } = customerInfo;

    return (
        <InfoCard title="Thông tin khách hàng">
            <InfoCard.DetailRow label="Tên:" value={name} />
            <InfoCard.DetailRow label="SĐT:" value={phone} />
            {address && (
                <InfoCard.DetailRow label="Địa chỉ:" value={address} />
            )}
            {comment && (
                <InfoCard.DetailRow label="Ghi chú:" value={comment} />
            )}
        </InfoCard>
    );
};

export default CustomerInfo;
