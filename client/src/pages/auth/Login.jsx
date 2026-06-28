import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { loginUser } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email is invalid';
    if (!password) tempErrors.password = 'Password is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      if (response.success) {
        toast.success(response.message || 'Logged in successfully!');
        login(response.data.token, response.data.user);
        
        // Redirect to dashboard based on role
        const role = response.data.user.role;
        navigate(`/${role}/dashboard`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.message || 'Login failed';
      
      // If user is not verified, redirect to OTP page
      if (error.status === 403 && errMsg.toLowerCase().includes('otp')) {
        toast.error('Account not verified. Redirecting to OTP verification...');
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google Auth API endpoint
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-brand-border">
        {/* Title */}
        <div className="text-center">
          <span className="text-3xl font-extrabold text-brand-blue tracking-wide">TrackShip</span>
          <h2 className="mt-4 text-2xl font-bold text-brand-navy">Welcome back</h2>
          <p className="mt-2 text-xs text-brand-muted">
            Enter your credentials to access your parcel dashboard
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="text-sm font-medium text-brand-navy">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-brand-blue hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors
                ${errors.password ? 'border-brand-danger focus:ring-brand-danger/50 focus:border-brand-danger' : 'border-brand-border'}`}
              required
            />
            {errors.password && (
              <span className="text-xs text-brand-danger font-medium mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
          >
            Sign in
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-border"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-brand-muted uppercase">Or continue with</span>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-brand-border rounded-lg text-sm font-semibold text-brand-navy bg-white hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.107.622 4.229 1.635l3.22-3.22C19.16 2.215 15.932 1 12.24 1 5.922 1 1 5.922 1 12.24s4.922 11.24 11.24 11.24c5.787 0 10.428-4.148 10.428-10.428 0-.665-.06-1.3-.178-1.767h-10.25Z"
            />
          </svg>
          Google
        </button>

        <p className="text-center text-xs text-brand-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-blue font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
