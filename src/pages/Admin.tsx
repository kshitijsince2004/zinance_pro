
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to roles page since admin functionality is now merged there
    navigate('/roles', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto glow-green"></div>
        <p className="text-muted-foreground">Redirecting to User Management...</p>
      </div>
    </div>
  );
};

export default Admin;
