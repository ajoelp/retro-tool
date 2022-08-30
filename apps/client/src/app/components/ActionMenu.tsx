import {Menu, Transition} from '@headlessui/react';
import {Fragment, ReactNode} from 'react';
import {CheckIcon, DotsVerticalIcon} from '@heroicons/react/solid';

export type ActionMenuItem = {
  title: string;
  action: () => void;
  active?: boolean;
};

type ActionMenuProps = {
  items: ActionMenuItem[];
  children?: ReactNode
};

export default function ActionMenu({items, children}: ActionMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        {children ? <Menu.Button>{children}</Menu.Button> : <Menu.Button
          className="inline-flex justify-center w-full p-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <DotsVerticalIcon className="w-5 h-5 text-violet-200 hover:text-violet-100" aria-hidden="true"/>
        </Menu.Button>}
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
        <Menu.Items
          className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-1 ">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({active}) => (
                  <button
                    onClick={item.action}
                    className={`${
                      active ? 'bg-violet-500 text-indigo-500' : 'text-gray-900'
                    } group flex rounded-md items-center w-full px-2 py-2 text-sm gap-2`}
                  >
                    {item.title}
                    {item.active && (
                      <CheckIcon className="w-4 h-4 text-indigo-500" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
