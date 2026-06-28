import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanQrCode, MapPin, ClipboardList, CheckCircle2, User } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getBookingById, trackParcel } from '../../services/bookingService';
import { scanPickup } from '../../services/agentService';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const ScanPickup = () => {
  const [scannedId, setScannedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  // Initialize HTML5 QR Scanner
  useEffect(() => {
    // Only mount scanner if no parcel details are currently fetched
    if (booking) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
      console.log(`Scan successful: ${decodedText}`);
      setScannedId(decodedText);
      scanner.clear();
      fetchBookingDetails(decodedText);
    };

    const onScanError = (err) => {
      // Don't flood toast since error triggers on every frame failure
      // console.warn(err);
    };

    scanner.render(onScanSuccess, onScanError);

    // Get current GPS coordinates in advance
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => console.warn('Pre-fetch coordinates failed', err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.warn('Scanner clear error', e));
      }
    };
  }, [booking]);

  const fetchBookingDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await trackParcel(id);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Parcel details not found');
      // Re-enable scanner by clearing states
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearchSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      fetchBookingDetails(manualId.trim().toUpperCase());
    }
  };

  const handleConfirmPickup = async () => {
    if (!booking) return;
    setSubmitting(true);

    // Ensure we fetch latest coordinates
    const getCoordinates = () => {
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
      const coords = await getCoordinates();
      const payload = {
        trackingId: booking.trackingId,
        lat: coords ? coords.lat : gpsCoords?.lat,
        lng: coords ? coords.lng : gpsCoords?.lng,
        locationName: booking.pickupAddress.city
      };

      const response = await scanPickup(payload);
      if (response.success) {
        toast.success('Parcel pickup confirmed successfully!');
        navigate('/agent/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to confirm pickup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Scan to Pickup</h1>
        <p className="text-xs text-brand-muted">Point camera at parcel QR code or input the Tracking ID manually.</p>
      </div>

      {!booking ? (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-brand-border">
          {/* Reader container */}
          <div className="overflow-hidden rounded-lg border border-brand-border">
            <div id="qr-reader-container" className="w-full bg-slate-950" />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border text-center"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-brand-muted uppercase">Or Input Manually</span>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleManualSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. TRK-20260627-XXXXXX"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="flex-1 px-4 py-2 text-xs border border-brand-border rounded-lg text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue font-mono uppercase"
              required
            />
            <Button type="submit" loading={loading} className="px-4 text-xs font-semibold">
              Load Details
            </Button>
          </form>
        </div>
      ) : (
        /* Confirms details */
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border space-y-6">
          <div className="border-b border-brand-border pb-3">
            <span className="text-[10px] text-brand-muted font-bold tracking-wider uppercase block">Parcel Identified</span>
            <span className="text-lg font-bold text-brand-blue font-mono">{booking.trackingId}</span>
          </div>

          <div className="space-y-4 text-xs text-brand-navy">
            {/* Pickup */}
            <div className="p-3 rounded-lg bg-brand-bg border border-brand-border space-y-1">
              <span className="text-brand-muted font-bold flex items-center gap-1 uppercase text-[9px]"><MapPin className="h-3 w-3 text-brand-blue" /> Pickup From</span>
              <p className="font-medium">
                {booking.pickupAddress.street}, {booking.pickupAddress.city}, {booking.pickupAddress.state} - {booking.pickupAddress.pincode}
              </p>
            </div>

            {/* Recipient */}
            <div className="p-3 rounded-lg bg-brand-bg border border-brand-border space-y-1">
              <span className="text-brand-muted font-bold flex items-center gap-1 uppercase text-[9px]"><User className="h-3 w-3 text-brand-success" /> Recipient details</span>
              <p className="font-semibold">{booking.recipient.name}</p>
              <p className="text-brand-muted">
                {booking.recipient.address.street}, {booking.recipient.address.city}, {booking.recipient.address.state} - {booking.recipient.address.pincode}
              </p>
              <p className="text-brand-muted font-mono">{booking.recipient.phone}</p>
            </div>

            {/* Parcel details */}
            <div className="p-3 rounded-lg bg-brand-bg border border-brand-border space-y-1">
              <span className="text-brand-muted font-bold flex items-center gap-1 uppercase text-[9px]"><ClipboardList className="h-3 w-3 text-brand-blue" /> Parcel category</span>
              <p className="capitalize font-semibold">{booking.parcel.category}</p>
              <p className="text-brand-muted">{booking.parcel.description}</p>
              <p className="text-brand-muted">Weight: {booking.parcel.weight} kg</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={submitting}
              onClick={() => setBooking(null)}
            >
              Cancel Scan
            </Button>
            <Button
              className="flex-1"
              loading={submitting}
              onClick={handleConfirmPickup}
            >
              Confirm Pickup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPickup;
