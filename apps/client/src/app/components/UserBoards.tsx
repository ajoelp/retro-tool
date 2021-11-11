import { useBoards } from '../hooks/boards';
import { Spinner } from './Spinner';
import { Link } from 'react-router-dom';
import { dateAgo } from '../utils/dates';
import { ChevronRightIcon } from '@heroicons/react/solid';
import { Avatar, AvatarGroup } from './Avatar';

export const UserBoards = () => {
  const { data, isLoading } = useBoards();

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-4">
        Recent Boards
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.map((board) => (
            <li key={board.id}>
              <Link
                to={`/boards/${board.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-indigo-600 truncate">
                          {board.title}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <p>
                            Created{' '}
                            <time dateTime={board.createdAt as any}>
                              {dateAgo(board.createdAt as any)} ago
                            </time>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <AvatarGroup max={5}>
                        {board.boardAccesses.map((applicant) => (
                          <Avatar
                            size="xs"
                            key={applicant.user.email}
                            src={applicant.user.avatar}
                            alt={applicant.user.githubNickname}
                          />
                        ))}
                      </AvatarGroup>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <ChevronRightIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
