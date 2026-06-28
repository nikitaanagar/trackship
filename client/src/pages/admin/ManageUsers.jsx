import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, toggleUserStatus } from '../../services/adminService';
import { signupUser } from '../../services/authService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Users, Search, ToggleLeft, ToggleRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  
  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        role: roleFilter,
        search: searchQuery
      });
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        toast.success(response.message || 'User role updated successfully');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const response = await toggleUserStatus(userId, nextStatus);
      if (response.success) {
        toast.success(response.message || 'User status updated');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: nextStatus } : u))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to toggle user status');
    }
  };

  const handleNewUserChange = (e) => {
    setNewUserForm({
      ...newUserForm,
      [e.target.id]: e.target.value
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await signupUser(newUserForm);
      if (response.success) {
        toast.success('User registered successfully! Sent email verification.');
        setNewUserModalOpen(false);
        setNewUserForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'customer'
        });
        fetchUsers(); // Refresh grid
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Registration failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">User Management</h1>
          <p className="text-xs text-brand-muted">Administer user access controls, configure roles, and add agent profiles.</p>
        </div>
        <Button
          onClick={() => setNewUserModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Filters */}
        <div className="flex gap-2">
          {['all', 'customer', 'agent', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize cursor-pointer transition-colors
                ${roleFilter === role 
                  ? 'bg-brand-blue text-white border-brand-blue shadow-sm' 
                  : 'bg-white text-brand-navy border-brand-border hover:bg-brand-bg'}`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Search Name or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs border border-brand-border rounded-lg text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
          />
          <Button type="submit" className="px-3 py-1.5">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

      {/* Users grid table */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        {loading ? (
          <div className="py-24">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-brand-muted text-sm flex flex-col items-center gap-2">
            <Users className="h-12 w-12 text-brand-border" />
            <span>No users found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-brand-bg text-brand-navy font-bold border-b border-brand-border sticky top-0">
                <tr>
                  <th className="px-6 py-3">User Details</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 font-mono">Date Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-navy">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563EB&color=fff&size=128`}
                          alt={u.name}
                          className="h-8 w-8 rounded-full border border-brand-border"
                        />
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-brand-muted font-mono">{u.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2.5 py-1 text-xs border border-brand-border rounded-lg bg-white text-brand-navy font-semibold focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      >
                        <option value="customer">Customer</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                        className="inline-flex items-center text-brand-navy hover:text-brand-blue transition-colors cursor-pointer bg-transparent border-0"
                      >
                        {u.isActive ? (
                          <span className="flex items-center gap-1 text-brand-success font-semibold text-xs">
                            <ToggleRight className="h-6 w-6 text-brand-success" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-brand-muted font-semibold text-xs">
                            <ToggleLeft className="h-6 w-6 text-brand-muted" /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-brand-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Placeholder or specific profile visual details if needed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={newUserModalOpen}
        onClose={() => setNewUserModalOpen(false)}
        title="Add System User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-brand-navy">
          <Input
            id="name"
            label="Full Name"
            placeholder="John Doe"
            value={newUserForm.name}
            onChange={handleNewUserChange}
            required
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={newUserForm.email}
            onChange={handleNewUserChange}
            required
          />

          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            value={newUserForm.phone}
            onChange={handleNewUserChange}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={newUserForm.password}
            onChange={handleNewUserChange}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium block">
              Default System Role
            </label>
            <select
              id="role"
              value={newUserForm.role}
              onChange={handleNewUserChange}
              className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
            >
              <option value="customer">Customer</option>
              <option value="agent">Delivery Agent</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-brand-border mt-6">
            <Button
              variant="secondary"
              onClick={() => setNewUserModalOpen(false)}
              disabled={creating}
            >
              Close
            </Button>
            <Button type="submit" loading={creating}>
              Register User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
