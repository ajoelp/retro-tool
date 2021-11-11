import { useBoards, useDeleteBoard } from '../hooks/boards';
import { Spinner } from './Spinner';
import { Link } from 'react-router-dom';
import { dateAgo } from '../utils/dates';
import { ChevronRightIcon } from '@heroicons/react/solid';
import { Avatar, AvatarGroup } from './Avatar';
import { Board } from '@prisma/client';
import { useAuth } from '../contexts/AuthProvider';
import { useCallback } from 'react';
import { useDialogs } from '../dialog-manager';

export const UserBoards = () => {
  const { data, isLoading, refetch } = useBoards();
  const { user } = useAuth();
  const { deleteBoard } = useDeleteBoard();
  const { openDialog } = useDialogs();
  const isBoardOwner = (board: Board) => {
    return board.ownerId === user?.id;
  };

  const removeBoard = useCallback(
    async (boardId: string) => {
      openDialog('confirmation', {
        title: 'Are you sure?',
        message: 'Deleting a board is permanent.',
        async onSuccess() {
          await deleteBoard({ boardId });
          await refetch();
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onCancel() {},
      });
    },
    [deleteBoard, openDialog, refetch],
  );

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
      <div className="bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.map((board) => (
            <li key={board.id} className="relative group">
              <Link
                to={`/boards/${board.id}`}
                className="block group-hover:bg-gray-50"
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
              {isBoardOwner(board) && (
                <button
                  onClick={() => removeBoard(board.id)}
                  className="hidden absolute top-0 right-0 group-hover:block text-xs px-1.5 py-0.5 text-white transform -translate-y-1/2 translate-x-1/2 rounded-full ring-2 ring-white bg-red-400 hover hover:bg-red-500 shadow-sm"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
