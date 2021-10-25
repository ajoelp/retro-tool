import { useForm } from 'react-hook-form';
import { useCreateBoard } from '../hooks/boards';
import { useHistory } from 'react-router-dom';
import { TextInput } from './inputs/TextInput';
import { Button } from './Button';

const DEFAULT_COLUMNS = 'Mad, Glad, Sad';

type FormData = {
  boardName?: string;
  columns?: string;
};

export const CreateBoardForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      columns: DEFAULT_COLUMNS,
    },
  });
  const { createBoard, createBoardLoading } = useCreateBoard();
  const history = useHistory();

  const submit = async (data: FormData) => {
    const {
      data: { board },
    } = await createBoard({
      title: data.boardName?.trim() ?? '',
      columns: data.columns
        ?.split(',')
        .map((value) => value.trim()) as string[],
    });
    history.push(`/boards/${board.id}`);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
        Create a new Board
      </h2>
      <TextInput
        className="mt-4"
        label="Board Name"
        errors={errors.boardName?.message}
        {...register('boardName', { required: 'Board name is required.' })}
      />
      <TextInput
        className="mt-2"
        label="Columns"
        hint="Comma separated"
        placeholder={DEFAULT_COLUMNS}
        errors={errors.columns?.message}
        {...register('columns', { required: 'Columns are required.' })}
      />
      <Button type="submit" className="mt-4" isLoading={createBoardLoading}>
        Create
      </Button>
    </form>
  );
};
