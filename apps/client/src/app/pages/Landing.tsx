import { Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import axios from 'axios';
import { useRef } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import api, { createBoardArgs } from '../api';
import Layout from '../components/Layout';



const useCreateBoard = () => {
  return useMutation(api.createBoard);
};

const Landing = () => {
  const boardTitleRef = useRef<HTMLInputElement>(null);
  const columnNamesRef = useRef<HTMLInputElement>(null);
  const { mutateAsync } = useCreateBoard();

  const history = useHistory()

  const onSubmit = async () => {
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

    const { data: { board } } = await mutateAsync({ title: boardTitle, columns: columnNames });
    history.push(`/boards/${board.id}`)
  };

  return (
    <div>
      <FormControl id="boardTitle" isRequired>
        <FormLabel>Board Title</FormLabel>
        <Input placeholder="Board title" ref={boardTitleRef} />
      </FormControl>
      <FormControl id="columnName" isRequired>
        <FormLabel>Column Name</FormLabel>
        <Input placeholder="Column Name" ref={columnNamesRef} />
      </FormControl>

      <Button onClick={onSubmit}>Create Board</Button>
    </div>
    // <div>
    //   <div className="bg-white overflow-hidden shadow rounded-lg">
    //     <div className="px-4 py-5 sm:p-6">
    //       <div>The landing</div>
    //       <div>
    //         <label
    //           htmlFor="boardTitle"
    //           className="block text-sm font-medium text-gray-700"
    //         >
    //           Board Title
    //         </label>
    //         <div className="mt-1">
    //           <input
    //             required
    //             type="text"
    //             name="boardTitle"
    //             id="boardTitle"
    //             className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
    //             ref={boardTitleRef}
    //           />
    //         </div>
    //         <label
    //           htmlFor="columnName"
    //           className="block text-sm font-medium text-gray-700"
    //         >
    //           Column Name
    //         </label>
    //         <input
    //           required
    //           type="text"
    //           name="columnName"
    //           id="columnName"
    //           className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
    //           ref={columnNamesRef}
    //         />

    //         <button
    //           type="submit"
    //           className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    //           onClick={onSubmit}
    //         >
    //           Create Board
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Landing;
