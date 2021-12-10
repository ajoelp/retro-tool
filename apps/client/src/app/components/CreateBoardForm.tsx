import { useForm } from 'react-hook-form';
import { useCreateBoard } from '../hooks/boards';
import { useNavigate } from 'react-router-dom';
import { TextInput } from './inputs/TextInput';
import { Button } from './Button';
import { useAuth, useMe } from '../contexts/AuthProvider';
import { useMemo } from 'react';

const DEFAULT_COLUMNS = 'Mad, Glad, Sad';

type FormData = {
  boardName?: string;
  columns?: string;
};

export const CreateBoardForm = () => {
  const { createBoard, createBoardLoading } = useCreateBoard();
  const { refetch: getMe } = useMe();
  const { user } = useAuth();
  const navigate = useNavigate();
  const defaultColumns = useMemo(() => {
    return user?.defaultColumns ?? DEFAULT_COLUMNS;
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      columns: defaultColumns,
    },
  });

  const submit = async (data: FormData) => {
    const {
      data: { board },
    } = await createBoard({
      title: data.boardName?.trim() ?? '',
      columns: data.columns
        ?.split(',')
        .map((value) => value.trim()) as string[],
    });
    await getMe();
    navigate(`/boards/${board.id}`);
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
        data-testid="board_title"
      />
      <TextInput
        className="mt-2"
        label="Columns"
        hint="Comma separated"
        placeholder={defaultColumns}
        errors={errors.columns?.message}
        {...register('columns', { required: 'Columns are required.' })}
        data-testid="column_names"
      />
      <Button
        type="submit"
        className="mt-4"
        isLoading={createBoardLoading}
        data-testid="create_board_button"
      >
        Create
      </Button>
    </form>
  );
};
