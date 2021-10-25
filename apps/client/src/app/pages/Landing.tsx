import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { Logo } from '../components/Logo';
import { UserActions } from '../components/UserActions';
import { CreateBoardForm } from '../components/CreateBoardForm';
import { UserBoards } from '../components/UserBoards';
import { AdminUsersList } from '../components/AdminUsersList';
import { useQueryParams } from '../hooks/useQueryParams';

const Landing = () => {
  const { user, login, userLoading } = useAuth();
  const { redirect } = useQueryParams();

  if (userLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="container mx-auto flex items-center justify-center">
        <button onClick={() => login(redirect as string)}>Login</button>
      </div>
    );
  }

  if (redirect) {
    return <Redirect to={redirect as string} />;
  }

  return (
    <div className="grid grid-cols-2">
      <div className="p-4 flex h-screen items-center justify-center sticky top-0">
        <div className="w-full max-w-md">
          <Logo className="mb-8 w-full" style={{ maxWidth: 250 }} />
          <CreateBoardForm />
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative">
        <UserActions className="fixed top-0 right-0 mt-4 mr-4" />
        <div className="w-full max-w-md">
          <UserBoards />
          {user.isAdmin && <AdminUsersList />}
        </div>
      </div>
    </div>
  );
};

export default Landing;
