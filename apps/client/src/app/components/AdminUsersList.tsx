import { useListUsers } from '../hooks/users';
import { useAuth, useImporsonate } from '../contexts/AuthProvider';
import { Spinner } from './Spinner';
import { Button } from './Button';

export const AdminUsersList = () => {
  const { users, usersLoading } = useListUsers();
  const { impersonate, impersonateLoading } = useImporsonate();
  const { user: currentUser, logout } = useAuth();

  if (usersLoading) {
    return (
      <div className="flex justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-4">
        All Users
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {users?.map((user) =>
            user.id === currentUser?.id ? null : (
              <li key={user.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-2 py-2 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm items-center">
                          <p className="font-medium text-indigo-600 truncate">
                            {user.githubNickname}
                          </p>
                          <p className="text-sm text-gray-500 ml-2">
                            {(user as any)._count.boardAccesses} Boards
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => impersonate({ userId: user.id })}
                      >
                        Impersonate
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
};
