import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { ClipboardList, Search, Eye, XCircle, Download, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadInvoicePDF } from '../../utils/invoice';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getMyBookings({
        status: filterStatus,
        search: searchQuery,
        page: currentPage,
        limit: 10
      });
      if (response.success) {
        setBookings(response.data);
        setTotalPages(response.pagination.pages);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      const response = await cancelBooking(id);
      if (response.success) {
        toast.success('Shipment cancelled successfully!');
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b))
        );
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
        }
        setDetailModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to cancel shipment');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">My Shipments</h1>
        <p className="text-xs text-brand-muted">View, search, and manage all your parcel bookings.</p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'confirmed', 'in_transit', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize cursor-pointer transition-colors
                ${filterStatus === status 
                  ? 'bg-brand-blue text-white border-brand-blue shadow-sm' 
                  : 'bg-white text-brand-navy border-brand-border hover:bg-brand-bg'}`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Search Tracking ID or Recipient"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs border border-brand-border rounded-lg text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
          />
          <Button type="submit" className="px-3 py-1.5">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        {loading ? (
          <div className="py-24">
            <Spinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-brand-muted text-sm flex flex-col items-center gap-2">
            <ClipboardList className="h-12 w-12 text-brand-border" />
            <span>No shipments found matching criteria</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-brand-bg text-brand-navy font-bold border-b border-brand-border sticky top-0">
                <tr>
                  <th className="px-6 py-3">Tracking ID</th>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3 font-mono">Date Booked</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
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
                    <td className="px-6 py-4 text-xs text-brand-muted">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ₹{booking.payment.amount}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(booking)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-100 transition-colors cursor-pointer border-0"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        {booking.payment.status === 'paid' && (
                          <button
                            onClick={() => downloadInvoicePDF(booking)}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-green-50 text-brand-success hover:bg-green-100 transition-colors cursor-pointer border-0"
                          >
                            <Download className="h-3.5 w-3.5" /> Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="flex items-center px-4 text-xs font-semibold text-brand-navy">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Shipment Details Dialog Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Shipment Details"
      >
        {selectedBooking && (
          <div className="space-y-6 text-sm text-brand-navy">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-brand-border pb-3 bg-brand-bg -mx-6 px-6 -mt-4 py-3">
              <div>
                <p className="text-[10px] text-brand-muted font-bold uppercase">Tracking ID</p>
                <p className="text-base font-bold text-brand-blue font-mono">{selectedBooking.trackingId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-brand-muted font-bold uppercase">Status</p>
                <Badge status={selectedBooking.status} />
              </div>
            </div>

            {/* Address specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-brand-muted uppercase mb-1">Pickup From</p>
                <p className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                  {selectedBooking.pickupAddress.street}, {selectedBooking.pickupAddress.city}, {selectedBooking.pickupAddress.state} - {selectedBooking.pickupAddress.pincode}
                </p>
              </div>
              <div>
                <p className="font-bold text-brand-muted uppercase mb-1">Delivery Recipient</p>
                <p className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                  <strong>{selectedBooking.recipient.name} ({selectedBooking.recipient.phone})</strong><br />
                  {selectedBooking.recipient.address.street}, {selectedBooking.recipient.address.city}, {selectedBooking.recipient.address.state} - {selectedBooking.recipient.address.pincode}
                </p>
              </div>
            </div>

            {/* Parcel details */}
            <div className="border border-brand-border rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-brand-navy border-b border-brand-border pb-1">Parcel Description</h4>
              <p>{selectedBooking.parcel.description}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div>
                  <span className="text-brand-muted font-medium block">Category:</span>
                  <span className="capitalize">{selectedBooking.parcel.category}</span>
                </div>
                <div>
                  <span className="text-brand-muted font-medium block">Weight:</span>
                  <span>{selectedBooking.parcel.weight} kg</span>
                </div>
                <div>
                  <span className="text-brand-muted font-medium block">Billing:</span>
                  <span className="font-semibold text-brand-blue">₹{selectedBooking.payment.amount}</span>
                </div>
              </div>
            </div>

            {/* QR display */}
            {selectedBooking.qrCode && (
              <div className="flex flex-col items-center border border-brand-border p-4 rounded-xl gap-2 bg-brand-bg/30">
                <span className="text-xs font-semibold text-brand-navy">QR Code for pickup & deliveries</span>
                <img
                  src={selectedBooking.qrCode}
                  alt="Booking QR"
                  className="w-36 h-36 border border-brand-border p-1.5 rounded-lg bg-white"
                />
                <a
                  href={selectedBooking.qrCode}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-blue font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download QR
                </a>
              </div>
            )}

            {selectedBooking.payment.status === 'paid' && (
              <div className="flex flex-col items-center border border-brand-border p-4 rounded-xl gap-2 bg-brand-bg/30">
                <span className="text-xs font-semibold text-brand-navy">Tax Invoice & Receipt</span>
                <button
                  onClick={() => downloadInvoicePDF(selectedBooking)}
                  className="text-xs bg-brand-blue hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-all px-3 py-1.5 rounded-lg border-0 cursor-pointer shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" /> Download Tax Invoice (PDF)
                </button>
              </div>
            )}

            {/* Cancel Button Option */}
            {['pending', 'confirmed'].includes(selectedBooking.status) && (
              <div className="pt-2">
                <Button
                  variant="danger"
                  className="w-full flex items-center justify-center gap-1"
                  loading={cancellingId === selectedBooking._id}
                  onClick={() => handleCancelBooking(selectedBooking._id)}
                >
                  <XCircle className="h-4 w-4" /> Cancel Parcel Shipment
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookings;
