import React, { useState, useEffect } from 'react';
import { getReports } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Download, Calendar, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getReports({ startDate, endDate });
      if (response.success) {
        setReports(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  // CSV Exporter client-side
  const handleExportCSV = () => {
    if (!reports || reports.bookings.length === 0) {
      toast.error('No report data to export');
      return;
    }

    const headers = ['Tracking ID,Sender,Recipient,Category,Weight (kg),Amount,Payment,Status,Date Booked\n'];
    const rows = reports.bookings.map((b) => {
      const sender = b.sender?.name || 'Google User';
      const recipient = b.recipient?.name || 'N/A';
      const category = b.parcel?.category || '';
      const weight = b.parcel?.weight || 0;
      const amount = b.payment?.amount || 0;
      const payStatus = b.payment?.status || 'pending';
      const status = b.status || 'confirmed';
      const date = new Date(b.createdAt).toLocaleDateString();
      return `"${b.trackingId}","${sender}","${recipient}","${category}",${weight},${amount},"${payStatus}","${status}","${date}"`;
    });

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trackship_detailed_report_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  };

  const { stats = {}, bookings = [] } = reports || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Reports & Analytics</h1>
          <p className="text-xs text-brand-muted">Calculate total margins, track delivery completion statistics, and print CSV files.</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 text-xs font-semibold animate-in fade-in"
          disabled={loading || bookings.length === 0}
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </Button>
      </div>

      {/* Date filter forms */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex flex-col md:flex-row items-end gap-3">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label htmlFor="startDate" className="text-xs font-semibold text-brand-navy flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-brand-blue" /> Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-brand-border rounded-lg text-brand-navy focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label htmlFor="endDate" className="text-xs font-semibold text-brand-navy flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-brand-blue" /> End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-brand-border rounded-lg text-brand-navy focus:outline-none"
          />
        </div>

        <Button type="submit" className="px-4 py-1.5 text-xs font-semibold w-full md:w-auto">
          Filter Reports
        </Button>
      </form>

      {loading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : (
        /* Report summaries and tables */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Grids summaries */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold uppercase">Total Revenue</span>
                <p className="text-xl font-bold text-brand-navy">₹{stats.revenue}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold uppercase">Consignments</span>
                <p className="text-xl font-bold text-brand-navy">{stats.totalBookings}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 text-brand-blue">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold uppercase">Completion Rate</span>
                <p className="text-xl font-bold text-brand-navy">{stats.deliveredPercent}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-green-50 text-brand-success">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold uppercase">Failed / Cancelled</span>
                <p className="text-xl font-bold text-brand-navy">
                  {stats.failedPercent + stats.cancelledPercent}%
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50 text-brand-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Detailed Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border">
              <h3 className="font-bold text-base text-brand-navy">Detailed Shipments Record</h3>
            </div>

            <div className="overflow-x-auto">
              {bookings.length === 0 ? (
                <div className="py-12 text-center text-brand-muted text-sm">
                  No shipments records found within target dates.
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-brand-bg text-brand-navy font-bold border-b border-brand-border sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-mono">Tracking ID</th>
                      <th className="px-6 py-3">Sender</th>
                      <th className="px-6 py-3">Recipient</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Bill Amount</th>
                      <th className="px-6 py-3 font-mono">Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border text-brand-navy">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-brand-bg/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-brand-blue font-mono">
                          {booking.trackingId}
                        </td>
                        <td className="px-6 py-4">{booking.sender?.name || 'Google User'}</td>
                        <td className="px-6 py-4 font-medium">{booking.recipient.name}</td>
                        <td className="px-6 py-4 capitalize text-xs">{booking.parcel.category}</td>
                        <td className="px-6 py-4 font-semibold">₹{booking.payment.amount}</td>
                        <td className="px-6 py-4 text-xs text-brand-muted">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
