import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, getDashboardPath } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">403 - Access Denied</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          You do not have permission to view this resource. Your role permissions prevent access.
        </p>
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => navigate(user ? getDashboardPath(user.role) : '/login')}
          >
            Go to Your Authorized Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
