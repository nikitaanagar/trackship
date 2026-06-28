import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify and Reset
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      if (response.success) {
        toast.success(response.message || 'OTP sent to your email');
        setStep(2);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to request reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({ email, otp, newPassword });
      if (response.success) {
        toast.success(response.message || 'Password reset successfully!');
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-brand-border">
        <div className="text-center">
          <span className="text-3xl font-extrabold text-brand-blue tracking-wide">TrackShip</span>
          <h2 className="mt-4 text-2xl font-bold text-brand-navy">Reset your password</h2>
          <p className="mt-2 text-xs text-brand-muted">
            {step === 1 
              ? 'Enter your email and we will send you an OTP to reset your password' 
              : 'Enter the verification OTP and your new password details'}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-6 space-y-4" onSubmit={handleRequestOTP}>
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Code
            </Button>
            <div className="text-center text-xs">
              <Link to="/login" className="text-brand-blue hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
            <Input
              id="otp"
              label="Verification OTP Code"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Save New Password
            </Button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-brand-blue hover:underline mt-2 cursor-pointer bg-transparent border-0"
            >
              Request another OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
