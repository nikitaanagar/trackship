import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, LogOut, User, Menu, ChevronDown, CheckCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { NotificationContext } from '../../context/NotificationContext';

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-brand-border px-4 flex items-center justify-between shadow-sm">
      {/* Left side: Hamburger (mobile) and Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-brand-navy hover:bg-brand-bg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-brand-blue to-blue-800 bg-clip-text text-transparent">
            TrackShip
          </span>
        </Link>
      </div>

      {/* Right side: Notifications Bell and Profile User Dropdowns */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        {user && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-brand-navy hover:bg-brand-bg transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-brand-border py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-brand-bg">
                  <span className="font-semibold text-sm text-brand-navy">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-brand-blue hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-brand-muted">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markAsRead(n._id)}
                        className={`px-4 py-3 border-b border-brand-border last:border-b-0 cursor-pointer transition-colors hover:bg-brand-bg/50
                          ${!n.isRead ? 'bg-blue-50/40 border-l-4 border-l-brand-blue' : ''}`}
                      >
                        <p className="text-xs font-semibold text-brand-navy">{n.title}</p>
                        <p className="text-xs text-brand-muted mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-brand-muted mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Dropdown */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-1 rounded-full md:rounded-lg md:px-2 md:py-1.5 hover:bg-brand-bg transition-colors cursor-pointer"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff&size=128`}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-brand-border object-cover"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-brand-navy leading-tight">{user.name}</span>
                <span className="text-[10px] text-brand-muted capitalize">{user.role}</span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-brand-muted" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-brand-border py-1 overflow-hidden">
                <div className="px-4 py-2 border-b border-brand-border md:hidden bg-brand-bg">
                  <p className="text-xs font-bold text-brand-navy">{user.name}</p>
                  <p className="text-[10px] text-brand-muted capitalize">{user.role}</p>
                </div>
                <Link
                  to={`/${user.role}/dashboard`}
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-brand-navy hover:bg-brand-bg transition-colors"
                >
                  <User className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-brand-danger hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-border text-brand-navy hover:bg-brand-bg transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-blue text-white hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
