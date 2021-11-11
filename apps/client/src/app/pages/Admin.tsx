import { AdminUsersList } from '../components/AdminUsersList';
import { useAuth } from '../contexts/AuthProvider';
import { Navigate } from 'react-router-dom';

export default function AdminPage() {
  const { user } = useAuth();

  if (!user || !user.isAdmin) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8">
      <div className="container mx-auto">
        <AdminUsersList />
      </div>
    </div>
  );
}
