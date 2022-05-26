import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { useBoards } from '../hooks/boards';
import { Button } from './Button';
import { Board } from '@prisma/client';
import { useImportActionItems } from '../hooks/action-items';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
interface ImportActionItemsProps {
  boardId: string;
}

export default function InportActionItems({ boardId }: ImportActionItemsProps) {
  const [selected, setSelected] = useState<Board | undefined>(undefined);
  const { data, isLoading, refetch } = useBoards();
  const importAction = useImportActionItems(boardId);

  const importFromOtherBoard = () => {
    if (!selected) return;
    importAction.mutate(selected.id, {
      onSuccess: () => {
        setSelected(undefined);
      },
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <div className="flex items-center gap-3">
            <Listbox.Label className="block text-sm font-medium text-gray-700">Import From</Listbox.Label>
            <div className="relative">
              <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <span className="w-full inline-flex truncate">
                  <span className="truncate">{selected?.title ?? 'Select one'}</span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  style={{ width: 300 }}
                  className="absolute right-0 z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                >
                  {data?.map((board) => (
                    <Listbox.Option
                      key={board.id}
                      className={({ active }) =>
                        classNames(
                          active ? 'text-white bg-indigo-600' : 'text-gray-900',
                          'cursor-default select-none relative py-2 pl-3 pr-9',
                        )
                      }
                      value={board}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex">
                            <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'truncate')}>
                              {board.title}
                            </span>
                            <span className={classNames(active ? 'text-indigo-200' : 'text-gray-500', 'ml-2 truncate')}>
                              {board.createdAt}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? 'text-white' : 'text-indigo-600',
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </div>
        )}
      </Listbox>
      <Button onClick={importFromOtherBoard}>Import</Button>
    </div>
  );
}
