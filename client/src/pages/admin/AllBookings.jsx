import React, { useState, useEffect } from 'react';
import { getBookings, assignAgent, getUsers } from '../../services/adminService';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { ClipboardList, Search, Download, UserPlus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookings({
        status: filterStatus,
        agent: filterAgent,
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
      toast.error('Failed to load system bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await getUsers({ role: 'agent' });
      if (response.success) {
        setAgents(response.data);
      }
    } catch (err) {
      console.error('Failed to load agents list', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, filterAgent, currentPage]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const handleAssignAgentChange = async (bookingId, agentId) => {
    setSubmittingId(bookingId);
    try {
      const response = await assignAgent(bookingId, agentId);
      if (response.success) {
        toast.success(response.message || 'Agent assigned successfully');
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? response.data : b))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to assign agent');
    } finally {
      setSubmittingId(null);
    }
  };

  // CSV Exporter client-side
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      toast.error('No booking records to export');
      return;
    }

    const headers = ['Tracking ID,Sender Name,Recipient Name,Pincode,Weight (kg),Amount,Payment Mode,Status,Date Booked\n'];
    const rows = bookings.map((b) => {
      const sender = b.sender?.name || 'Google User';
      const recipient = b.recipient?.name || 'N/A';
      const pincode = b.recipient?.address?.pincode || '';
      const weight = b.parcel?.weight || 0;
      const amount = b.payment?.amount || 0;
      const payMode = b.payment?.method?.toUpperCase() || 'COD';
      const status = b.status || 'confirmed';
      const date = new Date(b.createdAt).toLocaleDateString();
      return `"${b.trackingId}","${sender}","${recipient}","${pincode}",${weight},${amount},"${payMode}","${status}","${date}"`;
    });

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trackship_all_shipments_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report downloaded successfully');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">All System Bookings</h1>
          <p className="text-xs text-brand-muted">Search parcel logs, reassign delivery agents, and export data feeds.</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 text-xs font-semibold"
          variant="secondary"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters and search options */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {/* Status Dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-brand-muted font-bold uppercase">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs border border-brand-border rounded-lg bg-white text-brand-navy font-semibold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Agent Filter Dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-brand-muted font-bold uppercase">Assigned Agent</span>
            <select
              value={filterAgent}
              onChange={(e) => {
                setFilterAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs border border-brand-border rounded-lg bg-white text-brand-navy font-semibold focus:outline-none"
            >
              <option value="all">All Agents</option>
              <option value="unassigned">Unassigned Only</option>
              {agents.map((ag) => (
                <option key={ag._id} value={ag._id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-end">
          <div className="flex flex-col gap-1 w-full">
            <span className="text-[10px] text-brand-muted font-bold uppercase">Search Query</span>
            <input
              type="text"
              placeholder="ID, Recipient, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs border border-brand-border rounded-lg text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
            />
          </div>
          <Button type="submit" className="px-3.5 py-2">
            <Search className="h-4 w-4" />
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
            <span>No bookings found matching selected filters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-brand-bg text-brand-navy font-bold border-b border-brand-border sticky top-0">
                <tr>
                  <th className="px-6 py-3">Tracking ID</th>
                  <th className="px-6 py-3">Customer / Sender</th>
                  <th className="px-6 py-3">Recipient Area</th>
                  <th className="px-6 py-3 font-mono">Date Booked</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-navy">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-blue font-mono">
                      <Link to={`/customer/track?id=${booking.trackingId}`} className="hover:underline">
                        {booking.trackingId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {booking.sender?.name || 'Google User'}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>
                        <p className="font-semibold">{booking.recipient.name}</p>
                        <p className="text-brand-muted">{booking.recipient.address.city}, {booking.recipient.address.pincode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-brand-muted">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={booking.assignedAgent?._id || ''}
                        disabled={submittingId === booking._id}
                        onChange={(e) => handleAssignAgentChange(booking._id, e.target.value)}
                        className="px-2 py-1 text-xs border border-brand-border rounded-lg bg-white text-brand-navy font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50"
                      >
                        <option value="">-- Unassigned --</option>
                        {agents.map((ag) => (
                          <option key={ag._id} value={ag._id}>
                            {ag.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
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
    </div>
  );
};

export default AllBookings;
