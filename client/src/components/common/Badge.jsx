import React from 'react';

const statusMap = {
  // Success Green
  confirmed: 'bg-green-50 text-brand-success border-green-200',
  delivered: 'bg-green-50 text-brand-success border-green-200',
  
  // Warning Amber
  pending: 'bg-amber-50 text-brand-warning border-amber-200',
  picked_up: 'bg-amber-50 text-brand-warning border-amber-200',
  in_transit: 'bg-amber-50 text-brand-warning border-amber-200',
  out_for_delivery: 'bg-amber-50 text-brand-warning border-amber-200',
  
  // Danger Red
  failed: 'bg-red-50 text-brand-danger border-red-200',
  cancelled: 'bg-red-50 text-brand-danger border-red-200'
};

const labelMap = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled'
};

export const Badge = ({ status, className = '' }) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  const themeClasses = statusMap[normalizedStatus] || 'bg-gray-50 text-brand-muted border-gray-200';
  const label = labelMap[normalizedStatus] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${themeClasses} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;
