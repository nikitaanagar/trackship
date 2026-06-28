import React, { useState, useEffect, useContext, useRef } from 'react';
import { Truck, MapPin, CheckCircle2, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react';
import { getAssignedBookings, updateStatus } from '../../services/agentService';
import { NotificationContext } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const ManageDeliveries = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [hubName, setHubName] = useState('');
  const [updating, setUpdating] = useState(false);
  const { socket } = useContext(NotificationContext);

  // Keep track of active GPS watch IDs for "out_for_delivery" parcels
  const activeWatchesRef = useRef({});

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getAssignedBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assigned deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Manage live tracking socket broadcasts for "out_for_delivery" items
  useEffect(() => {
    if (!socket || bookings.length === 0) return;

    // Filter out deliveries that are "out_for_delivery"
    const outForDeliveryParcels = bookings.filter((b) => b.status === 'out_for_delivery');

    // Clean up watches for parcels no longer marked "out_for_delivery"
    Object.keys(activeWatchesRef.current).forEach((bookingId) => {
      if (!outForDeliveryParcels.find((b) => b._id === bookingId)) {
        navigator.geolocation.clearWatch(activeWatchesRef.current[bookingId]);
        delete activeWatchesRef.current[bookingId];
        console.log(`Cleared GPS broadcast watch for booking ${bookingId}`);
      }
    });

    // Start watches for new "out_for_delivery" parcels
    outForDeliveryParcels.forEach((parcel) => {
      const bookingId = parcel._id;
      if (!activeWatchesRef.current[bookingId]) {
        if (!navigator.geolocation) {
          console.warn('Geolocation not supported, cannot broadcast live track coordinates');
          return;
        }

        let lastBroadcastTime = 0;
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const now = Date.now();
            // Restrict broadcasts to once every 20 seconds to prevent congestion
            if (now - lastBroadcastTime > 20000) {
              const { latitude, longitude } = position.coords;
              console.log(`Broadcasting live location for booking ${bookingId}: Lat ${latitude}, Lng ${longitude}`);
              socket.emit('location_update', {
                bookingId,
                lat: latitude,
                lng: longitude
              });
              lastBroadcastTime = now;
            }
          },
          (err) => console.warn(`GPS Live broadcast watch error: ${err.message}`),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

        activeWatchesRef.current[bookingId] = watchId;
        console.log(`Started GPS broadcast watch for booking ${bookingId}`);
      }
    });

    return () => {
      // Complete cleanup on unmount
      Object.keys(activeWatchesRef.current).forEach((bookingId) => {
        navigator.geolocation.clearWatch(activeWatchesRef.current[bookingId]);
      });
      activeWatchesRef.current = {};
    };
  }, [bookings, socket]);

  const handleOpenStatusModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusMessage('');
    setHubName(booking.statusLogs[booking.statusLogs.length - 1]?.location || '');
    setStatusModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setUpdating(true);

    const getCoords = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 5000 }
        );
      });
    };

    try {
      const coords = await getCoords();
      const payload = {
        status: newStatus,
        message: statusMessage,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        locationName: hubName
      };

      const response = await updateStatus(selectedBooking._id, payload);
      if (response.success) {
        toast.success('Shipment status updated successfully!');
        
        // Refresh local bookings list
        setBookings((prev) =>
          prev.map((b) => (b._id === selectedBooking._id ? response.data : b))
        );
        
        setStatusModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Manage Deliveries</h1>
          <p className="text-xs text-brand-muted">Monitor loads, transition transit checkpoints, and activate trackers.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2 rounded-lg border border-brand-border text-brand-navy hover:bg-brand-bg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </button>
      </div>

      {loading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center text-brand-muted text-sm bg-white border border-brand-border rounded-xl flex flex-col items-center gap-2">
          <Truck className="h-12 w-12 text-brand-border" />
          <span>No consignments assigned to you yet.</span>
        </div>
      ) : (
        /* Render cards for each delivery */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-brand-border p-5 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start border-b border-brand-border pb-3">
                <div>
                  <span className="text-[10px] text-brand-muted font-bold block uppercase">Tracking ID</span>
                  <span className="text-base font-bold text-brand-blue font-mono">{booking.trackingId}</span>
                </div>
                <Badge status={booking.status} />
              </div>

              {/* Addresses Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-brand-muted font-semibold block uppercase text-[9px]">Pickup</span>
                  <p className="truncate">{booking.pickupAddress.street}</p>
                  <p className="text-brand-muted">{booking.pickupAddress.city}</p>
                </div>
                <div>
                  <span className="text-brand-muted font-semibold block uppercase text-[9px]">Destination</span>
                  <p className="truncate">{booking.recipient.address.street}</p>
                  <p className="text-brand-muted">
                    {booking.recipient.address.city} - {booking.recipient.address.pincode}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                <div>
                  {booking.status === 'out_for_delivery' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-success px-2 py-0.5 rounded-full bg-green-50 border border-green-200 animate-pulse">
                      <MapPin className="h-3 w-3" /> Live GPS Active
                    </span>
                  )}
                </div>
                
                <Button
                  className="px-3.5 py-1.5 text-xs font-semibold"
                  onClick={() => handleOpenStatusModal(booking)}
                >
                  Update Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Shipment Status"
      >
        {selectedBooking && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-brand-navy">
            <div>
              <label htmlFor="status" className="text-sm font-medium block mb-1">
                Select Status Stage
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
              >
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery (Live Geolocation Starts)</option>
                <option value="delivered">Delivered (Mark bill Paid)</option>
                <option value="failed">Failed / Attempt Unsuccessful</option>
              </select>
            </div>

            <Input
              id="hubName"
              label="Location Name"
              placeholder="e.g. Delhi Hub / Dwarka Sector 12"
              value={hubName}
              onChange={(e) => setHubName(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="statusMessage" className="text-sm font-medium flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-brand-blue" /> Log Message / Notes
              </label>
              <textarea
                id="statusMessage"
                placeholder="e.g. Parcel has reached sorting facility."
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue min-h-[80px]"
              />
            </div>

            {newStatus === 'delivered' && selectedBooking.payment.method === 'pod' && selectedBooking.payment.status === 'pending' && (
              <div className="bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/20 flex flex-col items-center text-center space-y-3">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Collect Pay on Delivery (UPI QR)</span>
                <span className="text-sm font-semibold text-brand-navy">Scan with GPay / PhonePe / Paytm to Pay ₹{selectedBooking.payment.amount}</span>
                
                {/* Generate UPI QR */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `upi://pay?pa=trackship@okhdfcbank&pn=TrackShip%20Pvt%20Ltd&am=${selectedBooking.payment.amount}&cu=INR&tn=${selectedBooking.trackingId}`
                  )}`}
                  alt="UPI QR Code"
                  className="w-36 h-36 p-1 bg-white border border-brand-border rounded-lg shadow-sm"
                />
                
                <div className="text-[10px] text-brand-muted space-y-0.5">
                  <p><strong>Payee:</strong> TrackShip Pvt Ltd</p>
                  <p><strong>Tracking Ref:</strong> {selectedBooking.trackingId}</p>
                </div>
              </div>
            )}

            <div className="bg-brand-bg p-3 rounded-lg border border-brand-border text-xs text-brand-muted flex items-start gap-1.5">
              <MapPin className="h-4 w-4 text-brand-danger shrink-0 mt-0.5" />
              <span>
                <strong>GPS auto-capture enabled:</strong> Saving this update will log your current browser coordinates to the parcel's status history.
              </span>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-brand-border">
              <Button
                variant="secondary"
                onClick={() => setStatusModalOpen(false)}
                disabled={updating}
              >
                Close
              </Button>
              <Button type="submit" loading={updating}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageDeliveries;
