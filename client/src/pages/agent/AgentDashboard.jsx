import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScanQrCode, Truck, CheckCircle2, ClipboardList, MapPin, AlertTriangle } from 'lucide-react';
import { getAssignedBookings } from '../../services/agentService';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

export const AgentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await getAssignedBookings();
        if (response.success) {
          setAssignments(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch assignments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Stats cards calculations
  const totalAssigned = assignments.length;
  const pickedUpCount = assignments.filter((b) => b.status === 'picked_up').length;
  const deliveredTodayCount = assignments.filter((b) => {
    if (b.status !== 'delivered' || !b.deliveredAt) return false;
    const deliveredDate = new Date(b.deliveredAt);
    const today = new Date();
    return (
      deliveredDate.getDate() === today.getDate() &&
      deliveredDate.getMonth() === today.getMonth() &&
      deliveredDate.getFullYear() === today.getFullYear()
    );
  }).length;
  const pendingCount = assignments.filter((b) => ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery'].includes(b.status)).length;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Agent Dashboard</h1>
        <p className="text-xs text-brand-muted">Manage your assigned loads and process pickups/deliveries.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Total Assigned</p>
            <p className="text-2xl font-bold text-brand-navy">{totalAssigned}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-brand-blue">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Picked Up</p>
            <p className="text-2xl font-bold text-brand-navy">{pickedUpCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 text-brand-warning">
            <MapPin className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Delivered Today</p>
            <p className="text-2xl font-bold text-brand-navy">{deliveredTodayCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 text-brand-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Pending Delivery</p>
            <p className="text-2xl font-bold text-brand-navy">{pendingCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 text-brand-danger">
            <Truck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Prominent Scanner Action */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-brand-navy rounded-xl shadow-sm border border-slate-800 text-white gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg">Scan barcode/QR code to Pickup</h3>
          <p className="text-xs text-slate-400">
            Instantly scan the customer's parcel QR code to register the pickup and assign GPS coordinates.
          </p>
        </div>
        <Link
          to="/agent/scan"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md cursor-pointer whitespace-nowrap"
        >
          <ScanQrCode className="h-5 w-5" /> Launch QR Scanner
        </Link>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-brand-navy">Assigned Consignments</h3>
          <Link
            to="/agent/deliveries"
            className="text-xs text-brand-blue hover:underline font-semibold"
          >
            Manage deliveries
          </Link>
        </div>

        <div className="overflow-x-auto">
          {assignments.length === 0 ? (
            <div className="py-12 text-center text-brand-muted text-sm space-y-2 flex flex-col items-center">
              <ClipboardList className="h-12 w-12 text-brand-border" />
              <span>No parcels assigned to you yet. Good job!</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-brand-bg text-brand-navy font-bold border-b border-brand-border sticky top-0">
                <tr>
                  <th className="px-6 py-3">Tracking ID</th>
                  <th className="px-6 py-3">Recipient Area</th>
                  <th className="px-6 py-3">Parcel Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-navy">
                {assignments.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-blue font-mono">
                      {booking.trackingId}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{booking.recipient.name}</p>
                        <p className="text-xs text-brand-muted">
                          {booking.recipient.address.city}, {booking.recipient.address.pincode}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-xs">
                      {booking.parcel.category} ({booking.parcel.weight} kg)
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/agent/deliveries"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-100 transition-colors"
                      >
                        Update
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
