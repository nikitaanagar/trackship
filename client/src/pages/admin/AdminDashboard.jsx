import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { ClipboardList, Users, DollarSign, CheckCircle2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const { cards, charts } = stats || { cards: {}, charts: {} };
  const PIE_COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#64748B', '#94A3B8'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Admin Control Panel</h1>
        <p className="text-xs text-brand-muted">Aggregated reports, analytical widgets, and global controls.</p>
      </div>

      {/* 6 Grid Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Card 1 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-[10px] text-brand-muted font-bold uppercase">Total Bookings</p>
            <p className="text-xl font-bold text-brand-navy">{cards.totalBookings}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-[10px] text-brand-muted font-bold uppercase">Today's Bookings</p>
            <p className="text-xl font-bold text-brand-navy">{cards.todayBookings}</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-brand-warning">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-[10px] text-brand-muted font-bold uppercase">Active Loads</p>
            <p className="text-xl font-bold text-brand-navy">{cards.activeShipments}</p>
          </div>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-[10px] text-brand-muted font-bold uppercase">Delivered</p>
            <p className="text-xl font-bold text-brand-navy">{cards.deliveredCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 text-brand-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-[10px] text-brand-muted font-bold uppercase">Revenue</p>
            <p className="text-xl font-bold text-brand-navy">₹{cards.totalRevenue}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-brand-border">
          <div className="space-y-1">
            <p className="text-[10px] text-brand-muted font-bold uppercase">Users</p>
            <p className="text-xl font-bold text-brand-navy">{cards.registeredUsers}</p>
          </div>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Analytical Charts Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings / Revenue dual chart (left 2 columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-brand-navy uppercase border-b border-brand-border pb-2">
            Weekly Trends (Bookings & Revenue)
          </h3>
          <div style={{ height: '300px' }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.bookingsChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748B" />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#2563EB" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#10B981" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-brand-navy uppercase border-b border-brand-border pb-2">
            Status Breakdown
          </h3>
          <div style={{ height: '300px' }} className="w-full flex flex-col justify-between">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Status distribution legends */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[10px] font-semibold">
              {charts.statusDistribution.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1">
                  <span
                    className="h-2 w-2 rounded-full inline-block"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="capitalize">{item.name.replace(/_/g, ' ')}: {item.value}</span>
                </div>
              ))}
              {charts.statusDistribution.length === 0 && (
                <span className="text-brand-muted">No status logs recorded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Quick Options Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-brand-border hover:shadow-md transition-shadow text-left"
        >
          <h4 className="font-bold text-sm text-brand-navy">User Management</h4>
          <p className="text-xs text-brand-muted">Configure roles, activate/deactivate agents and customers accounts.</p>
        </Link>
        <Link
          to="/admin/bookings"
          className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-brand-border hover:shadow-md transition-shadow text-left"
        >
          <h4 className="font-bold text-sm text-brand-navy">Consignments & Allocations</h4>
          <p className="text-xs text-brand-muted">Review booking logs, delegate/assign delivery agents, cancel shipments.</p>
        </Link>
        <Link
          to="/admin/reports"
          className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-brand-border hover:shadow-md transition-shadow text-left"
        >
          <h4 className="font-bold text-sm text-brand-navy">Analytical Reports</h4>
          <p className="text-xs text-brand-muted">Audit system revenues and export detailed CSV databases of shipments.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
