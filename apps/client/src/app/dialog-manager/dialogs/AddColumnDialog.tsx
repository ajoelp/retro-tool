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

  const footer = () => {
    return (
      <div>
        <Button variant="white" className="mr-2" onClick={closeDialog}>
          Close
        </Button>

        <Button
          variant="primary"
          onClick={() => confirmDialog(watch())}
          data-testid="save_column"
        >
          Create
        </Button>
      </div>
    );
  };

  return (
    <BaseDialog footer={footer} closeDialog={props.closeDialog}>
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
            data-testid="column_name_field"
            {...register('name', { required: true })}
          />
          <input />
        </form>
      </div>
    </BaseDialog>
  );
}
