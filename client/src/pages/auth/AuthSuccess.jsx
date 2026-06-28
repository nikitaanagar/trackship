import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { getMe } from '../../services/authService';

export const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSuccess = async () => {
      if (!token) {
        toast.error('Google Authentication failed. Missing token.');
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Temporarily store token in localStorage to fetch user info
        localStorage.setItem('trackship_token', token);
        
        const response = await getMe();
        if (response.success) {
          toast.success('Successfully authenticated with Google!');
          login(token, response.data);
          
          // Redirect to appropriate dashboard based on user role
          navigate(`/${response.data.role}/dashboard`, { replace: true });
        } else {
          throw new Error('Sync failed');
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem('trackship_token');
        toast.error('Failed to sync Google profile.');
        navigate('/login', { replace: true });
      }
    };

    handleSuccess();
  }, [token]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-brand-bg flex-col gap-4 text-brand-navy">
      <Spinner size="lg" />
      <p className="text-sm font-semibold animate-pulse">Syncing Google Profile...</p>
    </div>
  );
};

export default AuthSuccess;
