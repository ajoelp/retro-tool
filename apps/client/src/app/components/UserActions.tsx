import { useAuth } from '../contexts/AuthProvider';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Link } from 'react-router-dom';

type UserActionsProps = {
  className?: string;
};

export function UserActions({ className }: UserActionsProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center">
          <img
            className="inline-block h-6 w-6 rounded-full border shadow-sm"
            src={user.avatar}
            alt={user.githubNickname}
          />
          <ChevronDownIcon
            className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          <div className="px-1 py-1 ">
            {user.isAdmin && (
              <Menu.Item>
                {({ active }) => (
                  <Link
                    className={`${
                      active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    to="/admin"
                  >
                    Admin
                  </Link>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                  onClick={logout}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
