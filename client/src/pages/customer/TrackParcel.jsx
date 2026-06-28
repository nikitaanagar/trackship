import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Truck, Calendar, User, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { trackParcel } from '../../services/bookingService';
import { NotificationContext } from '../../context/NotificationContext';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import L from 'leaflet';

export const TrackParcel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const trackingIdParam = searchParams.get('id') || '';
  const [trackingId, setTrackingId] = useState(trackingIdParam);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Real-time location coordinates
  const [agentCoords, setAgentCoords] = useState(null);
  const { socket } = useContext(NotificationContext);
  
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Fetch tracking data
  const handleTrack = async (idToTrack) => {
    if (!idToTrack) return;
    setLoading(true);
    try {
      const response = await trackParcel(idToTrack);
      if (response.success) {
        setBooking(response.data);
        
        // If parcel is out for delivery, set initial coords from statusLogs if available
        if (response.data.status === 'out_for_delivery') {
          // Look for latest coordinate logs
          const coordLog = [...response.data.statusLogs]
            .reverse()
            .find(log => log.coordinates && log.coordinates.lat);
          
          if (coordLog) {
            setAgentCoords(coordLog.coordinates);
          } else {
            // Default Delhi coordinates as fallback initial point
            setAgentCoords({ lat: 28.6139, lng: 77.2090 });
          }
        } else {
          setAgentCoords(null);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Parcel tracking failed');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  // Run tracking query when URL parameter changes
  useEffect(() => {
    if (trackingIdParam) {
      setTrackingId(trackingIdParam);
      handleTrack(trackingIdParam);
    }
  }, [trackingIdParam]);

  // Socket listener for live location updates
  useEffect(() => {
    if (!booking || booking.status !== 'out_for_delivery' || !socket) return;

    // Join tracking room
    socket.emit('join_tracking_room', booking._id);

    const handleLocationUpdate = (data) => {
      if (data.bookingId === booking._id) {
        console.log('Received location update via Socket.io:', data);
        setAgentCoords({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on('location_update', handleLocationUpdate);

    return () => {
      socket.off('location_update', handleLocationUpdate);
    };
  }, [booking, socket]);

  // Leaflet Map Initialization and Coordination
  useEffect(() => {
    if (!agentCoords || !mapRef.current) {
      // Clean up map if no coordinates or element goes away
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const { lat, lng } = agentCoords;

    if (!leafletMapRef.current) {
      // Inject CDN styles dynamic fallback if not loaded
      if (!document.getElementById('leaflet-cdn-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-cdn-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Initialize map
      leafletMapRef.current = L.map(mapRef.current).setView([lat, lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);

      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      markerRef.current = L.marker([lat, lng], { icon: customIcon })
        .addTo(leafletMapRef.current)
        .bindPopup('Delivery Agent Active Location')
        .openPopup();
    } else {
      // Map is already initialized, just update marker coords and pan
      const latLng = new L.LatLng(lat, lng);
      markerRef.current.setLatLng(latLng);
      leafletMapRef.current.panTo(latLng);
    }
  }, [agentCoords]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      setSearchParams({ id: trackingId.trim() });
    }
  };

  // Stepper icon resolver
  const getTimelineIcon = (stage) => {
    switch (stage) {
      case 'confirmed': return <Clock className="h-5 w-5" />;
      case 'picked_up': return <MapPin className="h-5 w-5" />;
      case 'in_transit': return <Truck className="h-5 w-5" />;
      case 'out_for_delivery': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle2 className="h-5 w-5" />;
      case 'failed': return <ShieldAlert className="h-5 w-5" />;
      case 'cancelled': return <ShieldAlert className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getTimelineBadge = (stage) => {
    const stageMap = {
      confirmed: 'bg-green-500 text-white',
      picked_up: 'bg-amber-500 text-white',
      in_transit: 'bg-amber-500 text-white',
      out_for_delivery: 'bg-amber-500 text-white',
      delivered: 'bg-green-600 text-white',
      failed: 'bg-red-500 text-white',
      cancelled: 'bg-red-500 text-white'
    };
    return stageMap[stage] || 'bg-slate-400 text-white';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Track your Shipment</h1>
        <p className="text-xs text-brand-muted">Enter parcel tracking identifier for live logs and route maps.</p>
      </div>

      {/* Tracking search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 bg-white p-4 rounded-xl shadow-sm border border-brand-border">
        <input
          type="text"
          placeholder="Enter Tracking ID (e.g. TRK-YYYYMMDD-XXXXXX)"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm border border-brand-border rounded-lg text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue font-mono uppercase"
          required
        />
        <Button type="submit" loading={loading}>
          <Search className="h-4 w-4 mr-1.5" /> Search
        </Button>
      </form>

      {loading && (
        <div className="py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Tracking Results Card */}
      {booking && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Timeline side (2 columns wide) */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-brand-border space-y-6">
            <div className="border-b border-brand-border pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] text-brand-muted font-bold tracking-wider uppercase">Shipment Status</span>
                <h2 className="text-xl font-bold text-brand-blue font-mono">{booking.trackingId}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-brand-muted font-bold tracking-wider uppercase block">Estimated Delivery</span>
                <span className="text-sm font-semibold text-brand-navy flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-brand-blue" />
                  {booking.estimatedDelivery ? new Date(booking.estimatedDelivery).toLocaleDateString() : '3-5 Days'}
                </span>
              </div>
            </div>

            {/* Vertical Stepper Timeline */}
            <div className="relative border-l-2 border-brand-border pl-6 ml-3 space-y-8">
              {booking.statusLogs.map((log, index) => (
                <div key={log._id || index} className="relative">
                  {/* Stepper Node Indicator */}
                  <span className={`absolute -left-[37px] top-0.5 rounded-full p-1.5 flex items-center justify-center ring-4 ring-white
                    ${getTimelineBadge(log.stage)}`}>
                    {getTimelineIcon(log.stage)}
                  </span>
                  
                  {/* Log Details */}
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-navy capitalize">
                      {log.stage.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-brand-navy">{log.message}</p>
                    <div className="flex gap-4 text-[10px] text-brand-muted font-medium pt-1">
                      {log.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {log.location}</span>}
                      <span><Clock className="h-3 w-3 inline mr-0.5" /> {new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info & Map Side */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Courier Details Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border space-y-4">
              <h3 className="font-bold text-sm text-brand-navy uppercase border-b border-brand-border pb-2">Shipment Info</h3>
              
              <div className="space-y-3 text-xs text-brand-navy">
                <div>
                  <span className="text-brand-muted font-semibold block">Parcel Type:</span>
                  <span className="capitalize">{booking.parcel.category}</span>
                </div>
                <div>
                  <span className="text-brand-muted font-semibold block">Weight:</span>
                  <span>{booking.parcel.weight} kg</span>
                </div>
                {booking.assignedAgent ? (
                  <div className="pt-2 border-t border-brand-border flex items-center gap-3">
                    <img
                      src={booking.assignedAgent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.assignedAgent.name)}&background=2563EB&color=fff&size=128`}
                      alt={booking.assignedAgent.name}
                      className="h-8 w-8 rounded-full border border-brand-border"
                    />
                    <div>
                      <span className="text-[10px] text-brand-muted block">Assigned Agent</span>
                      <span className="font-bold">{booking.assignedAgent.name}</span>
                      <span className="text-[10px] text-brand-muted block">{booking.assignedAgent.phone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-brand-border text-brand-muted flex items-center gap-1.5">
                    <User className="h-4 w-4" /> Agent allocation pending
                  </div>
                )}
              </div>
            </div>

            {/* Live Location Map */}
            {booking.status === 'out_for_delivery' && agentCoords && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-brand-navy uppercase flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-brand-danger animate-pulse" /> Live Tracking
                  </h3>
                  <span className="text-[10px] font-bold text-brand-success px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
                    Active
                  </span>
                </div>
                <div
                  ref={mapRef}
                  style={{ height: '220px' }}
                  className="w-full rounded-lg border border-brand-border z-10"
                />
                <span className="text-[9px] text-brand-muted block text-center">
                  Location updates automatically every 30s.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackParcel;
