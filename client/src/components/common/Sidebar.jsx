import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, ClipboardList, Search, 
  ScanQrCode, Truck, Users, BarChart3, X 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const links = {
    customer: [
      { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/customer/book', label: 'Book a Parcel', icon: PlusCircle },
      { to: '/customer/bookings', label: 'My Bookings', icon: ClipboardList },
      { to: '/customer/track', label: 'Track Parcel', icon: Search }
    ],
    agent: [
      { to: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/agent/scan', label: 'Scan Pickup', icon: ScanQrCode },
      { to: '/agent/deliveries', label: 'Manage Deliveries', icon: Truck }
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Manage Users', icon: Users },
      { to: '/admin/bookings', label: 'All Bookings', icon: ClipboardList },
      { to: '/admin/reports', label: 'Reports', icon: BarChart3 }
    ]
  };

  const activeClass = "flex items-center gap-3 px-4 py-3 rounded-lg text-brand-blue bg-blue-50 font-semibold border-l-4 border-l-brand-blue text-sm transition-all";
  const inactiveClass = "flex items-center gap-3 px-4 py-3 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-bg text-sm font-medium transition-all";

  const roleLinks = links[user.role] || [];

  return (
    <>
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-30 w-60 h-screen bg-brand-navy border-r border-slate-800 flex flex-col justify-between pt-16 md:pt-0 transition-transform duration-300 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:block'}`}
      >
        {/* Top Header Section (Only visible on Desktop or when mobile menu toggled) */}
        <div className="flex flex-col flex-1 px-4 py-6 gap-6">
          <div className="flex items-center justify-between md:hidden">
            <span className="text-white font-bold text-lg">Menu</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden md:flex items-center justify-center py-4 border-b border-slate-800">
            <span className="text-white text-lg font-bold tracking-wider">TRACKSHIP</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 mt-4">
            {roleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => 
                    isActive 
                      ? "flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-brand-blue font-semibold border-l-4 border-l-brand-blue text-sm transition-all shadow-sm" 
                      : "flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 text-sm font-medium transition-all"
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Role Display */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff&size=128`}
              alt={user.name} 
              className="h-8 w-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">{user.name}</span>
              <span className="text-[10px] text-slate-400 mt-1 capitalize">{user.role} Portal</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
