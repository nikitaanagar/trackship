import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role
    });
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name) tempErrors.name = 'Full name is required';
    if (!formData.email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = 'Email is invalid';
    if (!formData.phone) tempErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) tempErrors.phone = 'Phone must be a 10-digit number';
    if (!formData.password) tempErrors.password = 'Password is required';
    else if (formData.password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await signupUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      if (response.success) {
        toast.success(response.message || 'Signup successful! Verification OTP sent.');
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-brand-border">
        <div className="text-center">
          <span className="text-3xl font-extrabold text-brand-blue tracking-wide">TrackShip</span>
          <h2 className="mt-4 text-2xl font-bold text-brand-navy">Create an account</h2>
          <p className="mt-2 text-xs text-brand-muted">Join us to book and track shipments instantly</p>
        </div>

        {/* Role Selector Toggles */}
        <div className="flex gap-2 p-1 bg-brand-bg rounded-lg mt-4 border border-brand-border">
          <button
            type="button"
            onClick={() => handleRoleChange('customer')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer
              ${formData.role === 'customer' ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-muted hover:text-brand-navy'}`}
          >
            I'm a Customer
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('agent')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer
              ${formData.role === 'agent' ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-muted hover:text-brand-navy'}`}
          >
            I'm a Delivery Agent
          </button>
        </div>

        <form className="space-y-3 mt-4" onSubmit={handleSubmit}>
          <Input
            id="name"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            className="w-full mt-4"
            loading={loading}
          >
            Sign up
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-border"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-brand-muted uppercase">Or join with</span>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-brand-border rounded-lg text-sm font-semibold text-brand-navy bg-white hover:bg-gray-50 transition-all cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.107.622 4.229 1.635l3.22-3.22C19.16 2.215 15.932 1 12.24 1 5.922 1 12.24s4.922 11.24 11.24 11.24c5.787 0 10.428-4.148 10.428-10.428 0-.665-.06-1.3-.178-1.767h-10.25Z"
            />
          </svg>
          Google
        </button>

        <p className="text-center text-xs text-brand-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
