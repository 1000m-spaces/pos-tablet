import React from 'react';
import InfoCard from './InfoCard';

const DriverInfo = ({ driverInfo }) => {
    if (!driverInfo) return null;

    const { name, phone } = driverInfo;

    return (
        <InfoCard title="Thông tin tài xế">
            <InfoCard.DetailRow label="Tên:" value={name} />
            <InfoCard.DetailRow label="SĐT:" value={phone} />
        </InfoCard>
    );
};

export default DriverInfo;
