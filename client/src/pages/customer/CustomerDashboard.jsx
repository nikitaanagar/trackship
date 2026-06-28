import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList, PlusCircle, Search, ArrowRight, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { getMyBookings } from '../../services/bookingService';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

export const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingSearch, setTrackingSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getMyBookings({ limit: 5 });
        if (response.success) {
          setBookings(response.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleTrackSearchSubmit = (e) => {
    e.preventDefault();
    if (trackingSearch.trim()) {
      navigate(`/customer/track?id=${encodeURIComponent(trackingSearch.trim())}`);
    }
  };

  // Card stats calculations
  const totalBookings = bookings.length; // (Or query all if pagination used, but here local aggregate is good)
  const activeCount = bookings.filter(b => ['picked_up', 'in_transit', 'out_for_delivery'].includes(b.status)).length;
  const deliveredCount = bookings.filter(b => b.status === 'delivered').length;
  const pendingPaymentCount = bookings.filter(b => b.payment?.status === 'pending').length;

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
        <h1 className="text-2xl font-bold text-brand-navy">Customer Dashboard</h1>
        <p className="text-xs text-brand-muted">Monitor and book your courier shipments easily</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-brand-navy">{totalBookings}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-brand-blue">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Active Shipments</p>
            <p className="text-2xl font-bold text-brand-navy">{activeCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 text-brand-warning">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Delivered</p>
            <p className="text-2xl font-bold text-brand-navy">{deliveredCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 text-brand-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-xs text-brand-muted font-medium">Pending Payments</p>
            <p className="text-2xl font-bold text-brand-navy">{pendingPaymentCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 text-brand-danger">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Book Button */}
        <div className="lg:col-span-1 flex flex-col justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border gap-4">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-brand-navy">Send a New Parcel</h3>
            <p className="text-xs text-brand-muted">
              Book a courier dispatch, calculate pricing instantly, and get your shipment QR code.
            </p>
          </div>
          <Link
            to="/customer/book"
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" /> Book a Parcel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Track Bar */}
        <div className="lg:col-span-2 flex flex-col justify-between p-6 bg-white rounded-xl shadow-sm border border-brand-border gap-4">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-brand-navy">Quick Tracking</h3>
            <p className="text-xs text-brand-muted">
              Enter your tracking identifier to fetch status logs and trace live delivery coordinates.
            </p>
          </div>
          <form onSubmit={handleTrackSearchSubmit} className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="e.g. TRK-20260627-XXXXXX"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-brand-border rounded-lg text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors font-mono"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              <Search className="h-4 w-4" /> Track
            </button>
          </form>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-brand-navy">Recent Shipments</h3>
          <Link
            to="/customer/bookings"
            className="text-xs text-brand-blue hover:underline font-semibold"
          >
            View all shipments
          </Link>
        </div>

        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="py-12 text-center text-brand-muted text-sm space-y-2 flex flex-col items-center">
              <ClipboardList className="h-12 w-12 text-brand-border" />
              <span>No bookings found. Click "Book a Parcel" to start shipping!</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-brand-bg text-brand-navy font-bold border-b border-brand-border sticky top-0">
                <tr>
                  <th className="px-6 py-3">Tracking ID</th>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 font-mono">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-navy">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-blue font-mono">
                      {booking.trackingId}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{booking.recipient.name}</p>
                        <p className="text-xs text-brand-muted">{booking.recipient.address.city}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-brand-muted">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/customer/track?id=${booking.trackingId}`}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-100 transition-colors"
                        >
                          Track
                        </Link>
                      </div>
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

export default CustomerDashboard;
