import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { verifyOTP, resendOTP } from '../../services/authService';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const OTPVerify = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Countdown timer logic
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle typing OTP digits
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // keep only last digit
    setOtp(newOtp);

    // Auto-focus next input field
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle backspaces/arrows navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Submit OTP for validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP({ email, otp: otpCode });
      if (response.success) {
        toast.success(response.message || 'Account verified successfully!');
        login(response.data.token, response.data.user);
        
        // Navigate to appropriate dashboard
        navigate(`/${response.data.user.role}/dashboard`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      const response = await resendOTP({ email });
      if (response.success) {
        toast.success(response.message || 'A new verification OTP has been sent.');
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputsRef.current[0].focus();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-brand-border">
        <div className="text-center">
          <span className="text-3xl font-extrabold text-brand-blue tracking-wide">TrackShip</span>
          <h2 className="mt-4 text-2xl font-bold text-brand-navy">Verify your account</h2>
          <p className="mt-2 text-xs text-brand-muted">
            We have sent a 6-digit verification code to <strong className="text-brand-navy">{email}</strong>
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* 6 digits input grid */}
          <div className="flex justify-between items-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold text-brand-navy bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors font-mono"
                required
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
          >
            Verify code
          </Button>
        </form>

        <div className="flex flex-col items-center justify-center gap-2 mt-4 text-xs text-brand-muted">
          {timer > 0 ? (
            <span>Resend verification code in <strong>{timer}s</strong></span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-brand-blue font-bold hover:underline cursor-pointer disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend verification OTP code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
