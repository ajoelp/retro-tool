import { Checkbox } from '@chakra-ui/react';
import { TrashIcon } from '@heroicons/react/outline';
import { ActionItem } from '@prisma/client';
import { DialogProps } from 'dialog-manager-react';
import { ChangeEvent, ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ImportActionItems from '../../components/ImportActionItems';
import { TextInput } from '../../components/inputs/TextInput';
import { Spinner } from '../../components/Spinner';
import {
  useActionItems,
  useCreateActionItem,
  useDeleteActionItem,
  useUpdateActionItem,
} from '../../hooks/action-items';
import { BaseDialog } from './BaseDialog';

interface ActionItemsDialogProps extends DialogProps {
  boardId: string;
}

type FormData = {
  value: string;
};

type ActionItemInputProps = {
  actionItem: ActionItem;
};
function ActionItemInput({ actionItem }: ActionItemInputProps) {
  const [value, setValue] = useState(actionItem.value);
  const [checked, setChecked] = useState(actionItem.complete);
  const update = useUpdateActionItem(actionItem.boardId, actionItem.id);
  const deleteItem = useDeleteActionItem(actionItem.boardId, actionItem.id);

  useEffect(() => {
    if (value !== actionItem.value) {
      setValue(actionItem.value);
    }
  }, [actionItem.value, value]);

  useEffect(() => {
    if (checked !== actionItem.complete) {
      setChecked(actionItem.complete);
    }
  }, [actionItem.complete, checked]);

  const inputValueChanged = (event: ChangeEvent<HTMLInputElement>) => {
    update.mutate({ value: event.target.value });
  };

  const inputCheckedChanged = (event: ChangeEvent<HTMLInputElement>) => {
    update.mutate({ complete: event.target.checked });
  };

  return (
    <div className="border rounded w-full flex items-center" key={actionItem.id}>
      <div className="w-12 h-12 bg-gray-100 inline-flex items-center justify-center">
        <input type="checkbox" checked={checked} onChange={inputCheckedChanged} />
      </div>
      <div className="flex-1 h-full">
        <input className="py-2 px-4 h-full w-full" value={value} onChange={inputValueChanged} />
      </div>
      <div>
        <button className="px-2" onClick={() => deleteItem.mutate()}>
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function ActionItemsDialog({ active, closeDialog, boardId }: ActionItemsDialogProps) {
  const { data, isLoading } = useActionItems(boardId);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const create = useCreateActionItem(boardId);

  const submit = useCallback(
    (form: FormData) => {
      create.mutate(form.value, {
        onSuccess: () => {
          reset();
        },
      });
    },
    [create, reset],
  );

  return (
    <BaseDialog
      active={active}
      closeDialog={closeDialog}
      size="md"
      footer={() => (
        <form onSubmit={handleSubmit(submit)} className="w-full p-4">
          <TextInput
            hint="Press enter to submit"
            label="New Item"
            {...register('value')}
            placeholder="Action Item"
            name="value"
          />
        </form>
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-bold">Action Items</p>
          <div>
            <ImportActionItems boardId={boardId} />
          </div>
        </div>
        {isLoading && <Spinner />}
        <div className="flex flex-col w-full gap-3">
          {data?.map((actionItem) => (
            <ActionItemInput actionItem={actionItem} key={actionItem.id} />
          ))}
        </div>
      </div>
    </BaseDialog>
  );
}
