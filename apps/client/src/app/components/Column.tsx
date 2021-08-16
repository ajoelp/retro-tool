import React from 'react';
import { DotsVerticalIcon } from '@heroicons/react/solid';

interface ColumnProps {
  title: string;
}

const Column = ({ title }: ColumnProps) => {
  return (
    <div className="flex-1 min-w-0 bg-white">
      <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
        <div className="h-full relative" style={{ minHeight: '12rem' }}>
          <div className="h-full flex flex-col inset-0 border-2 border-gray-200 border-dashed rounded-lg p-4  ">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-700">
                {title}
              </h3>
              <DotsVerticalIcon className="h-5 w-5 ml-auto" />
            </div>
            <div className="my-auto text-center">
              <p className="leading-6 font-medium text-gray-700">What has driven you mad? You might focus on issues, time wasters, unpleasant surprises, etc.</p>
              <p className="mt-2 text-gray-600">No cards yet.</p>
            </div>
            <form className="mt-auto h-64 shadow-lg flex items-center justify-center rounded border-t-4 border-green-600">
              <textarea
                className="bg-yellow-100 resize-none rounded p-4 h-48 shadow-sm outline-none focus:ring-2 transition-all"
                placeholder="Type here... Press Enter to save"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Column;
