import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { Logo } from '../components/Logo';
import { UserActions } from '../components/UserActions';
import { CreateBoardForm } from '../components/CreateBoardForm';
import { UserBoards } from '../components/UserBoards';
import { useQueryParams } from '../hooks/useQueryParams';

const GithubSvg = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      />
    </svg>
  );
};

const Landing = () => {
  const { user, login, userLoading } = useAuth();
  const { redirect } = useQueryParams();

  if (userLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="w-screen h-screen flex bg-gray-50">
        <div className="w-full max-w-sm mx-auto flex items-center justify-center my-auto mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-md w-full">
            <ul className="divide-y divide-gray-200">
              <li className="p-0">
                <button
                  className="m-0 px-4 py-4 sm:px-6 bg-gray-800 flex items-center justify-center text-white w-full hover:bg-gray-700 cursor-pointer"
                  onClick={() => login(redirect as string)}
                  data-testid="login-button"
                >
                  Login with <GithubSvg className="ml-3" />
                </button>
              </li>
            </ul>
          </div>
        </div>
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
