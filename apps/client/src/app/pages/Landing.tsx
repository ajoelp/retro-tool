import axios from 'axios';
import { useRef } from 'react';
import { useMutation } from 'react-query';
import Layout from '../components/Layout';

type createBoardArgs = {
  title: string;
  columns: string[];
};

const useCreateBoard = () => {
  return useMutation(({ columns, title }: createBoardArgs) =>
    axios.post('/boards', { title, columns }),
  );
};

const Landing = () => {
  const boardTitleRef = useRef<HTMLInputElement>(null);
  const columnNamesRef = useRef<HTMLInputElement>(null);
  const { mutate } = useCreateBoard();
  const onSubmit = () => {
    const boardTitle = boardTitleRef.current?.value.trim();
    const columnNames = columnNamesRef.current?.value
      .split(',')
      .map((value) => value.trim());

    if (boardTitle == null || columnNames == null) {
      return;
    }

    // Max length
    if (boardTitle.length > 255) {
      return;
    }

    // Needs two columns
    if (columnNames.length < 2) {
      return;
    }

    mutate({ title: boardTitle, columns: columnNames });
  };

  return (
    <div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div>The landing</div>
          <div>
            <label
              htmlFor="boardTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Board Title
            </label>
            <div className="mt-1">
              <input
                required
                type="text"
                name="boardTitle"
                id="boardTitle"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ref={boardTitleRef}
              />
            </div>
            <label
              htmlFor="columnName"
              className="block text-sm font-medium text-gray-700"
            >
              Column Name
            </label>
            <input
              required
              type="text"
              name="columnName"
              id="columnName"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              ref={columnNamesRef}
            />

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onSubmit}
            >
              Create Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
