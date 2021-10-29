import { DialogProps } from 'dialog-manager-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/inputs/TextInput';
import { BaseDialog } from './BaseDialog';

type ConfirmationDialogProps = {
  onSuccess?: (columnName: string) => void;
} & DialogProps;

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { active, onSuccess, closeDialog } = props;
  const { register, handleSubmit, watch } = useForm();

  const confirmDialog = (data: any) => {
    onSuccess?.(data.name);
    closeDialog();
  };

  return (
    <BaseDialog footer={() => <p>Hello</p>}>
      <h3
        className="text-lg leading-6 font-medium text-gray-900"
        id="modal-title"
      >
        Create Column
      </h3>
      <div className="mt-2">
        <form onSubmit={handleSubmit(confirmDialog)}>
          <TextInput
            label="What should the column be named?"
            type="text"
            required
            {...register('name', { required: true })}
          />
          <input />
        </form>
      </div>
    </BaseDialog>
  );
}
