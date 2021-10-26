import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { Logo } from '../components/Logo';
import { UserActions } from '../components/UserActions';
import { CreateBoardForm } from '../components/CreateBoardForm';
import { UserBoards } from '../components/UserBoards';
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
    <div
      className="grid min-h-screen w-full"
      style={{ gridTemplateRows: '60px minmax(0, 1fr)' }}
    >
      <div className="flex items-center mx-8 py-2">
        <div className="ml-auto">
          <UserActions />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div
          className="p-4 flex items-center justify-center sticky top-0"
          style={{ height: 'calc(100vh - 60px)' }}
        >
          <div className="w-full max-w-md">
            <Logo className="mb-8 w-full" style={{ maxWidth: 250 }} />
            <CreateBoardForm />
          </div>
        </div>
        <div
          className="bg-gray-50 flex relative overflow-x-scroll p-8"
          style={{ height: 'calc(100vh - 60px)' }}
        >
          <div className="w-full max-w-md my-auto mx-auto">
            <UserBoards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
